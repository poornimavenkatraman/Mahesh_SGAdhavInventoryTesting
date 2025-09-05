// src/services/reports/stockSummary.service.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export interface StockSummaryRow {
  id: string;
  material: string;
  uom: string;

  stock_at_ho?: number;
  stock_available_at_site?: number;

  // Computed: HO + Sites (no longer reads stored total)
  total_stock: number;

  // Optional passthroughs (kept for compatibility)
  stock_requested_from_supplier?: number;
  stock_requested_by_site?: number;
  stock_dispatched_to_site?: number;
  stock_consumed_at_site?: number;
  stock_returned_from_site?: number;
  stock_return_accepted_from_site?: number;
}

type AnyRec = Record<string, unknown>;
const toNum = (v: unknown): number =>
  typeof v === "number" ? v : Number((v as any) ?? 0);

export async function fetchStockSummaryByMaterial(): Promise<
  StockSummaryRow[]
> {
  const snap = await getDocs(collection(db, "materials"));

  const rows: StockSummaryRow[] = [];
  snap.forEach((doc) => {
    const x = doc.data() as AnyRec;

    const stock_at_ho = toNum((x as any)?.stock_at_ho);
    const stock_available_at_site = toNum((x as any)?.stock_available_at_site);

    // ✅ Carefully computed total that matches your HO + Sites definition
    const total_stock = stock_at_ho + stock_available_at_site;

    rows.push({
      id: doc.id,
      material: ((x as any)?.material as string) || doc.id,
      uom: ((x as any)?.uom as string) || "",
      stock_at_ho,
      stock_available_at_site,
      total_stock,

      // passthroughs preserved
      stock_requested_from_supplier: toNum(
        (x as any)?.stock_requested_from_supplier
      ),
      stock_requested_by_site: toNum((x as any)?.stock_requested_by_site),
      stock_dispatched_to_site: toNum((x as any)?.stock_dispatched_to_site),
      stock_consumed_at_site: toNum((x as any)?.stock_consumed_at_site),
      stock_returned_from_site: toNum((x as any)?.stock_returned_from_site),
      stock_return_accepted_from_site: toNum(
        (x as any)?.stock_return_accepted_from_site
      ),
    });
  });

  rows.sort((a, b) => a.material.localeCompare(b.material));
  return rows;
}

/** CSV helper (unchanged) */
export function toCSV<T extends Record<string, any>>(
  rows: T[],
  columns: { key: keyof T | string; label: string }[]
): string {
  const esc = (val: unknown) => {
    if (val == null) return "";
    const s = String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => esc(c.label)).join(",");
  const lines = rows.map((r) =>
    columns.map((c) => esc(r[c.key as keyof T])).join(",")
  );
  return [header, ...lines].join("\n");
}
