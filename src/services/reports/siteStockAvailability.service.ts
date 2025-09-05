import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";

export interface SiteOption {
  id: string;
  label: string; // site name (and maybe city)
}

export interface RowByMaterial {
  category: string;
  material: string;
  uom: string;
  received: number;
  consumed: number;
  returned: number;
  available_at_site: number;
}

type AnyRec = Record<string, any>;
const toNum = (v: any) => (typeof v === "number" ? v : Number(v || 0));

/**
 * Get list of sites for the dropdown.
 * - No status filtering (to avoid accidental empty lists).
 * - Builds a safe label using site/name/site_name + optional city.
 * - Returns alphabetically sorted list.
 */
export async function fetchSites(): Promise<SiteOption[]> {
  try {
    const snap = await getDocs(collection(db, "sites"));
    const sites: SiteOption[] = [];

    snap.forEach((d) => {
      const x = d.data() as AnyRec;

      // Try common field names for label
      const base =
        (x?.site && String(x.site)) ||
        (x?.name && String(x.name)) ||
        (x?.site_name && String(x.site_name)) ||
        d.id;

      const label = x?.city ? `${base} — ${x.city}` : base;
      sites.push({ id: d.id, label });
    });

    // Sort by label for a nicer UX
    sites.sort((a, b) => a.label.localeCompare(b.label));
    return sites;
  } catch (e) {
    console.error("[fetchSites] failed:", e);
    return [];
  }
}

/** Build lookup maps for category and subcategory names */
async function buildCategoryLookups() {
  const catsSnap = await getDocs(collection(db, "categories"));
  const subsSnap = await getDocs(collection(db, "subcategories"));

  const categoryById = new Map<string, string>();
  catsSnap.forEach((d) => {
    const x = d.data() as AnyRec;
    categoryById.set(d.id, x?.category || d.id);
  });

  // For subcategory → categoryId resolution (even though we won't display subcategory)
  const subcategoryToCategoryId = new Map<string, string | null>();
  subsSnap.forEach((d) => {
    const x = d.data() as AnyRec;
    subcategoryToCategoryId.set(d.id, x?.category_id || null);
  });

  return { categoryById, subcategoryToCategoryId };
}

/**
 * REPORT: For a given site, list MATERIAL rows grouped by CATEGORY.
 * We read site_materials (per-material metrics), then join with materials
 * to get material name, uom, and resolve category via subcategory → category.
 */
export async function fetchSiteAvailabilityByCategory(
  siteId: string
): Promise<RowByMaterial[]> {
  if (!siteId) return [];

  const { categoryById, subcategoryToCategoryId } =
    await buildCategoryLookups();

  // 1) All site_materials for this site
  const smQ = query(
    collection(db, "site_materials"),
    where("site_id", "==", siteId)
  );
  const smSnap = await getDocs(smQ);

  // Gather metrics per material_id (in case there are multiple rows per material)
  const perMaterial = new Map<
    string,
    {
      received: number;
      consumed: number;
      returned: number;
      available_at_site: number;
    }
  >();

  smSnap.forEach((d) => {
    const x = d.data() as AnyRec;
    const mid = x?.material_id;
    if (!mid) return;

    const prev = perMaterial.get(mid) || {
      received: 0,
      consumed: 0,
      returned: 0,
      available_at_site: 0,
    };
    prev.received += toNum(x?.received);
    prev.consumed += toNum(x?.consumed);
    prev.returned += toNum(x?.returned);
    prev.available_at_site += toNum(x?.available_at_site);
    perMaterial.set(mid, prev);
  });

  if (!perMaterial.size) return [];

  // 2) Fetch required material docs (name, uom, subcategory_id)
  //    NOTE: For large sets, consider batching or denormalizing category_id into materials.
  const materialMeta = new Map<
    string,
    { material: string; uom: string; categoryName: string }
  >();

  await Promise.all(
    Array.from(perMaterial.keys()).map(async (mid) => {
      const mRef = doc(db, "materials", mid);
      const m = await getDoc(mRef);
      if (!m.exists()) {
        materialMeta.set(mid, {
          material: mid,
          uom: "",
          categoryName: "Uncategorized",
        });
        return;
      }
      const d = m.data() as AnyRec;
      const materialName = d?.material || mid;
      const uom = d?.uom || "";
      const subId: string | null = d?.subcategory_id || null;

      let categoryName = "Uncategorized";
      if (subId) {
        const catId = subcategoryToCategoryId.get(subId) || null;
        if (catId) {
          categoryName = categoryById.get(catId) || catId || "Uncategorized";
        }
      }

      materialMeta.set(mid, { material: materialName, uom, categoryName });
    })
  );

  // 3) Build rows: Category → Material
  const rows: RowByMaterial[] = [];
  perMaterial.forEach((vals, mid) => {
    const meta = materialMeta.get(mid) || {
      material: mid,
      uom: "",
      categoryName: "Uncategorized",
    };
    rows.push({
      category: meta.categoryName,
      material: meta.material,
      uom: meta.uom,
      received: vals.received,
      consumed: vals.consumed,
      returned: vals.returned,
      available_at_site: vals.available_at_site,
    });
  });

  // 4) Sort by Category, then Material
  rows.sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      a.material.localeCompare(b.material)
  );

  return rows;
}
