import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export interface RowByMaterialHO {
  category: string;
  material: string;
  uom: string;
  stock_at_ho: number;
}

type AnyRec = Record<string, any>;
const toNum = (v: any) => (typeof v === "number" ? v : Number(v || 0));

/** Build lookup maps for category and (subcat->category) */
async function buildCategoryLookups() {
  const catsSnap = await getDocs(collection(db, "categories"));
  const subsSnap = await getDocs(collection(db, "subcategories"));

  const categoryById = new Map<string, string>();
  catsSnap.forEach((d) => {
    const x = d.data() as AnyRec;
    categoryById.set(d.id, x?.category || d.id);
  });

  const subcategoryToCategoryId = new Map<string, string | null>();
  subsSnap.forEach((d) => {
    const x = d.data() as AnyRec;
    subcategoryToCategoryId.set(d.id, x?.category_id || null);
  });

  return { categoryById, subcategoryToCategoryId };
}

/** Main: list materials with stock_at_ho > 0, grouped by category */
export async function fetchHOAvailabilityByCategory(): Promise<
  RowByMaterialHO[]
> {
  const { categoryById, subcategoryToCategoryId } =
    await buildCategoryLookups();

  // Get all materials and filter client-side (simple & safe)
  const matsSnap = await getDocs(collection(db, "materials"));

  const rows: RowByMaterialHO[] = [];
  matsSnap.forEach((d) => {
    const x = d.data() as AnyRec;
    const ho = toNum(x?.stock_at_ho);
    if (ho <= 0) return; // show only > 0

    const subId: string | null = x?.subcategory_id || null;
    let categoryName = "Uncategorized";
    if (subId) {
      const catId = subcategoryToCategoryId.get(subId) || null;
      if (catId)
        categoryName = categoryById.get(catId) || catId || "Uncategorized";
    }

    rows.push({
      category: categoryName,
      material: x?.material || d.id,
      uom: x?.uom || "",
      stock_at_ho: ho,
    });
  });

  rows.sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      a.material.localeCompare(b.material)
  );

  return rows;
}
