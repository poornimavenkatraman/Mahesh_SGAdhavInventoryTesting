import { deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuthStore } from "@/stores/authStore";
import { collection, addDoc } from "firebase/firestore";
import { initializeWorkflowTracker } from "./workflowTrackerService";
import {
  clearAndCreateDummyData,
  clearCollectionsAndResetMaterialCounts,
} from "../createDummyDataService_workflows_denormalized";

const authStore = useAuthStore();

// Management user ID for created_by/updated_by
const MANAGEMENT_USER_ID = authStore.user?.uid; // Replace with actual ID

interface BaseData {
  categories?: {
    name: string;
    subcategories?: {
      name: string;
      materials?: string[];
    }[];
  }[];
  sites?: {
    name?: string;
    location?: string;
    city?: string;
    status?: string;
    start_date?: string | null;
    closed_date?: string | null;
  }[];
  suppliers?: string[];
}

export async function clearAndLoadAll(data: BaseData) {
  // await initializeWorkflowTracker();
  await clearCategories();
  await clearSubcategories();
  await clearMaterials();
  await clearSites();
  await clearUserSites();
  await clearSuppliers();

  await clearCollectionsAndResetMaterialCounts();

  await loadCategories(data);
  await loadSubcategories(data);
  await loadMaterials(data);
  await loadSites(data);
  await loadSuppliers(data);
}

export async function clearCategories() {
  const snapshot = await getDocs(collection(db, "categories"));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
}

export async function clearSubcategories() {
  const snapshot = await getDocs(collection(db, "subcategories"));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
}

export async function clearMaterials() {
  const snapshot = await getDocs(collection(db, "materials"));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
}

export async function clearSites() {
  const snapshot = await getDocs(collection(db, "sites"));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
}

export async function clearUserSites() {
  const snapshot = await getDocs(collection(db, "user_sites"));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
}

export async function clearSuppliers() {
  const snapshot = await getDocs(collection(db, "suppliers"));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
}

export async function loadCategories(data: BaseData) {
  const now = new Date();
  for (const cat of data.categories || []) {
    await addDoc(collection(db, "categories"), {
      category: cat.name,
      created_at: now,
      updated_at: now,
      created_by: MANAGEMENT_USER_ID,
      updated_by: MANAGEMENT_USER_ID,
    });
  }
}

export async function loadSubcategories(data: BaseData) {
  const now = new Date();
  for (const cat of data.categories || []) {
    const catSnapshot = await getDocs(collection(db, "categories"));
    const catDoc = catSnapshot.docs.find(
      (doc) => doc.data().category === cat.name
    );
    if (!catDoc) continue;
    for (const subcat of cat.subcategories || []) {
      await addDoc(collection(db, "subcategories"), {
        subcategory: subcat.name,
        category_id: catDoc.id,
        created_at: now,
        updated_at: now,
        created_by: MANAGEMENT_USER_ID,
        updated_by: MANAGEMENT_USER_ID,
      });
    }
  }
}

export async function loadMaterials(data: BaseData) {
  const now = new Date();
  for (const cat of data.categories || []) {
    const catSnapshot = await getDocs(collection(db, "categories"));
    const catDoc = catSnapshot.docs.find(
      (doc) => doc.data().category === cat.name
    );
    if (!catDoc) continue;
    for (const subcat of cat.subcategories || []) {
      const subcatSnapshot = await getDocs(collection(db, "subcategories"));
      const subcatDoc = subcatSnapshot.docs.find(
        (doc) =>
          doc.data().subcategory === subcat.name &&
          doc.data().category_id === catDoc.id
      );
      if (!subcatDoc) continue;
      for (const mat of subcat.materials || []) {
        await addDoc(collection(db, "materials"), {
          material: mat,
          subcategory_id: subcatDoc.id,
          uom: "Nos",
          stock_at_ho: 0,
          stock_requested_from_supplier: 0,
          stock_requested_by_site: 0,
          stock_dispatched_to_site: 0,
          stock_received_at_site: 0,
          stock_available_at_site: 0,
          stock_consumed_at_site: 0,
          stock_returned_from_site: 0,
          stock_return_accepted_from_site: 0,
          total_stock: 0,
          created_at: now,
          updated_at: now,
          created_by: MANAGEMENT_USER_ID,
          updated_by: MANAGEMENT_USER_ID,
        });
      }
    }
  }
}

export async function loadSites(data: BaseData) {
  const now = new Date();
  for (const site of data.sites || []) {
    await addDoc(collection(db, "sites"), {
      site: site.name || "",
      location: site.location || "",
      city: site.city || "",
      status: site.status || "Active",
      start_date: site.start_date || null,
      closed_date: site.closed_date || null,
      created_at: now,
      updated_at: now,
      created_by: MANAGEMENT_USER_ID,
      updated_by: MANAGEMENT_USER_ID,
    });
  }
}

export async function loadSuppliers(data: BaseData) {
  const now = new Date();
  for (const supplier of data.suppliers || []) {
    await addDoc(collection(db, "suppliers"), {
      suppliers_name: supplier || "",
      created_at: now,
      updated_at: now,
      created_by: MANAGEMENT_USER_ID,
      updated_by: MANAGEMENT_USER_ID,
    });
  }
}
