import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { toCSV } from "@/services/reports/stockSummary.service";
import {
  fetchAgingStockReport,
  type AgingRow,
} from "@/services/reports/agingStock.service";
import {
  fetchPendingSupplierRequests,
  type PendingRequestRow,
} from "@/services/reports/pendingSupplierRequests.service";

type AnyRec = Record<string, unknown>;
const toNum = (v: unknown): number =>
  typeof v === "number" ? v : Number((v as any) ?? 0);

/* ---------- Label caches ---------- */
const siteCache = new Map<string, string>();
const materialCache = new Map<string, { name: string; uom: string }>();

async function getSiteLabel(id: string): Promise<string> {
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

/* ---------- Types ---------- */
export interface RiskDashboardOptions {
  hoThreshold: number; // e.g. 10
  siteThreshold: number; // e.g. 5
  agingDays: number; // e.g. 90
  pendingDays: number; // e.g. 7
  siteId?: string; // optional: restrict "Low Site Stock" to a site
}

export interface LowHOStockRow {
  material_id: string;
  material: string;
  uom: string;
  stock_at_ho: number;
  available_at_sites: number;
  total_stock: number; // HO + Sites
}

export interface LowSiteStockRow {
  site_id: string;
  site_label: string;
  material_id: string;
  material: string;
  uom: string;
  available_at_site: number;
}

export interface AgingRiskRow {
  material_id: string;
  material: string;
  uom: string;
  days_inactive: number;
  total_stock: number; // (for context)
}

export interface PendingRiskRow {
  id: string;
  supplier_name: string;
  site_label: string;
  days_open: number;
  pending_total: number;
}

/* ---------- Low HO stock ---------- */
export async function fetchLowHOStock(
  hoThreshold: number
): Promise<LowHOStockRow[]> {
  const snap = await getDocs(collection(db, "materials"));
  const rows: LowHOStockRow[] = [];

  snap.forEach((d) => {
    const x = d.data() as AnyRec;
    const ho = toNum((x as any)?.stock_at_ho);
    const sites = toNum((x as any)?.stock_available_at_site);
    const total = ho + sites;

    if (ho <= hoThreshold) {
      rows.push({
        material_id: d.id,
        material: ((x as any)?.material as string) || d.id,
        uom: ((x as any)?.uom as string) || "",
        stock_at_ho: ho,
        available_at_sites: sites,
        total_stock: total,
      });
    }
  });

  rows.sort(
    (a, b) =>
      a.stock_at_ho - b.stock_at_ho || a.material.localeCompare(b.material)
  );
  return rows;
}

/* ---------- Low Site stock ---------- */
export async function fetchLowSiteStock(
  siteThreshold: number,
  siteId?: string
): Promise<LowSiteStockRow[]> {
  const base = collection(db, "site_materials");
  const q = siteId ? query(base, where("site_id", "==", siteId)) : base;
  const snap = await getDocs(q);

  const rows: LowSiteStockRow[] = [];

  for (const d of snap.docs) {
    const x = d.data() as AnyRec;
    const avail = toNum((x as any)?.available_at_site);
    if (avail > siteThreshold) continue;

    const sId = ((x as any)?.site_id as string) || "";
    const mId = ((x as any)?.material_id as string) || "";
    if (!sId || !mId) continue;

    const site_label = await getSiteLabel(sId);
    const meta = await getMaterialMeta(mId);

    rows.push({
      site_id: sId,
      site_label,
      material_id: mId,
      material: meta.name,
      uom: meta.uom,
      available_at_site: avail,
    });
  }

  rows.sort(
    (a, b) =>
      a.site_label.localeCompare(b.site_label) ||
      a.available_at_site - b.available_at_site ||
      a.material.localeCompare(b.material)
  );
  return rows;
}

/* ---------- Aging risk (reuse your aging service) ---------- */
export async function fetchAgingRisk(
  agingDays: number
): Promise<AgingRiskRow[]> {
  const rows = await fetchAgingStockReport(agingDays); // already filters qty > 0
  // Map to minimal risk shape
  return rows.map((r: AgingRow) => ({
    material_id: r.id,
    material: r.material,
    uom: r.uom,
    days_inactive: r.days_inactive,
    total_stock: (r as any).total_stock ?? 0,
  }));
}

/* ---------- Pending supplier risk (reuse pending service) ---------- */
export async function fetchPendingSupplierRisk(
  pendingDays: number
): Promise<PendingRiskRow[]> {
  const rows = await fetchPendingSupplierRequests(); // already keeps pending qty > 0
  return rows
    .filter((r) => (r.pending_total ?? 0) > 0 && r.days_open >= pendingDays)
    .map((r) => ({
      id: r.id,
      supplier_name: r.supplier_name,
      site_label: r.site_label,
      days_open: r.days_open,
      pending_total: r.pending_total ?? 0,
    }))
    .sort(
      (a, b) => b.pending_total - a.pending_total || b.days_open - a.days_open
    );
}

/* ---------- Aggregate for the dashboard ---------- */
export async function fetchRiskDashboard(opts: RiskDashboardOptions) {
  const [lowHO, lowSite, aging, pending] = await Promise.all([
    fetchLowHOStock(opts.hoThreshold),
    fetchLowSiteStock(opts.siteThreshold, opts.siteId),
    fetchAgingRisk(opts.agingDays),
    fetchPendingSupplierRisk(opts.pendingDays),
  ]);
  return { lowHO, lowSite, aging, pending };
}

/* ---------- CSV helpers per section ---------- */
export function csvLowHO(rows: LowHOStockRow[]) {
  const cols = [
    { key: "material", label: "Material" },
    { key: "uom", label: "UOM" },
    { key: "stock_at_ho", label: "Stock @ HO" },
    { key: "available_at_sites", label: "Available @ Sites" },
    { key: "total_stock", label: "Total (HO+Sites)" },
  ];
  return toCSV(rows as any[], cols as any);
}

export function csvLowSite(rows: LowSiteStockRow[]) {
  const cols = [
    { key: "site_label", label: "Site" },
    { key: "material", label: "Material" },
    { key: "uom", label: "UOM" },
    { key: "available_at_site", label: "Available @ Site" },
  ];
  return toCSV(rows as any[], cols as any);
}

export function csvAging(rows: AgingRiskRow[]) {
  const cols = [
    { key: "material", label: "Material" },
    { key: "uom", label: "UOM" },
    { key: "days_inactive", label: "Days Inactive" },
    { key: "total_stock", label: "Qty (HO+Sites)" },
  ];
  return toCSV(rows as any[], cols as any);
}

export function csvPending(rows: PendingRiskRow[]) {
  const cols = [
    { key: "supplier_name", label: "Supplier" },
    { key: "id", label: "Request ID" },
    { key: "site_label", label: "Site" },
    { key: "days_open", label: "Days Open" },
    { key: "pending_total", label: "Pending Qty" },
  ];
  return toCSV(rows as any[], cols as any);
}
