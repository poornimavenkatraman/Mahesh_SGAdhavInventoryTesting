import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export interface PendingRequestRow {
  id: string; // transaction id
  supplier_id: string | null;
  supplier_name: string; // resolved from suppliers
  site_id: string | null;
  site_label: string; // resolved from sites
  status: string; // normalized (lowercase)
  created_at_str: string;
  updated_at_str: string;
  days_open: number;
  // optional: totals for convenience
  requested_total?: number;
  received_total?: number;
  pending_total?: number;
}

export interface RequestItemRow {
  material_id: string;
  material_name: string;
  uom: string;
  qty_requested: number;
  qty_received: number;
  qty_pending: number;
}

type AnyRec = Record<string, unknown>;
const toNum = (v: unknown): number =>
  typeof v === "number" ? v : Number((v as any) ?? 0);

/* ---------- Timestamp helpers ---------- */
function parseConsoleTimestamp(s: string): Date | null {
  const re =
    /^\s*([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\s+at\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?\s*UTC([+-]\d{1,2})(?::?(\d{2}))?\s*$/;
  const m = s.match(re);
  if (!m) return null;

  const [
    ,
    monStr,
    dStr,
    yStr,
    hStr,
    minStr,
    secStr,
    ampm,
    offHourStr,
    offMinStr,
  ] = m;
  const months: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  const mon = months[monStr.toLowerCase()];
  if (mon == null) return null;

  let hour = parseInt(hStr, 10);
  const minute = parseInt(minStr, 10);
  const second = secStr ? parseInt(secStr, 10) : 0;

  if (ampm) {
    const A = ampm.toUpperCase();
    if (A === "PM" && hour < 12) hour += 12;
    if (A === "AM" && hour === 12) hour = 0;
  }

  const y = parseInt(yStr, 10);
  const d = parseInt(dStr, 10);

  const offH = parseInt(offHourStr, 10); // includes sign
  const sign = offH >= 0 ? 1 : -1;
  const absOffH = Math.abs(offH);
  const absOffM = offMinStr ? parseInt(offMinStr, 10) : 0;

  const utcMs = Date.UTC(
    y,
    mon,
    d,
    hour - sign * absOffH,
    minute - sign * absOffM,
    second,
    0
  );
  return new Date(utcMs);
}

function toDateAny(v: unknown): Date | null {
  if (!v) return null;
  if (typeof (v as any).toDate === "function") return (v as any).toDate(); // Firestore Timestamp
  if (typeof v === "object" && typeof (v as any).seconds === "number")
    return new Date((v as any).seconds * 1000);
  if (typeof v === "number") return new Date(v > 1e12 ? v : v * 1000);
  if (typeof v === "string") {
    const iso = new Date(v);
    if (!isNaN(iso.getTime())) return iso;
    const parsed = parseConsoleTimestamp(v);
    if (parsed) return parsed;
  }
  return null;
}

function diffInCalendarDays(a: Date, b: Date): number {
  const A = new Date(a);
  A.setHours(0, 0, 0, 0);
  const B = new Date(b);
  B.setHours(0, 0, 0, 0);
  return Math.floor((A.getTime() - B.getTime()) / (24 * 60 * 60 * 1000));
}

/* ---------- Label caches ---------- */
const supplierCache = new Map<string, string>();
const siteCache = new Map<string, string>();
const materialCache = new Map<string, { name: string; uom: string }>();

async function getSupplierName(id: string | null): Promise<string> {
  if (!id) return "—";
  if (supplierCache.has(id)) return supplierCache.get(id)!;
  const d = await getDoc(doc(db, "suppliers", id));
  let name = "—";
  if (d.exists()) {
    const x = d.data() as AnyRec;
    name =
      ((x as any)?.suppliers_name as string) ||
      ((x as any)?.name as string) ||
      id;
  }
  supplierCache.set(id, name);
  return name;
}

async function getSiteLabel(id: string | null): Promise<string> {
  if (!id) return "—";
  if (siteCache.has(id)) return siteCache.get(id)!;
  const d = await getDoc(doc(db, "sites", id));
  let label = id;
  if (d.exists()) {
    const x = d.data() as AnyRec;
    const base =
      (x as any)?.site?.toString?.() ||
      (x as any)?.name?.toString?.() ||
      (x as any)?.site_name?.toString?.() ||
      id;
    label = (x as any)?.city ? `${base} — ${(x as any).city}` : base;
  }
  siteCache.set(id, label);
  return label;
}

async function getMaterialMeta(
  id: string
): Promise<{ name: string; uom: string }> {
  if (materialCache.has(id)) return materialCache.get(id)!;
  const d = await getDoc(doc(db, "materials", id));
  let meta = { name: id, uom: "" };
  if (d.exists()) {
    const x = d.data() as AnyRec;
    meta = {
      name: ((x as any)?.material as string) || id,
      uom: ((x as any)?.uom as string) || "",
    };
  }
  materialCache.set(id, meta);
  return meta;
}

/* ---------- Pending rules ---------- */

// Keep these as the *pending-like* statuses if items[] is absent.
// (Adjust to match your exact lifecycle if needed.)
const PENDING_STATUSES = [
  "pending",
  "requested",
  "approved",
  "in_transit",
  "dispatched",
  "open",
  "partially_received",
];

// These are considered *closed/complete* and are always excluded.
const CLOSED_STATUSES = [
  "completed",
  "closed",
  "delivered",
  "received",
  "cancelled",
  "canceled",
  "rejected",
  "void",
  "fulfilled",
  "done",
  "archived",
];

/**
 * Fetch supplier requests that are *still pending*:
 * - must have supplier_id
 * - AND (if items exist) sum(qty_requested - qty_received) > 0
 * - ELSE (no items) status is in PENDING_STATUSES and not in CLOSED_STATUSES
 */
export async function fetchPendingSupplierRequests(): Promise<
  PendingRequestRow[]
> {
  const snap = await getDocs(collection(db, "material_transactions"));
  const now = new Date();
  const out: PendingRequestRow[] = [];

  for (const d of snap.docs) {
    const x = d.data() as AnyRec;

    // 1) Must be a supplier request
    const supplier_id = ((x as any)?.supplier_id as string) || null;
    if (!supplier_id) continue;

    // 2) Normalize status
    const rawStatus = ((x as any)?.current_status ?? "unknown") as string;
    const status = rawStatus.toString().trim().toLowerCase();

    // 3) If items exist, include only when total pending > 0
    const items = Array.isArray((x as any)?.items)
      ? ((x as any).items as any[])
      : [];
    let pendingTotal = 0;
    let requestedTotal = 0;
    let receivedTotal = 0;

    if (items.length) {
      for (const it of items) {
        const req = toNum(it?.qty_requested ?? it?.requested ?? it?.qty ?? 0);
        const rec = toNum(it?.qty_received ?? it?.received ?? 0);
        requestedTotal += req;
        receivedTotal += rec;
        pendingTotal += Math.max(0, req - rec);
      }
      if (pendingTotal <= 0) continue; // fully received -> exclude
    } else {
      // 4) No items[]: fall back to status gate; exclude closed statuses
      if (CLOSED_STATUSES.includes(status)) continue;
      if (!PENDING_STATUSES.includes(status)) continue;
    }

    const created =
      toDateAny((x as any)?.created_at) || toDateAny((x as any)?.updated_at);
    const updated = toDateAny((x as any)?.updated_at) || created;
    const daysOpen = created ? diffInCalendarDays(now, created) : 0;

    const site_id = ((x as any)?.site_id as string) || null;

    const supplier_name = await getSupplierName(supplier_id);
    const site_label = await getSiteLabel(site_id);

    out.push({
      id: d.id,
      supplier_id,
      supplier_name,
      site_id,
      site_label,
      status,
      created_at_str: created ? created.toLocaleDateString() : "N/A",
      updated_at_str: updated ? updated.toLocaleDateString() : "N/A",
      days_open: daysOpen,
      requested_total: requestedTotal || undefined,
      received_total: receivedTotal || undefined,
      pending_total: pendingTotal || undefined,
    });
  }

  // Sort: Supplier, then most pending first, then newest first
  out.sort(
    (a, b) =>
      a.supplier_name.localeCompare(b.supplier_name) ||
      (b.pending_total ?? 0) - (a.pending_total ?? 0) ||
      b.days_open - a.days_open
  );

  return out;
}

/**
 * Fetch and decorate *pending* line items for a given request.
 * Only returns items where qty_requested > qty_received.
 */
export async function fetchSupplierRequestItems(
  requestId: string
): Promise<RequestItemRow[]> {
  const tx = await getDoc(doc(db, "material_transactions", requestId));
  if (!tx.exists()) return [];

  const data = tx.data() as AnyRec;
  const items = (
    Array.isArray((data as any)?.items) ? ((data as any).items as any[]) : []
  )
    .map((it) => {
      const requested = toNum(
        it?.qty_requested ?? it?.requested ?? it?.qty ?? 0
      );
      const received = toNum(it?.qty_received ?? it?.received ?? 0);
      const pending = Math.max(0, requested - received);
      return { it, requested, received, pending };
    })
    .filter((r) => r.pending > 0); // keep only pending lines

  const out: RequestItemRow[] = [];
  for (const { it, requested, received, pending } of items) {
    const material_id = String((it?.material_id ?? it?.materialId ?? "") || "");
    if (!material_id) continue;

    const meta = await getMaterialMeta(material_id);

    out.push({
      material_id,
      material_name: meta.name,
      uom: meta.uom,
      qty_requested: requested,
      qty_received: received,
      qty_pending: pending,
    });
  }

  out.sort(
    (a, b) =>
      b.qty_pending - a.qty_pending ||
      a.material_name.localeCompare(b.material_name)
  );
  return out;
}
