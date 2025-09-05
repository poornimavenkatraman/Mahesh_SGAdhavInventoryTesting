import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/firebase";

export interface AgingRow {
  id: string;           // material_id
  material: string;
  uom: string;
  ho_stock: number;               // NEW
  available_at_sites: number;     // NEW
  total_stock: number;            // ho_stock + available_at_sites (or stored fallback)
  last_updated: string;           // display string
  days_inactive: number;
}

export interface MaterialSiteRow {
  site_id: string;
  site_label: string;
  received: number;
  consumed: number;
  returned: number;
  available_at_site: number;
}

function toNum(v: any) { return typeof v === "number" ? v : Number(v || 0); }

/** Firestore console string like: "August 27, 2025 at 12:42:50 PM UTC+5:30" */
function parseConsoleTimestamp(s: string): Date | null {
  const re = /^\s*([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\s+at\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?\s*UTC([+-]\d{1,2})(?::?(\d{2}))?\s*$/;
  const m = s.match(re);
  if (!m) return null;
  const [, monStr, dStr, yStr, hStr, minStr, secStr, ampm, offHourStr, offMinStr] = m;

  const months: Record<string, number> = {
    january:0,february:1,march:2,april:3,may:4,june:5,
    july:6,august:7,september:8,october:9,november:10,december:11,
  };
  const mon = months[monStr.toLowerCase()];
  if (mon == null) return null;

  let hour = parseInt(hStr,10);
  const minute = parseInt(minStr,10);
  const second = secStr ? parseInt(secStr,10) : 0;

  if (ampm) {
    const A = ampm.toUpperCase();
    if (A === "PM" && hour < 12) hour += 12;
    if (A === "AM" && hour === 12) hour = 0;
  }

  const y = parseInt(yStr,10);
  const d = parseInt(dStr,10);

  const offH = parseInt(offHourStr,10); // includes sign
  const sign = offH >= 0 ? 1 : -1;
  const absOffH = Math.abs(offH);
  const absOffM = offMinStr ? parseInt(offMinStr,10) : 0;

  const utcMs = Date.UTC(y, mon, d, hour - sign*absOffH, minute - sign*absOffM, second, 0);
  return new Date(utcMs);
}

function toDateAny(v: any): Date | null {
  if (!v) return null;
  if (typeof v.toDate === "function") return v.toDate();
  if (typeof v === "object" && typeof v.seconds === "number") return new Date(v.seconds * 1000);
  if (typeof v === "number") return new Date(v > 1e12 ? v : v * 1000);
  if (typeof v === "string") {
    const iso = new Date(v);
    if (!isNaN(iso.getTime())) return iso;
    return parseConsoleTimestamp(v);
  }
  return null;
}

function diffInCalendarDays(a: Date, b: Date): number {
  const A = new Date(a); A.setHours(0,0,0,0);
  const B = new Date(b); B.setHours(0,0,0,0);
  return Math.floor((A.getTime() - B.getTime()) / (24*60*60*1000));
}

/** Build a conservative total: prefer ho + sites; use stored total if that’s all you have */
function computeStocks(x: any) {
  const ho = toNum(x?.stock_at_ho);
  const sites = toNum(x?.stock_available_at_site);
  const total = ho + sites;        // ← always HO + Sites
  return { ho, sites, total };
}

/** Only include rows with quantity > 0 (total > 0) */
export async function fetchAgingStockReport(thresholdDays = 90): Promise<AgingRow[]> {
  const snap = await getDocs(collection(db, "materials"));
  const now = new Date();
  const rows: AgingRow[] = [];

  snap.forEach((d) => {
    const x = d.data() as any;

    const updatedAt = toDateAny(x?.updated_at) || toDateAny(x?.created_at);
    const daysInactive = updatedAt ? diffInCalendarDays(now, updatedAt) : Number.POSITIVE_INFINITY;

    const { ho, sites, total } = computeStocks(x);
    if (daysInactive >= thresholdDays && total > 0) {
      rows.push({
        id: d.id,
        material: x?.material || d.id,
        uom: x?.uom || "",
        ho_stock: ho,
        available_at_sites: sites,
        total_stock: total,
        last_updated: updatedAt ? updatedAt.toLocaleDateString() : "N/A",
        days_inactive: Number.isFinite(daysInactive) ? daysInactive : 9999,
      });
    }
  });

  rows.sort((a, b) => b.days_inactive - a.days_inactive);
  return rows;
}

export async function fetchMaterialSiteBreakdown(materialId: string): Promise<MaterialSiteRow[]> {
  if (!materialId) return [];
  const smQ = query(collection(db, "site_materials"), where("material_id", "==", materialId));
  const smSnap = await getDocs(smQ);

  const agg = new Map<string, MaterialSiteRow>();
  smSnap.forEach((d) => {
    const x = d.data() as any;
    const siteId = x?.site_id;
    if (!siteId) return;
    const prev = agg.get(siteId) || {
      site_id: siteId,
      site_label: siteId,
      received: 0, consumed: 0, returned: 0, available_at_site: 0,
    };
    prev.received += toNum(x?.received);
    prev.consumed += toNum(x?.consumed);
    prev.returned += toNum(x?.returned);
    prev.available_at_site += toNum(x?.available_at_site);
    agg.set(siteId, prev);
  });

  let rows = Array.from(agg.values()).filter(r => r.available_at_site > 0);
  if (!rows.length) return [];

  await Promise.all(rows.map(async (r) => {
    const sDoc = await getDoc(doc(db, "sites", r.site_id));
    if (sDoc.exists()) {
      const sx = sDoc.data() as any;
      const base =
        (sx?.site && String(sx.site)) ||
        (sx?.name && String(sx.name)) ||
        (sx?.site_name && String(sx.site_name)) ||
        r.site_id;
      r.site_label = sx?.city ? `${base} — ${sx.city}` : base;
    }
  }));

  rows.sort((a, b) => a.site_label.localeCompare(b.site_label));
  return rows;
}