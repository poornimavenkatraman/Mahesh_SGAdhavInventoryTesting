import {
  getDocs,
  query,
  where,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  setDoc,
  doc,
  increment,
} from "firebase/firestore";

import { db } from "@/firebase";
import { Role } from "@/utils/permissions";

export async function clearAndCreateDummyData() {
  await clearCollectionsAndResetMaterialCounts();
  // await generateDummyTransactions();
}

export async function clearCollectionsAndResetMaterialCounts() {
  // Helper to delete all docs in a collection
  async function deleteAllDocs(collectionName: string) {
    const snap = await getDocs(collection(db, collectionName));
    const batchSize = 500;
    let docs = snap.docs;
    while (docs.length) {
      const batch = docs.slice(0, batchSize);
      const batchPromises = batch.map((doc) => deleteDoc(doc.ref));
      await Promise.all(batchPromises);
      docs = docs.slice(batchSize);
    }
  }

  // Clear material_transactions and site_materials
  await deleteAllDocs("material_transactions");
  await deleteAllDocs("site_materials");
  await deleteAllDocs("workflows");

  // Reset counters in workflow_trackers collection
  const trackersSnap = await getDocs(collection(db, "workflow_trackers"));
  const trackerUpdatePromises = trackersSnap.docs.map((doc) =>
    updateDoc(doc.ref, { counter: 0 })
  );
  await Promise.all(trackerUpdatePromises);

  // Reset counts in materials collection
  const materialsSnap = await getDocs(collection(db, "materials"));
  const resetFields = {
    stock_requested_from_supplier: 0,
    stock_requested_by_site: 0,
    stock_at_ho: 0,
    stock_received_at_site: 0,
    stock_dispatched_to_site: 0,
    stock_available_at_site: 0,
    stock_consumed_at_site: 0,
    stock_returned_from_site: 0,
    stock_return_accepted_from_site: 0,
    total_stock: 0,
    updated_at: new Date(),
  };
  const updatePromises = materialsSnap.docs.map((doc) =>
    updateDoc(doc.ref, resetFields)
  );
  await Promise.all(updatePromises);
}

async function getAllMaterialIds() {
  const snap = await getDocs(collection(db, "materials"));
  return snap.docs.map((doc) => doc.id);
}
// removed extra closing brace

export async function getRandomIds() {
  // Get random supplier
  const suppliersSnap = await getDocs(collection(db, "suppliers"));
  const suppliers = suppliersSnap.docs;
  const supplierId = suppliers.length
    ? suppliers[Math.floor(Math.random() * suppliers.length)].id
    : null;

  // Get random site
  const sitesSnap = await getDocs(collection(db, "sites"));
  const sites = sitesSnap.docs;
  const siteId = sites.length
    ? sites[Math.floor(Math.random() * sites.length)].id
    : null;

  // Get random HO Staff user
  const hoStaffSnap = await getDocs(
    query(collection(db, "users"), where("role", "==", "HO Staff"))
  );
  const hoStaff = hoStaffSnap.docs;
  const hoStaffId = hoStaff.length
    ? hoStaff[Math.floor(Math.random() * hoStaff.length)].id
    : null;

  // Get random Site Staff user
  const siteStaffSnap = await getDocs(
    query(collection(db, "users"), where("role", "==", Role.SiteStaff))
  );
  const siteStaff = siteStaffSnap.docs;
  const siteStaffId = siteStaff.length
    ? siteStaff[Math.floor(Math.random() * siteStaff.length)].id
    : null;

  return {
    supplierId,
    siteId,
    hoStaffId,
    siteStaffId,
  };
}

/**
 * Gets the next tracker id for a given request type and increments the counter in Firestore.
 * @param trackerType One of 'SUP_REQ', 'SITE_REQ', 'SITE_CON', 'SITE_RET'
 * @returns The next id as a string
 */
export async function getNextTrackerId(trackerType: string): Promise<string> {
  const trackerRef = doc(collection(db, "workflow_trackers"), trackerType);
  const trackerSnap = await getDoc(trackerRef);
  let nextId = "";
  if (trackerSnap.exists()) {
    const current = trackerSnap.data().counter ?? 0;
    nextId = String(current + 1);
    await updateDoc(trackerRef, { counter: increment(1) });
  } else {
    nextId = "1";
    await setDoc(trackerRef, { counter: 1 });
  }
  return nextId;
}

export async function createRestockRequest({
  supplierId,
  siteId,
  hoStaffId,
  materialIds,
}: {
  supplierId: string;
  siteId: string;
  hoStaffId: string;
  materialIds: string[];
}) {
  const stockArr = materialIds.map((id) => ({
    material_id: id,
    quantity: Math.floor(Math.random() * 100) + 1,
  }));

  // Get current counter value

  const workflowTrackerId = "SUP_REQ_" + (await getNextTrackerId("SUP_REQ"));

  const mainWorkflowTrackerId =
    "SUP_WORKFLOW_" + (await getNextTrackerId("SUP_WORKFLOW"));

  const workflowDocRef = await addDoc(collection(db, "workflows"), {
    site_id: null,
    workflow_tracker_id: mainWorkflowTrackerId,
    supplier_id: supplierId,
    current_status: "Restock Request",
    created_at: new Date(),
    updated_at: new Date(),
    workflows: [
      {
        workflow_tracker_id: workflowTrackerId,
        status: "Restock Request",
        no_of_materials: stockArr.length,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  for (const stock of stockArr) {
    await addDoc(collection(db, "material_transactions"), {
      workflow_tracker_id: workflowTrackerId,
      workflow_id: workflowDocRef.id,
      material_id: stock.material_id,
      quantity: stock.quantity,
      created_by: hoStaffId,
      updated_by: hoStaffId,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  for (const stock of stockArr) {
    const materialRef = collection(db, "materials");
    const docRef = doc(materialRef, stock.material_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
    } else {
      const docData = docSnap.data() as {
        stock_requested_from_supplier?: number;
        stock_requested_by_site?: number;
        stock_at_ho?: number;
        stock_dispatched_to_site?: number;
        stock_available_at_site?: number;
        stock_consumed_at_site?: number;
        stock_returned_from_site?: number;
        total_stock?: number;
      };
      await updateDoc(docRef, {
        stock_requested_from_supplier:
          (docData.stock_requested_from_supplier ?? 0) + stock.quantity,
        updated_at: new Date(),
        updated_by: hoStaffId,
      });
    }
  }
}

export async function createRestockRequestCancelled({
  supplierId,
  siteId,
  hoStaffId,
  materialIds,
}: {
  supplierId: string;
  siteId: string;
  hoStaffId: string;
  materialIds: string[];
}) {
  const stockArr = materialIds.map((id) => ({
    material_id: id,
    quantity: Math.floor(Math.random() * 100) + 1,
  }));

  // Get current counter value

  const workflowTrackerId_1 = "SUP_REQ_" + (await getNextTrackerId("SUP_REQ"));
  const workflowTrackerId_2 = "SUP_REQ_" + (await getNextTrackerId("SUP_REQ"));

  const mainWorkflowTrackerId =
    "SUP_WORKFLOW_" + (await getNextTrackerId("SUP_WORKFLOW"));

  const workflowDocRef = await addDoc(collection(db, "workflows"), {
    site_id: null,
    workflow_tracker_id: mainWorkflowTrackerId,
    supplier_id: supplierId,
    current_status: "Restock Cancelled",
    created_at: new Date(),
    updated_at: new Date(),
    workflows: [
      {
        workflow_tracker_id: workflowTrackerId_1,
        status: "Restock Request",
        no_of_materials: stockArr.length,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        workflow_tracker_id: workflowTrackerId_2,
        status: "Restock Cancelled",
        no_of_materials: stockArr.length,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  [workflowTrackerId_1, workflowTrackerId_2].forEach(
    async (workflowTrackerId) => {
      for (const stock of stockArr) {
        await addDoc(collection(db, "material_transactions"), {
          workflow_tracker_id: workflowTrackerId,
          workflow_id: workflowDocRef.id,
          material_id: stock.material_id,
          quantity: stock.quantity,
          created_by: hoStaffId,
          updated_by: hoStaffId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
  );

  for (const stock of stockArr) {
    const materialRef = collection(db, "materials");
    const docRef = doc(materialRef, stock.material_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
    } else {
      const docData = docSnap.data() as {
        stock_requested_from_supplier?: number;
        stock_requested_by_site?: number;
        stock_at_ho?: number;
        stock_dispatched_to_site?: number;
        stock_available_at_site?: number;
        stock_consumed_at_site?: number;
        stock_returned_from_site?: number;
        total_stock?: number;
      };
      await updateDoc(docRef, {
        stock_requested_from_supplier: 0,
        updated_at: new Date(),
        updated_by: hoStaffId,
      });
    }
  }
}

export async function createRestockRequestAndRestocked({
  supplierId,
  siteId,
  hoStaffId,
  materialIds,
}: {
  supplierId: string;
  siteId: string;
  hoStaffId: string;
  materialIds: string[];
}) {
  const stockArr = materialIds.map((id) => ({
    material_id: id,
    quantity: Math.floor(Math.random() * 100) + 1,
  }));

  const workflowTrackerId_1 = "SUP_REQ_" + (await getNextTrackerId("SUP_REQ"));
  const workflowTrackerId_2 = "SUP_REQ_" + (await getNextTrackerId("SUP_REQ"));

  const mainWorkflowTrackerId =
    "SUP_WORKFLOW_" + (await getNextTrackerId("SUP_WORKFLOW"));

  const workflowDocRef = await addDoc(collection(db, "workflows"), {
    site_id: null,
    workflow_tracker_id: mainWorkflowTrackerId,
    supplier_id: supplierId,
    current_status: "Restocked",
    created_at: new Date(),
    updated_at: new Date(),
    workflows: [
      {
        workflow_tracker_id: workflowTrackerId_1,
        status: "Restock Request",
        no_of_materials: stockArr.length,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        workflow_tracker_id: workflowTrackerId_2,
        status: "Restocked",
        no_of_materials: stockArr.length,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  [workflowTrackerId_1, workflowTrackerId_2].forEach(
    async (workflowTrackerId) => {
      for (const stock of stockArr) {
        await addDoc(collection(db, "material_transactions"), {
          workflow_tracker_id: workflowTrackerId,
          workflow_id: workflowDocRef.id,
          material_id: stock.material_id,
          quantity: stock.quantity,
          created_by: hoStaffId,
          updated_by: hoStaffId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
  );

  for (const stock of stockArr) {
    const materialRef = collection(db, "materials");
    const docRef = doc(materialRef, stock.material_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
    } else {
      const docData = docSnap.data() as {
        stock_requested_from_supplier?: number;
        stock_requested_by_site?: number;
        stock_at_ho?: number;
        stock_dispatched_to_site?: number;
        stock_available_at_site?: number;
        stock_consumed_at_site?: number;
        stock_returned_from_site?: number;
        total_stock?: number;
      };
      await updateDoc(docRef, {
        stock_at_ho: (docData.stock_at_ho ?? 0) + stock.quantity,
        total_stock: (docData.total_stock ?? 0) + stock.quantity,
        updated_at: new Date(),
        updated_by: hoStaffId,
      });
    }
  }
}

export async function createSiteRequested({
  siteId,
  hoStaffId,
  siteStaffId,
  materialIds,
}: {
  siteId: string;
  hoStaffId: string;
  siteStaffId: string;
  materialIds: string[];
}) {
  const stockArr = materialIds.map((id) => ({
    material_id: id,
    quantity: Math.floor(Math.random() * 100) + 1,
  }));

  const workflowTrackerId = "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));

  const mainWorkflowTrackerId =
    "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));

  const workflowDocRef = await addDoc(collection(db, "workflows"), {
    site_id: siteId,
    workflow_tracker_id: mainWorkflowTrackerId,
    supplier_id: null,
    current_status: "Requested",
    created_at: new Date(),
    updated_at: new Date(),
    workflows: [
      {
        workflow_tracker_id: workflowTrackerId,
        status: "Requested",
        no_of_materials: stockArr.length,
        created_by: siteStaffId,
        updated_by: siteStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  for (const stock of stockArr) {
    await addDoc(collection(db, "material_transactions"), {
      workflow_tracker_id: workflowTrackerId,
      workflow_id: workflowDocRef.id,
      material_id: stock.material_id,
      quantity: stock.quantity,
      created_by: hoStaffId,
      updated_by: hoStaffId,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  for (const stock of stockArr) {
    const siteMaterialQuery = query(
      collection(db, "site_materials"),
      where("site_id", "==", siteId),
      where("material_id", "==", stock.material_id)
    );
    const snap = await getDocs(siteMaterialQuery);

    let data: {
      site_id: string;
      material_id: string;
      created_by?: string;
      updated_by: string;
      created_at?: Date;
      updated_at: Date;
      dispatched?: number;
      received?: number;
      consumed?: number;
      returned?: number;
      return_accepted?: number;
      available_at_site?: number;
      requested?: number;
    } = {
      site_id: siteId,
      material_id: stock.material_id,
      updated_by: hoStaffId,
      updated_at: new Date(),
    };

    if (snap.empty) {
      data = {
        ...data,
        requested: stock.quantity,
        dispatched: 0,
        received: 0,
        consumed: 0,
        returned: 0,
        return_accepted: 0,
        available_at_site: 0,
        created_at: new Date(),
        created_by: hoStaffId,
      };
      await addDoc(collection(db, "site_materials"), data);
    } else {
      const docRef = snap.docs[0].ref;
      data = {
        ...data,
        requested: (data.requested ?? 0) + stock.quantity,
      };
      await updateDoc(docRef, data);
    }

    const materialRef = collection(db, "materials");
    const docRef = doc(materialRef, stock.material_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
    } else {
      const docData = docSnap.data() as {
        stock_requested_from_supplier?: number;
        stock_requested_by_site?: number;
        stock_at_ho?: number;
        stock_dispatched_to_site?: number;
        stock_available_at_site?: number;
        stock_consumed_at_site?: number;
        stock_returned_from_site?: number;
        total_stock?: number;
      };
      await updateDoc(docRef, {
        stock_requested_by_site:
          (docData.stock_requested_by_site ?? 0) + stock.quantity,
        updated_at: new Date(),
        updated_by: siteStaffId,
      });
    }
  }
}

export async function createSiteDispatched({
  siteId,
  hoStaffId,
  siteStaffId,
  materialIds,
}: {
  siteId: string;
  hoStaffId: string;
  siteStaffId: string;
  materialIds: string[];
}) {
  const stockArr = materialIds.map((id) => ({
    material_id: id,
    quantity: Math.floor(Math.random() * 100) + 1,
  }));

  const workflowTrackerId_1 =
    "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
  const workflowTrackerId_2 =
    "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));

  const mainWorkflowTrackerId =
    "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));

  const workflowDocRef = await addDoc(collection(db, "workflows"), {
    site_id: siteId,
    workflow_tracker_id: mainWorkflowTrackerId,
    supplier_id: null,
    current_status: "Dispatched",
    created_at: new Date(),
    updated_at: new Date(),
    workflows: [
      {
        status: "Requested",
        workflow_tracker_id: workflowTrackerId_1,
        no_of_materials: stockArr.length,
        created_by: siteStaffId,
        updated_by: siteStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        status: "Dispatched",
        workflow_tracker_id: workflowTrackerId_2,
        no_of_materials: stockArr.length,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  [workflowTrackerId_1, workflowTrackerId_2].forEach(
    async (workflowTrackerId) => {
      for (const stock of stockArr) {
        await addDoc(collection(db, "material_transactions"), {
          workflow_tracker_id: workflowTrackerId,
          workflow_id: workflowDocRef.id,
          material_id: stock.material_id,
          quantity: stock.quantity,
          created_by: hoStaffId,
          updated_by: hoStaffId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
  );

  for (const stock of stockArr) {
    const siteMaterialQuery = query(
      collection(db, "site_materials"),
      where("site_id", "==", siteId),
      where("material_id", "==", stock.material_id)
    );
    const snap = await getDocs(siteMaterialQuery);

    let data: {
      site_id: string;
      material_id: string;
      created_by?: string;
      updated_by: string;
      created_at?: Date;
      updated_at: Date;
      dispatched?: number;
      received?: number;
      consumed?: number;
      returned?: number;
      return_accepted?: number;
      available_at_site?: number;
      requested?: number;
    } = {
      site_id: siteId,
      material_id: stock.material_id,
      updated_by: hoStaffId,
      updated_at: new Date(),
    };

    if (snap.empty) {
      data = {
        ...data,
        requested: 0,
        dispatched: stock.quantity,
        received: 0,
        consumed: 0,
        returned: 0,
        return_accepted: 0,
        available_at_site: 0,
        created_at: new Date(),
        created_by: hoStaffId,
      };
      await addDoc(collection(db, "site_materials"), data);
    } else {
      const docRef = snap.docs[0].ref;
      data = {
        ...data,
        // requested: (data.requested ?? 0) - stock.quantity,
        dispatched: (data.dispatched ?? 0) + stock.quantity,
      };
      await updateDoc(docRef, data);
    }

    const materialRef = collection(db, "materials");
    const docRef = doc(materialRef, stock.material_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
    } else {
      const docData = docSnap.data() as {
        stock_requested_from_supplier?: number;
        stock_requested_by_site?: number;
        stock_at_ho?: number;
        stock_dispatched_to_site?: number;
        stock_available_at_site?: number;
        stock_consumed_at_site?: number;
        stock_returned_from_site?: number;
        total_stock?: number;
      };
      await updateDoc(docRef, {
        stock_dispatched_to_site:
          (docData.stock_dispatched_to_site ?? 0) + stock.quantity,
        // stock_at_ho: (docData.stock_at_ho ?? 0) + stock.quantity,
        total_stock: (docData.total_stock ?? 0) + stock.quantity,
        updated_at: new Date(),
        updated_by: hoStaffId,
      });
    }
  }
}

export async function createSiteReceived({
  siteId,
  hoStaffId,
  siteStaffId,
  materialIds,
}: {
  siteId: string;
  hoStaffId: string;
  siteStaffId: string;
  materialIds: string[];
}) {
  const stockArr = materialIds.map((id) => ({
    material_id: id,
    quantity: Math.floor(Math.random() * 100) + 1,
  }));

  const workflowTrackerId_1 =
    "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
  const workflowTrackerId_2 =
    "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
  const workflowTrackerId_3 =
    "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));

  const mainWorkflowTrackerId =
    "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));

  const workflowDocRef = await addDoc(collection(db, "workflows"), {
    site_id: siteId,
    workflow_tracker_id: mainWorkflowTrackerId,
    supplier_id: null,
    current_status: "Received",
    created_at: new Date(),
    updated_at: new Date(),
    workflows: [
      {
        status: "Requested",
        workflow_tracker_id: workflowTrackerId_1,
        no_of_materials: stockArr.length,
        created_by: siteStaffId,
        updated_by: siteStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        status: "Dispatched",
        workflow_tracker_id: workflowTrackerId_2,
        no_of_materials: stockArr.length,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        status: "Received",
        workflow_tracker_id: workflowTrackerId_3,
        no_of_materials: stockArr.length,
        created_by: siteStaffId,
        updated_by: siteStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  [workflowTrackerId_1, workflowTrackerId_2, workflowTrackerId_3].forEach(
    async (workflowTrackerId) => {
      for (const stock of stockArr) {
        await addDoc(collection(db, "material_transactions"), {
          workflow_tracker_id: workflowTrackerId,
          workflow_id: workflowDocRef.id,
          material_id: stock.material_id,
          quantity: stock.quantity,
          created_by: hoStaffId,
          updated_by: hoStaffId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
  );

  for (const stock of stockArr) {
    const siteMaterialQuery = query(
      collection(db, "site_materials"),
      where("site_id", "==", siteId),
      where("material_id", "==", stock.material_id)
    );
    const snap = await getDocs(siteMaterialQuery);

    let data: {
      site_id: string;
      material_id: string;
      created_by?: string;
      updated_by: string;
      created_at?: Date;
      updated_at: Date;
      dispatched?: number;
      received?: number;
      consumed?: number;
      returned?: number;
      return_accepted?: number;
      available_at_site?: number;
      requested?: number;
    } = {
      site_id: siteId,
      material_id: stock.material_id,
      updated_by: hoStaffId,
      updated_at: new Date(),
    };

    if (snap.empty) {
      data = {
        ...data,
        requested: 0,
        dispatched: 0,
        received: stock.quantity,
        consumed: 0,
        returned: 0,
        return_accepted: 0,
        available_at_site: stock.quantity,
        created_at: new Date(),
        created_by: hoStaffId,
      };
      await addDoc(collection(db, "site_materials"), data);
    } else {
      const docRef = snap.docs[0].ref;
      data = {
        ...data,
        // dispatched: (data.dispatched ?? 0) - stock.quantity,
        received: (data.received ?? 0) + stock.quantity,
        available_at_site: (data.available_at_site ?? 0) + stock.quantity,
      };
      await updateDoc(docRef, data);
    }

    const materialRef = collection(db, "materials");
    const docRef = doc(materialRef, stock.material_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
    } else {
      const docData = docSnap.data() as {
        stock_requested_from_supplier?: number;
        stock_requested_by_site?: number;
        stock_at_ho?: number;
        stock_dispatched_to_site?: number;
        stock_available_at_site?: number;
        stock_consumed_at_site?: number;
        stock_returned_from_site?: number;
        total_stock?: number;
      };
      await updateDoc(docRef, {
        // stock_at_ho: (docData.stock_at_ho ?? 0) + stock.quantity,
        total_stock: (docData.total_stock ?? 0) + stock.quantity,
        stock_available_at_site:
          (docData.stock_available_at_site ?? 0) + stock.quantity,
        updated_at: new Date(),
        updated_by: siteStaffId,
      });
    }
  }
}

export async function createSiteRequestCancelled({
  siteId,
  hoStaffId,
  siteStaffId,
  materialIds,
}: {
  siteId: string;
  hoStaffId: string;
  siteStaffId: string;
  materialIds: string[];
}) {
  const stockArr = materialIds.map((id) => ({
    material_id: id,
    quantity: Math.floor(Math.random() * 100) + 1,
  }));

  const workflowTrackerId_1 =
    "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
  const workflowTrackerId_2 =
    "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));

  const mainWorkflowTrackerId =
    "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));

  const workflowDocRef = await addDoc(collection(db, "workflows"), {
    site_id: siteId,
    workflow_tracker_id: mainWorkflowTrackerId,
    supplier_id: null,
    current_status: "Request Cancelled",
    created_at: new Date(),
    updated_at: new Date(),
    workflows: [
      {
        status: "Requested",
        workflow_tracker_id: workflowTrackerId_1,
        no_of_materials: stockArr.length,
        created_by: siteStaffId,
        updated_by: siteStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        status: "Request Cancelled",
        workflow_tracker_id: workflowTrackerId_2,
        no_of_materials: stockArr.length,
        created_by: siteStaffId,
        updated_by: siteStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  [workflowTrackerId_1, workflowTrackerId_2].forEach(
    async (workflowTrackerId) => {
      for (const stock of stockArr) {
        await addDoc(collection(db, "material_transactions"), {
          workflow_tracker_id: workflowTrackerId,
          workflow_id: workflowDocRef.id,
          material_id: stock.material_id,
          quantity: stock.quantity,
          created_by: siteStaffId,
          updated_by: siteStaffId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
  );

  for (const stock of stockArr) {
    const siteMaterialQuery = query(
      collection(db, "site_materials"),
      where("site_id", "==", siteId),
      where("material_id", "==", stock.material_id)
    );
    const snap = await getDocs(siteMaterialQuery);

    if (snap.empty) {
      await addDoc(collection(db, "site_materials"), {
        site_id: siteId,
        material_id: stock.material_id,
        requested: 0,
        dispatched: 0,
        received: 0,
        consumed: 0,
        returned: 0,
        return_accepted: 0,
        available_at_site: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: hoStaffId,
        updated_by: hoStaffId,
      });
    }
  }
}

export async function createSiteRequestDeclined({
  siteId,
  hoStaffId,
  siteStaffId,
  materialIds,
}: {
  siteId: string;
  hoStaffId: string;
  siteStaffId: string;
  materialIds: string[];
}) {
  const stockArr = materialIds.map((id) => ({
    material_id: id,
    quantity: Math.floor(Math.random() * 100) + 1,
  }));

  const workflowTrackerId_1 =
    "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
  const workflowTrackerId_2 =
    "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));

  const mainWorkflowTrackerId =
    "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));

  const workflowDocRef = await addDoc(collection(db, "workflows"), {
    site_id: siteId,
    workflow_tracker_id: mainWorkflowTrackerId,
    supplier_id: null,
    current_status: "Request Declined",
    created_at: new Date(),
    updated_at: new Date(),
    workflows: [
      {
        status: "Requested",
        workflow_tracker_id: workflowTrackerId_1,
        no_of_materials: stockArr.length,
        created_by: siteStaffId,
        updated_by: siteStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        status: "Request Declined",
        workflow_tracker_id: workflowTrackerId_2,
        no_of_materials: stockArr.length,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  [workflowTrackerId_1, workflowTrackerId_2].forEach(
    async (workflowTrackerId) => {
      for (const stock of stockArr) {
        await addDoc(collection(db, "material_transactions"), {
          workflow_tracker_id: workflowTrackerId,
          workflow_id: workflowDocRef.id,
          material_id: stock.material_id,
          quantity: stock.quantity,
          created_by:
            workflowTrackerId === workflowTrackerId_1 ? siteStaffId : hoStaffId,
          updated_by:
            workflowTrackerId === workflowTrackerId_1 ? siteStaffId : hoStaffId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
  );

  for (const stock of stockArr) {
    const siteMaterialQuery = query(
      collection(db, "site_materials"),
      where("site_id", "==", siteId),
      where("material_id", "==", stock.material_id)
    );
    const snap = await getDocs(siteMaterialQuery);

    if (snap.empty) {
      await addDoc(collection(db, "site_materials"), {
        site_id: siteId,
        material_id: stock.material_id,
        requested: 0,
        dispatched: 0,
        received: 0,
        consumed: 0,
        returned: 0,
        return_accepted: 0,
        available_at_site: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: hoStaffId,
        updated_by: hoStaffId,
      });
    }
  }
}

export async function createSiteStockConsumed({
  hoStaffId,
  siteStaffId,
}: {
  hoStaffId: string;
  siteStaffId: string;
}) {
  //   const stockArr = materialIds.map((id) => ({
  //     material_id: id,
  //     quantity: Math.floor(Math.random() * 100) + 1,
  //   }));

  const materialsSnap = await getDocs(
    query(
      collection(db, "site_materials"),
      //   where("site_id", "==", siteId),
      where("available_at_site", ">=", 2)
    )
  );

  const stockArr = materialsSnap.docs.slice(0, 5).map((doc) => ({
    material_id: doc.data().material_id,
    quantity: 1,
    site_id: doc.data().site_id,
  }));

  for (const stock of stockArr) {
    const workflowTrackerId =
      "SITE_CON_" + (await getNextTrackerId("SITE_CON"));

    const mainWorkflowTrackerId =
      "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));

    const workflowDocRef = await addDoc(collection(db, "workflows"), {
      site_id: stock.site_id,
      workflow_tracker_id: mainWorkflowTrackerId,
      supplier_id: null,
      current_status: "Consumed",
      created_at: new Date(),
      updated_at: new Date(),
      workflows: [
        {
          workflow_tracker_id: workflowTrackerId,
          no_of_materials: 1,
          status: "Consumed",
          created_by: siteStaffId,
          updated_by: siteStaffId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    });

    await addDoc(collection(db, "material_transactions"), {
      workflow_tracker_id: workflowTrackerId,
      workflow_id: workflowDocRef.id,
      material_id: stock.material_id,
      quantity: stock.quantity,
      created_by: hoStaffId,
      updated_by: hoStaffId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const siteMaterialQuery = query(
      collection(db, "site_materials"),
      where("site_id", "==", stock.site_id),
      where("material_id", "==", stock.material_id)
    );
    const snap = await getDocs(siteMaterialQuery);

    let data: {
      site_id: string;
      material_id: string;
      created_by?: string;
      updated_by: string;
      created_at?: Date;
      updated_at: Date;
      dispatched?: number;
      received?: number;
      consumed?: number;
      returned?: number;
      return_accepted?: number;
      available_at_site?: number;
      requested?: number;
    } = {
      site_id: stock.site_id,
      material_id: stock.material_id,
      updated_by: hoStaffId,
      updated_at: new Date(),
    };

    if (snap.empty) {
    } else {
      const docRef = snap.docs[0].ref;
      const docData = snap.docs[0].data();
      data = {
        ...data,
        consumed: (docData.consumed ?? 0) + stock.quantity,
        available_at_site: (docData.available_at_site ?? 0) - stock.quantity,
      };

      await updateDoc(docRef, data);
    }

    const materialRef = collection(db, "materials");
    const docRef = doc(materialRef, stock.material_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
    } else {
      const docData = docSnap.data() as {
        stock_requested_from_supplier?: number;
        stock_requested_by_site?: number;
        stock_at_ho?: number;
        stock_dispatched_to_site?: number;
        stock_available_at_site?: number;
        stock_consumed_at_site?: number;
        stock_returned_from_site?: number;
        total_stock?: number;
      };
      await updateDoc(docRef, {
        total_stock: (docData.total_stock ?? 0) - stock.quantity,
        stock_available_at_site:
          (docData.stock_available_at_site ?? 0) - stock.quantity,
        stock_consumed_at_site:
          (docData.stock_consumed_at_site ?? 0) + stock.quantity,
        updated_at: new Date(),
        updated_by: siteStaffId,
      });
    }
  }
}

export async function createSiteStockReturned({
  hoStaffId,
  siteStaffId,
}: {
  hoStaffId: string;
  siteStaffId: string;
}) {
  const materialsSnap = await getDocs(
    query(
      collection(db, "site_materials"),
      //   where("site_id", "==", siteId),
      where("available_at_site", ">=", 2)
    )
  );

  const stockArr = materialsSnap.docs.slice(0, 5).map((doc) => ({
    material_id: doc.data().material_id,
    quantity: 1,
    site_id: doc.data().site_id,
  }));

  for (const stock of stockArr) {
    const workflowTrackerId =
      "SITE_RET_" + (await getNextTrackerId("SITE_RET"));

    const mainWorkflowTrackerId =
      "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));

    const workflowDocRef = await addDoc(collection(db, "workflows"), {
      site_id: stock.site_id,
      workflow_tracker_id: mainWorkflowTrackerId,
      supplier_id: null,
      current_status: "Returned",
      created_at: new Date(),
      updated_at: new Date(),
      workflows: [
        {
          workflow_tracker_id: workflowTrackerId,
          no_of_materials: 1,
          status: "Returned",
          created_by: siteStaffId,
          updated_by: siteStaffId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    });

    await addDoc(collection(db, "material_transactions"), {
      workflow_tracker_id: workflowTrackerId,
      workflow_id: workflowDocRef.id,
      material_id: stock.material_id,
      quantity: stock.quantity,
      created_by: hoStaffId,
      updated_by: hoStaffId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const siteMaterialQuery = query(
      collection(db, "site_materials"),
      where("site_id", "==", stock.site_id),
      where("material_id", "==", stock.material_id)
    );
    const snap = await getDocs(siteMaterialQuery);

    let data: {
      site_id: string;
      material_id: string;
      created_by?: string;
      updated_by: string;
      created_at?: Date;
      updated_at: Date;
      dispatched?: number;
      received?: number;
      consumed?: number;
      returned?: number;
      return_accepted?: number;
      available_at_site?: number;
      requested?: number;
    } = {
      site_id: stock.site_id,
      material_id: stock.material_id,
      updated_by: hoStaffId,
      updated_at: new Date(),
    };

    if (snap.empty) {
    } else {
      const docRef = snap.docs[0].ref;
      const docData = snap.docs[0].data();
      data = {
        ...data,
        returned: (docData.returned ?? 0) + stock.quantity,
        available_at_site: (docData.available_at_site ?? 0) - stock.quantity,
      };
      await updateDoc(docRef, data);
    }

    const materialRef = collection(db, "materials");
    const docRef = doc(materialRef, stock.material_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
    } else {
      const docData = docSnap.data() as {
        stock_requested_from_supplier?: number;
        stock_requested_by_site?: number;
        stock_at_ho?: number;
        stock_dispatched_to_site?: number;
        stock_available_at_site?: number;
        stock_consumed_at_site?: number;
        stock_returned_from_site?: number;
        total_stock?: number;
      };
      await updateDoc(docRef, {
        // total_stock: (docData.total_stock ?? 0) + stock.quantity,
        stock_available_at_site:
          (docData.stock_available_at_site ?? 0) - stock.quantity,
        stock_returned_from_site:
          (docData.stock_returned_from_site ?? 0) + stock.quantity,
        updated_at: new Date(),
        updated_by: siteStaffId,
      });
    }
  }
}

export async function createSiteStockReturnAccepted({
  hoStaffId,
  siteStaffId,
}: {
  hoStaffId: string;
  siteStaffId: string;
}) {
  const returnedWorkflows = query(
    collection(db, "workflows"),
    where("current_status", "==", "Returned")
  );
  const returnedWorkflowsSnap = await getDocs(returnedWorkflows);

  for (const txnDoc of returnedWorkflowsSnap.docs.slice(0, 2)) {
    const txnData = txnDoc.data();

    const workflowTrackerId =
      "SITE_RET_" + (await getNextTrackerId("SITE_RET"));

    const newWorkflow = {
      workflow_tracker_id: workflowTrackerId,
      no_of_materials: 1,
      status: "Return Accepted",
      created_by: hoStaffId,
      updated_by: hoStaffId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await updateDoc(txnDoc.ref, {
      workflows: [...txnData.workflows, newWorkflow],
      current_status: "Return Accepted",
      updated_at: new Date(),
      updated_by: hoStaffId,
    });

    const materialTxnSnap = await getDocs(
      query(
        collection(db, "material_transactions"),
        where("workflow_id", "==", txnData.id)
      )
    );

    for (const txnDoc of materialTxnSnap.docs) {
      const data = txnDoc.data();

      await addDoc(collection(db, "material_transactions"), {
        workflow_tracker_id: workflowTrackerId,
        workflow_id: data.workflow_id,
        material_id: data.material_id,
        quantity: data.quantity,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const siteMaterialQuery = query(
        collection(db, "site_materials"),
        where("site_id", "==", txnData.site_id),
        where("material_id", "==", data.material_id)
      );
      const snap = await getDocs(siteMaterialQuery);

      let siteMaterialData: {
        site_id: string;
        material_id: string;
        created_by?: string;
        updated_by: string;
        created_at?: Date;
        updated_at: Date;
        dispatched?: number;
        received?: number;
        consumed?: number;
        returned?: number;
        return_accepted?: number;
        available_at_site?: number;
        requested?: number;
      } = {
        site_id: txnData.site_id,
        material_id: data.material_id,
        updated_by: hoStaffId,
        updated_at: new Date(),
      };

      if (snap.empty) {
      } else {
        const docRef = snap.docs[0].ref;
        const docData = snap.docs[0].data();
        siteMaterialData = {
          ...siteMaterialData,
          returned: (docData.returned ?? 0) - data.quantity,
        };
        await updateDoc(docRef, siteMaterialData);
      }

      const materialRef = collection(db, "materials");
      const docRef = doc(materialRef, data.material_id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
      } else {
        const docData = docSnap.data() as {
          stock_requested_from_supplier?: number;
          stock_requested_by_site?: number;
          stock_at_ho?: number;
          stock_dispatched_to_site?: number;
          stock_available_at_site?: number;
          stock_consumed_at_site?: number;
          stock_returned_from_site?: number;
          total_stock?: number;
        };
        await updateDoc(docRef, {
          // total_stock: (docData.total_stock ?? 0) + stock.quantity,
          stock_available_at_site:
            (docData.stock_available_at_site ?? 0) - data.quantity,
          stock_returned_from_site:
            (docData.stock_returned_from_site ?? 0) + data.quantity,
          updated_at: new Date(),
          updated_by: siteStaffId,
        });
      }
    }
  }
}

export async function createSiteStockReturnCancelled({
  hoStaffId,
  siteStaffId,
}: {
  hoStaffId: string;
  siteStaffId: string;
}) {
  const returnedWorkflows = query(
    collection(db, "workflows"),
    where("current_status", "==", "Returned")
  );
  const returnedWorkflowsSnap = await getDocs(returnedWorkflows);

  for (const txnDoc of returnedWorkflowsSnap.docs.slice(0, 2)) {
    const txnData = txnDoc.data();

    const workflowTrackerId =
      "SITE_RET_" + (await getNextTrackerId("SITE_RET"));

    const newWorkflow = {
      workflow_tracker_id: workflowTrackerId,
      no_of_materials: 1,
      status: "Return Cancelled",
      created_by: siteStaffId,
      updated_by: siteStaffId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await updateDoc(txnDoc.ref, {
      workflows: [...txnData.workflows, newWorkflow],
      current_status: "Return Cancelled",
      updated_at: new Date(),
      updated_by: siteStaffId,
    });

    const materialTxnSnap = await getDocs(
      query(
        collection(db, "material_transactions"),
        where("workflow_id", "==", txnData.id)
      )
    );

    for (const txnDoc of materialTxnSnap.docs) {
      const data = txnDoc.data();

      await addDoc(collection(db, "material_transactions"), {
        workflow_tracker_id: workflowTrackerId,
        workflow_id: data.workflow_id,
        material_id: data.material_id,
        quantity: data.quantity,
        created_by: siteStaffId,
        updated_by: siteStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const siteMaterialQuery = query(
        collection(db, "site_materials"),
        where("site_id", "==", txnData.site_id),
        where("material_id", "==", data.material_id)
      );
      const snap = await getDocs(siteMaterialQuery);

      let siteMaterialData: {
        site_id: string;
        material_id: string;
        created_by?: string;
        updated_by: string;
        created_at?: Date;
        updated_at: Date;
        dispatched?: number;
        received?: number;
        consumed?: number;
        returned?: number;
        return_accepted?: number;
        available_at_site?: number;
        requested?: number;
      } = {
        site_id: txnData.site_id,
        material_id: data.material_id,
        updated_by: hoStaffId,
        updated_at: new Date(),
      };

      if (snap.empty) {
      } else {
        const docRef = snap.docs[0].ref;
        const docData = snap.docs[0].data();
        siteMaterialData = {
          ...siteMaterialData,
          returned: (docData.returned ?? 0) - data.quantity,
          available_at_site: (docData.available_at_site ?? 0) + data.quantity,
        };
        await updateDoc(docRef, siteMaterialData);
      }

      const materialRef = collection(db, "materials");
      const docRef = doc(materialRef, data.material_id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
      } else {
        const docData = docSnap.data() as {
          stock_requested_from_supplier?: number;
          stock_requested_by_site?: number;
          stock_at_ho?: number;
          stock_dispatched_to_site?: number;
          stock_available_at_site?: number;
          stock_consumed_at_site?: number;
          stock_returned_from_site?: number;
          total_stock?: number;
        };
        await updateDoc(docRef, {
          // total_stock: (docData.total_stock ?? 0) + stock.quantity,
          stock_available_at_site:
            (docData.stock_available_at_site ?? 0) + data.quantity,
          stock_returned_from_site:
            (docData.stock_returned_from_site ?? 0) - data.quantity,
          updated_at: new Date(),
          updated_by: siteStaffId,
        });
      }
    }
  }
}

export async function createSiteStockReturnDeclined({
  hoStaffId,
  siteStaffId,
}: {
  hoStaffId: string;
  siteStaffId: string;
}) {
  const returnedWorkflows = query(
    collection(db, "workflows"),
    where("current_status", "==", "Returned")
  );
  const returnedWorkflowsSnap = await getDocs(returnedWorkflows);

  for (const txnDoc of returnedWorkflowsSnap.docs.slice(0, 2)) {
    const txnData = txnDoc.data();

    const workflowTrackerId =
      "SITE_RET_" + (await getNextTrackerId("SITE_RET"));

    const newWorkflow = {
      workflow_tracker_id: workflowTrackerId,
      no_of_materials: 1,
      status: "Return Declined",
      created_by: hoStaffId,
      updated_by: hoStaffId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await updateDoc(txnDoc.ref, {
      workflows: [...txnData.workflows, newWorkflow],
      current_status: "Return Declined",
      updated_at: new Date(),
      updated_by: hoStaffId,
    });

    const materialTxnSnap = await getDocs(
      query(
        collection(db, "material_transactions"),
        where("workflow_id", "==", txnData.id)
      )
    );

    for (const txnDoc of materialTxnSnap.docs) {
      const data = txnDoc.data();

      await addDoc(collection(db, "material_transactions"), {
        workflow_tracker_id: workflowTrackerId,
        workflow_id: data.workflow_id,
        material_id: data.material_id,
        quantity: data.quantity,
        created_by: hoStaffId,
        updated_by: hoStaffId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const siteMaterialQuery = query(
        collection(db, "site_materials"),
        where("site_id", "==", txnData.site_id),
        where("material_id", "==", data.material_id)
      );
      const snap = await getDocs(siteMaterialQuery);

      let siteMaterialData: {
        site_id: string;
        material_id: string;
        created_by?: string;
        updated_by: string;
        created_at?: Date;
        updated_at: Date;
        dispatched?: number;
        received?: number;
        consumed?: number;
        returned?: number;
        return_accepted?: number;
        available_at_site?: number;
        requested?: number;
      } = {
        site_id: txnData.site_id,
        material_id: data.material_id,
        updated_by: hoStaffId,
        updated_at: new Date(),
      };

      if (snap.empty) {
      } else {
        const docRef = snap.docs[0].ref;
        const docData = snap.docs[0].data();
        siteMaterialData = {
          ...siteMaterialData,
          returned: (docData.returned ?? 0) - data.quantity,
          available_at_site: (docData.available_at_site ?? 0) + data.quantity,
        };
        await updateDoc(docRef, siteMaterialData);
      }

      const materialRef = collection(db, "materials");
      const docRef = doc(materialRef, data.material_id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
      } else {
        const docData = docSnap.data() as {
          stock_requested_from_supplier?: number;
          stock_requested_by_site?: number;
          stock_at_ho?: number;
          stock_dispatched_to_site?: number;
          stock_available_at_site?: number;
          stock_consumed_at_site?: number;
          stock_returned_from_site?: number;
          total_stock?: number;
        };
        await updateDoc(docRef, {
          // total_stock: (docData.total_stock ?? 0) + stock.quantity,
          stock_available_at_site:
            (docData.stock_available_at_site ?? 0) + data.quantity,
          stock_returned_from_site:
            (docData.stock_returned_from_site ?? 0) - data.quantity,
          updated_at: new Date(),
          updated_by: siteStaffId,
        });
      }
    }
  }
}
export async function generateDummyTransactions() {
  const materialIds = await getAllMaterialIds();

  for (let i = 0; i < 10; i++) {
    const { supplierId, siteId, hoStaffId, siteStaffId } = await getRandomIds();
    const randomMaterials = materialIds
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 10) + 1); // 1-10 materials

    // Only proceed if all IDs are present
    if (!supplierId || !siteId || !hoStaffId || !siteStaffId) continue;

    await createRestockRequest({
      supplierId,
      siteId,
      hoStaffId,
      materialIds: randomMaterials,
    });

    await createRestockRequestAndRestocked({
      supplierId,
      siteId,
      hoStaffId,
      materialIds: randomMaterials,
    });

    await createRestockRequestCancelled({
      supplierId,
      siteId,
      hoStaffId,
      materialIds: randomMaterials,
    });

    await createSiteRequested({
      siteId,
      hoStaffId,
      siteStaffId,
      materialIds: randomMaterials,
    });

    await createSiteRequestCancelled({
      siteId,
      hoStaffId,
      siteStaffId,
      materialIds: randomMaterials,
    });

    await createSiteRequestDeclined({
      siteId,
      hoStaffId,
      siteStaffId,
      materialIds: randomMaterials,
    });

    await createSiteDispatched({
      siteId,
      hoStaffId,
      siteStaffId,
      materialIds: randomMaterials,
    });

    await createSiteReceived({
      siteId,
      hoStaffId,
      siteStaffId,
      materialIds: randomMaterials,
    });
  }
  const { hoStaffId, siteStaffId } = await getRandomIds();

  if (hoStaffId && siteStaffId) {
    await createSiteStockConsumed({
      hoStaffId,
      siteStaffId,
    });

    await createSiteStockReturned({
      hoStaffId,
      siteStaffId,
    });

    await createSiteStockReturnAccepted({
      hoStaffId,
      siteStaffId,
    });

    await createSiteStockReturnCancelled({
      hoStaffId,
      siteStaffId,
    });

    await createSiteStockReturnDeclined({
      hoStaffId,
      siteStaffId,
    });
  }
}
