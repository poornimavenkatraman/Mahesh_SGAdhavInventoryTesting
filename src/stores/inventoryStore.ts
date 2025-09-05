import { defineStore } from "pinia";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  where,
  query,
  documentId,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { useSiteStore } from "@/stores/siteStore";
import { getNextTrackerId } from "@/services/createDummyDataService_workflows_denormalized";
import { useAuthStore } from "./authStore";
import { useMessageStore } from "./messageStore";
const messageStore = useMessageStore();

export const useInventoryStore = defineStore("inventory", {
  state: () => ({
    categories: [] as any[],
    subcategories: [] as any[],
    materials: [] as any[],

    subcategoriesByCategoryList: [] as any[],
    materialsBySubcategoryList: [] as any[],

    subcategoriesByIds: [] as any[],
    categoriesByIds: [] as any[],
    materialsByIds: [] as any[],

    workflows: [] as any[],
    activeSitesWorkflows: [] as any[],
    supplierWorkflows: [] as any[],
    siteWorkflows: [] as any[],

    suppliers: [] as any[],
    supplier: null as any,
    materialTransactions: [] as any[],
    loading: false,
    lastFetched: null as number | null,
  }),
  actions: {
    async addSubcategory(
      subcategoryName: string,
      categoryId: string,
      desc = ""
    ) {
      const name = subcategoryName.trim();
      if (!name) throw new Error("Subcategory name cannot be empty.");
      if (!categoryId) throw new Error("Category must be selected.");
      if (
        this.subcategories.some(
          (s) =>
            s.subcategory.toLowerCase() === name.toLowerCase() &&
            s.category_id === categoryId
        )
      ) {
        throw new Error("Subcategory already exists for this category.");
      }
      // Optionally check if categoryId exists
      if (!this.categories.some((c) => c.id === categoryId)) {
        throw new Error("Selected category does not exist.");
      }
      const docRef = await addDoc(collection(db, "subcategories"), {
        subcategory: name,
        category_id: categoryId,
        desc: desc,
      });
      await this.fetchSubcategories();
      return docRef.id;
    },
    async updateSubcategory(
      subcategoryId: string,
      newName: string,
      categoryId: string,
      desc = ""
    ) {
      const name = newName.trim();
      if (!name) throw new Error("Subcategory name cannot be empty.");
      if (!categoryId) throw new Error("Category must be selected.");
      if (
        this.subcategories.some(
          (s) =>
            s.subcategory.toLowerCase() === name.toLowerCase() &&
            s.category_id === categoryId &&
            s.id !== subcategoryId
        )
      ) {
        throw new Error("Subcategory already exists for this category.");
      }
      if (!this.categories.some((c) => c.id === categoryId)) {
        throw new Error("Selected category does not exist.");
      }
      try {
        await (
          await import("firebase/firestore")
        ).updateDoc(
          (
            await import("firebase/firestore")
          ).doc(db, "subcategories", subcategoryId),
          { subcategory: name, category_id: categoryId, desc }
        );
        await this.fetchSubcategories();
      } catch (err) {
        console.error("Error updating subcategory:", err);
        throw err;
      }
    },
    async deleteSubcategory(subcategoryId: string) {
      try {
        await (
          await import("firebase/firestore")
        ).deleteDoc(
          (
            await import("firebase/firestore")
          ).doc(db, "subcategories", subcategoryId)
        );
        await this.fetchSubcategories();
      } catch (err) {
        console.error("Error deleting subcategory:", err);
        throw err;
      }
    },

    async addCategory(categoryName: string) {
      const name = categoryName.trim();
      if (!name) throw new Error("Category name cannot be empty.");
      if (
        this.categories.some(
          (c) => c.category.toLowerCase() === name.toLowerCase()
        )
      ) {
        throw new Error("Category already exists.");
      }
      const docRef = await addDoc(collection(db, "categories"), {
        category: name,
      });
      await this.fetchCategories();
      return docRef.id;
    },
    async updateCategory(categoryId: string, newName: string) {
      const name = newName.trim();
      if (!name) throw new Error("Category name cannot be empty.");
      if (
        this.categories.some(
          (c) =>
            c.category.toLowerCase() === name.toLowerCase() &&
            c.id !== categoryId
        )
      ) {
        throw new Error("Category Name already exists.");
      }
      try {
        await (
          await import("firebase/firestore")
        ).updateDoc(
          (
            await import("firebase/firestore")
          ).doc(db, "categories", categoryId),
          { category: name }
        );
        await this.fetchCategories();
      } catch (err) {
        console.error("Error updating category:", err);
        throw err;
      }
    },
    async deleteCategory(categoryId: string) {
      try {
        await (
          await import("firebase/firestore")
        ).deleteDoc(
          (await import("firebase/firestore")).doc(db, "categories", categoryId)
        );
        await this.fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        throw err;
      }
    },

    async fetchCategories() {
      this.loading = true;
      const snap = await getDocs(collection(db, "categories"));
      this.categories = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchCategoriesByIds(categoryIds: string[]) {
      this.loading = true;
      const categoriesQuery = query(
        collection(db, "categories"),
        where(documentId(), "in", categoryIds)
      );
      const snap = await getDocs(categoriesQuery);
      this.categoriesByIds = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSubcategoriesByCategory(categoryId: string) {
      this.loading = true;
      const subcatQuery = query(
        collection(db, "subcategories"),
        where("category_id", "==", categoryId)
      );
      const snap = await getDocs(subcatQuery);
      this.subcategoriesByCategoryList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSubcategories() {
      this.loading = true;
      const snap = await getDocs(collection(db, "subcategories"));
      this.subcategories = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSubcategoriesByIds(subcategoryIds: string[]) {
      this.loading = true;
      const subcatQuery = query(
        collection(db, "subcategories"),
        where(documentId(), "in", subcategoryIds)
      );
      const snap = await getDocs(subcatQuery);
      this.subcategoriesByIds = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchMaterials() {
      this.loading = true;
      await this.fetchCategories();
      await this.fetchSubcategories();

      const snap = await getDocs(collection(db, "materials"));
      const materialsData: any = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Also keep subcategory name, id and category name, id
      this.materials = materialsData.map(
        (material: { subcategory_id: any }) => {
          const subcategory = this.subcategories.find(
            (sub) => sub.id === material.subcategory_id
          );
          const category = this.categories.find(
            (cat) => cat.id === subcategory?.category_id
          );
          return {
            ...material,
            subcategory_name: subcategory?.subcategory || "",
            subcategory_id: subcategory?.id || "",
            category_name: category?.category || "",
            category_id: category?.id || "",
          };
        }
      );

      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchMaterialsByIds(materialIds: string[]) {
      this.loading = true;
      await this.fetchCategories();
      await this.fetchSubcategories();

      const materialsQuery = query(
        collection(db, "materials"),
        where(documentId(), "in", materialIds)
      );
      const snap = await getDocs(materialsQuery);
      const materialsData: any = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Also keep subcategory name, id and category name, id
      this.materialsByIds = materialsData.map(
        (material: { subcategory_id: any }) => {
          const subcategory = this.subcategories.find(
            (sub) => sub.id === material.subcategory_id
          );
          const category = this.categories.find(
            (cat) => cat.id === subcategory?.category_id
          );
          return {
            ...material,
            subcategory_name: subcategory?.subcategory || "",
            subcategory_id: subcategory?.id || "",
            category_name: category?.category || "",
            category_id: category?.id || "",
          };
        }
      );

      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchMaterialsBySubcategory(subcategoryId: string) {
      this.loading = true;
      const subcatQuery = query(
        collection(db, "materials"),
        where("subcategory_id", "==", subcategoryId)
      );
      const snap = await getDocs(subcatQuery);
      this.materialsBySubcategoryList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSuppliers() {
      this.loading = true;
      const snap = await getDocs(collection(db, "suppliers"));
      this.suppliers = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSupplierById(supplierId: string) {
      const docRef = doc(db, "suppliers", supplierId);
      const snap = await getDoc(docRef);
      this.supplier = snap.exists()
        ? { id: snap.id, ...snap.data() }
        : { id: snap.id, suppliers_name: "" };
    },
    addSupplier: async function (
      nameOrObj: string | { name: string; contact?: string; address?: string },
      contact?: string,
      address?: string
    ) {
      this.loading = true;
      let name = "";
      let contactVal = "";
      let addressVal = "";
      if (typeof nameOrObj === "object" && nameOrObj !== null) {
        name = nameOrObj.name || "";
        contactVal = nameOrObj.contact ?? "";
        addressVal = nameOrObj.address ?? "";
      } else {
        name = nameOrObj;
        contactVal = contact ?? "";
        addressVal = address ?? "";
      }
      try {
        const docRef = await addDoc(collection(db, "suppliers"), {
          suppliers_name: name,
          contact: contactVal,
          address: addressVal,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } catch (err) {
        console.error("Error adding supplier:", err);
      } finally {
        this.loading = false;
      }
      return {
        message: "Supplier Added successfully",
        route: "/home",
      };
    },

    async fetchWorkflows() {
      this.loading = true;
      const snap = await getDocs(collection(db, "workflows"));
      this.workflows = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchWorkflowById(workflowId: string) {
      this.loading = true;
      try {
        const docRef = doc(db, "workflows", workflowId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          // Return the full Firestore document object for workflows collection
          const data = snap.data();
          return {
            id: snap.id,
            ...data,
          };
        } else {
          throw new Error("Workflow not found.");
        }
      } catch (err) {
        console.error("Error fetching workflow by ID:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchMaterialTransactionsByWorkflowTrackerId(
      workflowTrackerId: string
    ) {
      this.loading = true;
      const txQuery = query(
        collection(db, "material_transactions"),
        where("workflow_tracker_id", "==", workflowTrackerId)
      );
      const snap = await getDocs(txQuery);
      this.materialTransactions = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },

    async fetchSupplierWorkflows() {
      this.loading = true;
      const supplierStatuses = [
        "Restock Request",
        "Restocked",
        "Restock Cancelled",
      ];

      const txQuery = query(
        collection(db, "workflows"),
        where("current_status", "in", supplierStatuses)
      );

      const snap = await getDocs(txQuery);
      this.supplierWorkflows = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchActiveSitesWorkflows() {
      this.loading = true;
      // Get active site IDs from siteStore
      const siteStore = useSiteStore();
      const activeSiteIds = siteStore.accessibleSites.map(
        (site: any) => site.id
      );

      let transactions: any[] = [];
      if (activeSiteIds.length > 0) {
        // Firestore 'in' query for site_id
        const txQuery = query(
          collection(db, "workflows"),
          where("site_id", "in", activeSiteIds)
        );
        const snap = await getDocs(txQuery);
        transactions = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
      this.activeSitesWorkflows = transactions;
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSiteWorkflows(siteId: string) {
      this.loading = true;

      const txQuery = query(
        collection(db, "workflows"),
        where("site_id", "==", siteId)
      );

      const snap = await getDocs(txQuery);
      this.siteWorkflows = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },

    async addInventoryItem(payload: {
      MATERIAL_NAME: string;
      CATEGORY: string;
      SUBCATEGORY: string;
      UOM: string;
    }) {
      this.loading = true;
      try {
        await addDoc(collection(db, "materials"), {
          material: payload.MATERIAL_NAME,
          category_id: payload.CATEGORY,
          subcategory_id: payload.SUBCATEGORY,
          uom: payload.UOM,
        });
        // Optionally, refresh materials list
        await this.fetchMaterials();
      } catch (err) {
        console.error("Error adding inventory item:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    // async addStock(payload: {
    //   SUPPLIER_NAME: string;
    //   CATEGORY: string;
    //   SUBCATEGORY: string;
    //   MATERIAL: string;
    //   QUANTITY: number;
    //   ORDERED_DATE: string;
    //   RECEIVED_DATE: string;
    //   DESCRIPTION: string;
    //   UOM: string;
    // }) {
    //   this.loading = true;
    //   try {
    //     await addDoc(collection(db, "inventory"), payload);
    //     // Optionally, refresh inventory list
    //     await this.fetchWorkflows();
    //   } catch (err) {
    //     console.error("Error adding stock:", err);
    //     throw err;
    //   } finally {
    //     this.loading = false;
    //   }
    // },
    async addMaterialsToSubcategories(
      subcategoryIds: string[],
      materialIds: string[]
    ) {
      // Validation
      if (
        !Array.isArray(subcategoryIds) ||
        !Array.isArray(materialIds) ||
        !subcategoryIds.length ||
        !materialIds.length
      ) {
        throw new Error(
          "Please select at least one subcategory and one material."
        );
      }
      // Check for duplicates
      const existing = this.materials.filter(
        (m) =>
          subcategoryIds.includes(m.subcategory_id) &&
          materialIds.includes(m.id)
      );
      if (existing.length) {
        throw new Error(
          "Some selected materials already exist in the chosen subcategories."
        );
      }
      // Add each material to each subcategory
      for (const subId of subcategoryIds) {
        for (const matId of materialIds) {
          // Find material by id
          const mat = this.materials.find((m) => m.id === matId);
          if (!mat) throw new Error("Material not found.");
          // Add new material document for this subcategory
          await addDoc(collection(db, "materials"), {
            material: mat.material,
            category_id: mat.category_id,
            subcategory_id: subId,
            uom: mat.uom || "",
          });
        }
      }
      await this.fetchMaterials();
    },

    // Supplier Transactions
    async submitSupplierRestockRequest(payload: {
      supplierId: string;
      materialId: string;
      quantity: number;
      requestDate: string;
      deliveryDate: string;
      comments: string;
    }) {
      this.loading = true;

      try {
        const authStore = useAuthStore();
        const hoStaffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SUP_WORKFLOW_" + (await getNextTrackerId("SUP_WORKFLOW"));
        const workflowTrackerId =
          "SUP_REQ_" + (await getNextTrackerId("SUP_REQ"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: null,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: payload.supplierId,
            current_status: "Restock Request",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: hoStaffId,
            updated_by: hoStaffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Restock Request",
                no_of_materials: 1,

                request_date: payload.requestDate,
                delivery_date: payload.deliveryDate,
                comments: payload.comments,
                created_by: hoStaffId,
                updated_by: hoStaffId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          const materialTxRef = doc(collection(db, "material_transactions"));
          transaction.set(materialTxRef, {
            workflow_tracker_id: workflowTrackerId,
            workflow_id: workflowRef.id,
            material_id: payload.materialId,
            quantity: payload.quantity,
            created_by: hoStaffId,
            updated_by: hoStaffId,
            created_at: new Date(),
            updated_at: new Date(),
          });

          // Update material stock_requested_from_supplier
          const materialRef = doc(db, "materials", payload.materialId);
          const materialSnap = await getDoc(materialRef);
          if (materialSnap.exists()) {
            const docData = materialSnap.data() as {
              stock_requested_from_supplier?: number;
            };
            transaction.update(materialRef, {
              stock_requested_from_supplier:
                (docData.stock_requested_from_supplier ?? 0) + payload.quantity,
              updated_at: new Date(),
              updated_by: hoStaffId,
            });
          }
        });
        // await this.fetchWorkflows();
        this.$patch({ loading: false });
        return {
          message: "Re-Stock Requested successfully",
          route:
            "/home/supplier-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=Home",
        };
      } catch (err) {
        messageStore.showMessage(
          (err as Error).message || "Failed to request restock.",
          "error"
        );
        console.error("Error adding stock:", err);
        // throw err;
        // return { error: "Failed to request stock. Please try again." };
      } finally {
        this.loading = false;
      }
    },

    async submitSupplierRestockRequestBulk(payload: {
      supplierId: string;
      requestDate: string;
      deliveryDate: string;
      comments: string;
      order: Array<{
        materialId: string;
        quantity: number;
      }>;
    }) {
      this.loading = true;

      try {
        const authStore = useAuthStore();
        const hoStaffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SUP_WORKFLOW_" + (await getNextTrackerId("SUP_WORKFLOW"));
        const workflowTrackerId =
          "SUP_REQ_" + (await getNextTrackerId("SUP_REQ"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: null,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: payload.supplierId,
            current_status: "Restock Request",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: hoStaffId,
            updated_by: hoStaffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Restock Request",
                no_of_materials: payload.order.length,

                request_date: payload.requestDate,
                delivery_date: payload.deliveryDate,
                comments: payload.comments,
                created_by: hoStaffId,
                updated_by: hoStaffId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          for (const stock of payload.order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId ?? null,
              workflow_id: workflowRef.id ?? null,
              material_id: stock.materialId ?? null,
              quantity: stock.quantity ?? 0,
              created_by: hoStaffId ?? null,
              updated_by: hoStaffId ?? null,
              created_at: new Date(),
              updated_at: new Date(),
            });

            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);
            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_requested_from_supplier?: number;
              };
              transaction.update(materialRef, {
                stock_requested_from_supplier:
                  (docData.stock_requested_from_supplier ?? 0) + stock.quantity,
                updated_at: new Date(),
                updated_by: hoStaffId,
              });
            }
          }
        });
        // await this.fetchWorkflows();
        this.$patch({ loading: false });
        return {
          message: "Re-Stock Requested successfully",
          route:
            "/home/supplier-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=Home",
        };
      } catch (err) {
        console.error("Error adding stock:", err);
        // throw err;
        messageStore.showMessage(
          (err as Error).message || "Failed to request restock.",
          "error"
        );
        // return { error: "Failed to request stock. Please try again." };
      } finally {
        this.loading = false;
      }
    },

    async submitSupplierRestocked(payload: {
      workflowId: string;
      receivedDate: string;
      comments: string;
      order: Array<{
        materialId: string;
        quantity: number;
      }>;
      status: string;
      pageType: string;
      root_page: string;
    }) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const hoStaffId = authStore.user?.uid;
        const workflowTrackerId =
          "SUP_REQ_" + (await getNextTrackerId("SUP_REQ"));

        await runTransaction(db, async (transaction) => {
          // Fetch the workflow document
          const workflowRef = doc(db, "workflows", payload.workflowId);

          const workflowSnap = await getDoc(workflowRef);
          if (!workflowSnap.exists()) {
            throw new Error("Workflow not found.");
          }
          if (workflowSnap.data().current_status === "Restocked") {
            // If the workflow is already restocked, throw an error
            throw new Error("Workflow is already restocked.");
          }
          if (workflowSnap.data().current_status !== "Restock Request") {
            // If the workflow is not in the "Restock Request" status, throw an error
            throw new Error("Action not applicable!");
          }

          const workflowData = workflowSnap.data();
          const restockRequestWorkflowId = workflowData.workflows.find(
            (wf: { status: string }) => wf.status === "Restock Request"
          ).workflow_tracker_id;

          // Update workflow status and add a new workflow entry
          const updatedWorkflows = [
            ...workflowData.workflows,
            {
              workflow_tracker_id: workflowTrackerId,
              status: "Restocked",
              no_of_materials: payload.order.length,
              received_date: payload.receivedDate,
              comments: payload.comments,
              created_by: hoStaffId,
              updated_by: hoStaffId,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ];

          transaction.update(workflowRef, {
            current_status: "Restocked",
            workflows: updatedWorkflows,
            updated_at: new Date(),
            updated_by: hoStaffId,
          });

          // Add material transactions and update material stock
          for (const stock of payload.order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId,
              workflow_id: payload.workflowId,
              material_id: stock.materialId,
              quantity: stock.quantity,
              created_by: hoStaffId,
              updated_by: hoStaffId,
              created_at: new Date(),
              updated_at: new Date(),
            });

            // Update material stock_at_ho and stock_requested_from_supplier
            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);
            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_at_ho?: number;
                total_stock?: number;
                stock_requested_from_supplier?: number;
              };

              // Get the material transaction for this workflow and material
              const materialTransactionSnap = await getDocs(
                query(
                  collection(db, "material_transactions"),
                  where("workflow_tracker_id", "==", restockRequestWorkflowId),
                  where("material_id", "==", stock.materialId)
                )
              );

              console.log(materialTransactionSnap);
              const materialTransaction = materialTransactionSnap.empty
                ? null
                : materialTransactionSnap.docs[0].data();

              transaction.update(materialRef, {
                stock_at_ho: (docData.stock_at_ho ?? 0) + stock.quantity,
                total_stock: (docData.total_stock ?? 0) + stock.quantity,
                stock_requested_from_supplier:
                  (docData.stock_requested_from_supplier ?? 0) -
                  (materialTransaction?.quantity ?? 0),
                updated_at: new Date(),
                updated_by: hoStaffId,
              });
            }
          }
        });
        this.$patch({ loading: false });
        return {
          message: "Restocked successfully",
          route:
            "/home/supplier-stock-checkin?workflowId=" +
            payload.workflowId +
            "&root_page=Home" +
            "&status=" +
            payload.status +
            "&page_type=" +
            payload.pageType,
        };
      } catch (err) {
        console.error("Error submitting supplier restocked:", err);
        // return { error: (err as Error).message || "Failed to restock." };
        messageStore.showMessage(
          (err as Error).message || "Failed to restock.",
          "error"
        );
      }
    },

    async cancelSupplierRestockRequest(payload: {
      workflowId: string;
      comments: string;
      status: string;
      pageType: string;
      root_page: string;
    }) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const hoStaffId = authStore.user?.uid;
        const workflowTrackerId =
          "SUP_REQ_" + (await getNextTrackerId("SUP_REQ"));

        await runTransaction(db, async (transaction) => {
          // Fetch the workflow document
          const workflowRef = doc(db, "workflows", payload.workflowId);
          const workflowSnap = await getDoc(workflowRef);
          if (!workflowSnap.exists()) {
            throw new Error("Workflow not found.");
          }
          const workflowData = workflowSnap.data();

          if (workflowData.current_status !== "Restock Request") {
            throw new Error("Invalid workflow status.");
          }

          const restockRequestWorkflow = workflowData.workflows[0];

          // Update workflow status and add a new workflow entry
          const updatedWorkflows = [
            ...workflowData.workflows,
            {
              workflow_tracker_id: workflowTrackerId,
              status: "Restock Cancelled",
              no_of_materials: restockRequestWorkflow.no_of_materials,
              comments: payload.comments,
              created_by: hoStaffId,
              updated_by: hoStaffId,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ];

          transaction.update(workflowRef, {
            current_status: "Restock Cancelled",
            workflows: updatedWorkflows,
            updated_at: new Date(),
            updated_by: hoStaffId,
          });

          await this.fetchMaterialTransactionsByWorkflowTrackerId(
            restockRequestWorkflow.workflow_tracker_id
          );
          const order = this.materialTransactions.map((doc) => ({
            materialId: doc.material_id,
            quantity: doc.quantity,
          }));

          // Add material transactions and update material stock
          for (const stock of order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId,
              workflow_id: payload.workflowId,
              material_id: stock.materialId,
              quantity: stock.quantity,
              created_by: hoStaffId,
              updated_by: hoStaffId,
              created_at: new Date(),
              updated_at: new Date(),
            });

            // Update material stock_at_ho and stock_requested_from_supplier
            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);
            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_requested_from_supplier?: number;
              };
              transaction.update(materialRef, {
                stock_requested_from_supplier:
                  (docData.stock_requested_from_supplier ?? 0) - stock.quantity,
                updated_at: new Date(),
                updated_by: hoStaffId,
              });
            }
          }
        });
        this.$patch({ loading: false });
        return {
          message: "Restock request cancelled successfully",
          route:
            "/home/supplier-stock-checkin?workflowId=" +
            payload.workflowId +
            "&root_page=Home" +
            "&status=" +
            payload.status +
            "&page_type=" +
            payload.pageType,
        };
      } catch (err) {
        messageStore.showMessage(
          (err as Error).message || "Failed to cancel restock request.",
          "error"
        );
        console.log("Error submitting supplier restocked:", err);
      }
    },

    // Site Transactions

    //Bulk Requests
    async submitStockRequest(payload: {
      siteId: string;
      materialId: string;
      quantity: number;
      requestDate: string;

      deliveryDate: string;
      comments: string;
      root_page: string;
    }) {
      this.loading = true;

      try {
        const authStore = useAuthStore();
        const siteStaffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));
        const workflowTrackerId =
          "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: payload.siteId,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: null,
            current_status: "Requested",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: siteStaffId,
            updated_by: siteStaffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Requested",
                no_of_materials: 1,

                request_date: payload.requestDate,
                delivery_date: payload.deliveryDate,
                comments: payload.comments,
                created_by: siteStaffId,
                updated_by: siteStaffId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          const materialTxRef = doc(collection(db, "material_transactions"));
          transaction.set(materialTxRef, {
            workflow_tracker_id: workflowTrackerId,
            workflow_id: workflowRef.id,
            material_id: payload.materialId,
            quantity: payload.quantity,
            created_by: siteStaffId,
            updated_by: siteStaffId,
            created_at: new Date(),
            updated_at: new Date(),
          });
          // Update or create site_materials
          const siteMaterialQuery = query(
            collection(db, "site_materials"),
            where("site_id", "==", payload.siteId),
            where("material_id", "==", payload.materialId)
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
            site_id: payload.siteId,
            material_id: payload.materialId,
            created_by: siteStaffId ?? "",
            updated_by: siteStaffId ?? "",
            created_at: new Date(),
            updated_at: new Date(),
          };
          if (snap.empty) {
            data = {
              ...data,
              requested: payload.quantity,
              dispatched: 0,
              received: 0,
              consumed: 0,
              returned: 0,
              return_accepted: 0,
              available_at_site: 0,
            };
            const siteMaterialRef = doc(collection(db, "site_materials"));
            transaction.set(siteMaterialRef, data);
          } else {
            const docRef = snap.docs[0].ref;
            const existingData = snap.docs[0].data();
            data = {
              ...data,
              requested: (existingData.requested ?? 0) + payload.quantity,
            };
            transaction.update(docRef, data);
          }
          // Update material stock_requested_by_site
          const materialRef = doc(db, "materials", payload.materialId);
          const materialSnap = await getDoc(materialRef);
          if (materialSnap.exists()) {
            const docData = materialSnap.data() as {
              stock_requested_by_site?: number;
            };
            transaction.update(materialRef, {
              stock_requested_by_site:
                (docData.stock_requested_by_site ?? 0) + payload.quantity,
              updated_at: new Date(),
              updated_by: siteStaffId,
            });
          }
        });
        // await this.fetchWorkflows();
        this.$patch({ loading: false });
        return {
          message: "Stock Requested successfully.",
          route:
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            payload.root_page,
        };
      } catch (err) {
        console.error("Error adding stock:", err);
        // throw err;
        messageStore.showMessage(
          (err as Error).message || "Failed to request stock.",
          "error"
        );
        // return { error: "Failed to request stock. Please try again." };
      } finally {
        this.loading = false;
      }
    },

    async submitStockRequestBulk(payload: {
      siteId: string;
      order: Array<{
        materialId: string;
        quantity: number;
      }>;
      requestDate?: string;
      deliveryDate?: string;
      comments: string;
      root_page: string;
      actionType: string;
    }) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const siteStaffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));
        const workflowTrackerId =
          "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        console.log(mainWorkflowTrackerId);

        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: payload.siteId,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: null,
            current_status: "Requested",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: siteStaffId,
            updated_by: siteStaffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Requested",
                no_of_materials: payload.order.length,

                request_date: payload.requestDate,
                delivery_date: payload.deliveryDate,
                comments: payload.comments,
                created_by: siteStaffId,
                updated_by: siteStaffId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          for (const stock of payload.order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId ?? null,
              workflow_id: workflowRef.id ?? null,
              material_id: stock.materialId ?? null,
              quantity: stock.quantity ?? 0,
              created_by: siteStaffId ?? null,
              updated_by: siteStaffId ?? null,
              created_at: new Date(),
              updated_at: new Date(),
            });

            const siteMaterialQuery = query(
              collection(db, "site_materials"),
              where("site_id", "==", payload.siteId),
              where("material_id", "==", stock.materialId)
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
              site_id: payload.siteId,
              material_id: stock.materialId,
              created_by: siteStaffId ?? "",
              updated_by: siteStaffId ?? "",
              created_at: new Date(),
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
              };
              const siteMaterialRef = doc(collection(db, "site_materials"));
              transaction.set(siteMaterialRef, data);
            } else {
              const docRef = snap.docs[0].ref;
              const existingData = snap.docs[0].data();
              data = {
                ...data,
                requested: (existingData.requested ?? 0) + stock.quantity,
              };
              transaction.update(docRef, data);
            }
            // Update material stock_requested_by_site
            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);
            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_requested_by_site?: number;
              };
              transaction.update(materialRef, {
                stock_requested_by_site:
                  (docData.stock_requested_by_site ?? 0) + stock.quantity,
                updated_at: new Date(),
                updated_by: siteStaffId,
              });
            }
          }
        });

        const message = "Stock Dispatch successful";
        let route = "";
        this.$patch({ loading: false });

        if (payload.root_page == "Sites") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            payload.root_page +
            "&siteId=" +
            payload.siteId;
        } else if (payload.root_page == "Home") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        } else {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        }
        return {
          message: message,
          route: route,
        };
      } catch (err) {
        console.error("Error adding stock:", err);
        // throw err;
        // return {
        //   error:
        //     "Failed to " +
        //     payload.actionType.toLowerCase +
        //     " stock. Please try again.",
        // };

        messageStore.showMessage(
          (err as Error).message || "Failed to request stock.",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },

    async cancelSiteRequest(payload: {
      workflowId: string;
      comments: string;
      cancelType: string;
      status: string;
      pageType: string;
      root_page: string;
    }) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const hoStaffId = authStore.user?.uid;
        const workflowTrackerId =
          "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
        const workflowStatus =
          payload.cancelType == "Cancel"
            ? "Request Cancelled"
            : payload.cancelType == "Decline"
            ? "Request Declined"
            : "";

        await runTransaction(db, async (transaction) => {
          // Fetch the workflow document
          const workflowRef = doc(db, "workflows", payload.workflowId);
          const workflowSnap = await getDoc(workflowRef);
          if (!workflowSnap.exists()) {
            throw new Error("Workflow not found.");
          }
          const workflowData = workflowSnap.data();
          if (workflowData.current_status !== "Requested") {
            throw new Error("Invalid workflow status.");
          }

          const restockRequestWorkflow = workflowData.workflows[0];

          // Update workflow status and add a new workflow entry
          const updatedWorkflows = [
            ...workflowData.workflows,
            {
              workflow_tracker_id: workflowTrackerId,
              status: workflowStatus,
              no_of_materials: restockRequestWorkflow.no_of_materials,
              comments: payload.comments,
              created_by: hoStaffId,
              updated_by: hoStaffId,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ];

          transaction.update(workflowRef, {
            current_status: workflowStatus,
            workflows: updatedWorkflows,
            updated_at: new Date(),
            updated_by: hoStaffId,
          });

          await this.fetchMaterialTransactionsByWorkflowTrackerId(
            restockRequestWorkflow.workflow_tracker_id
          );
          const order = this.materialTransactions.map((doc) => ({
            materialId: doc.material_id,
            quantity: doc.quantity,
          }));

          // Add material transactions and update material stock
          for (const stock of order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId,
              workflow_id: payload.workflowId,
              material_id: stock.materialId,
              quantity: stock.quantity,
              created_by: hoStaffId,
              updated_by: hoStaffId,
              created_at: new Date(),
              updated_at: new Date(),
            });

            const siteMaterialQuery = query(
              collection(db, "site_materials"),
              where("site_id", "==", workflowData.site_id),
              where("material_id", "==", stock.materialId)
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
              site_id: workflowData.site_id,
              material_id: stock.materialId,
              created_at: new Date(),
              updated_at: new Date(),
              created_by: hoStaffId ?? "",
              updated_by: hoStaffId ?? "",
            };

            const docRef = snap.docs[0].ref;
            const existingData = snap.docs[0].data();
            data = {
              ...data,
              requested: (existingData.requested ?? 0) - stock.quantity,
            };
            transaction.update(docRef, data);

            // Update material stock_at_ho and stock_requested_from_supplier
            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);
            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_requested_by_site?: number;
              };
              transaction.update(materialRef, {
                stock_requested_by_site:
                  (docData.stock_requested_by_site ?? 0) - stock.quantity,
                updated_at: new Date(),
                updated_by: hoStaffId,
              });
            }
          }
        });
        this.$patch({ loading: false });
        return {
          message: "Request cancelled successfully",
          route:
            "/home/supplier-stock-checkin?workflowId=" +
            payload.workflowId +
            "&root_page=Home" +
            "&status=" +
            payload.status +
            "&page_type=" +
            payload.pageType,
        };
      } catch (err) {
        messageStore.showMessage(
          (err as Error).message || "Failed to cancel request.",
          "error"
        );
        console.log("Error submitting supplier restocked:", err);
      }
    },

    async dispatchStock(payload: {
      materialId: string;
      quantity: number;
      siteId: string;
      dispatchDate: string;
      comments: string;
      root_page: string;
    }) {
      this.loading = true;

      try {
        console.log("Requesting stock (transaction):", payload);
        const authStore = useAuthStore();
        const hoStaffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));
        const workflowTrackerId =
          "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: payload.siteId,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: null,
            current_status: "Dispatched",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: hoStaffId,
            updated_by: hoStaffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Dispatched",
                no_of_materials: 1,
                created_by: hoStaffId,
                updated_by: hoStaffId,
                dispatch_date: payload.dispatchDate,
                comments: payload.comments,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          const materialTxRef = doc(collection(db, "material_transactions"));
          transaction.set(materialTxRef, {
            workflow_tracker_id: workflowTrackerId,
            workflow_id: workflowRef.id,
            material_id: payload.materialId,
            quantity: payload.quantity,
            created_by: hoStaffId,
            updated_by: hoStaffId,
            created_at: new Date(),
            updated_at: new Date(),
          });
          // Update or create site_materials
          const siteMaterialQuery = query(
            collection(db, "site_materials"),
            where("site_id", "==", payload.siteId),
            where("material_id", "==", payload.materialId)
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
            site_id: payload.siteId,
            material_id: payload.materialId,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: hoStaffId ?? "",
            updated_by: hoStaffId ?? "",
          };
          if (snap.empty) {
            data = {
              ...data,
              requested: payload.quantity,
              dispatched: payload.quantity,
              received: 0,
              consumed: 0,
              returned: 0,
              return_accepted: 0,
              available_at_site: 0,
            };
            const siteMaterialRef = doc(collection(db, "site_materials"));
            transaction.set(siteMaterialRef, data);
          } else {
            const docRef = snap.docs[0].ref;
            const existingData = snap.docs[0].data();
            data = {
              ...data,
              dispatched: (existingData.dispatched ?? 0) + payload.quantity,
            };
            transaction.update(docRef, data);
          }
          // Update material stock_requested_by_site
          const materialRef = doc(db, "materials", payload.materialId);
          const materialSnap = await getDoc(materialRef);
          if (materialSnap.exists()) {
            const docData = materialSnap.data() as {
              stock_dispatched_to_site?: number;
              stock_at_ho?: number;
            };
            transaction.update(materialRef, {
              stock_dispatched_to_site:
                (docData.stock_dispatched_to_site ?? 0) + payload.quantity,
              stock_at_ho: (docData.stock_at_ho ?? 0) - payload.quantity,
              updated_at: new Date(),
              updated_by: hoStaffId,
            });
          }
        });
        const message = "Stock Dispatch successful";
        let route = "";
        this.$patch({ loading: false });

        if (payload.root_page == "Sites") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            payload.root_page +
            "&siteId=" +
            payload.siteId;
        } else if (payload.root_page == "Home") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        } else {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        }
        return {
          message: message,
          route: route,
        };
      } catch (err) {
        console.error("Error adding stock:", err);
        // throw err;
        messageStore.showMessage(
          (err as Error).message || "Failed to dispatch stock.",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    // Dispatch & Receive & Return Accepted Bulk with Requests present
    async siteStockBulk(payload: {
      workflowId: string;
      dispatchDate?: string;
      receivedDate?: string;
      comments: string;
      submitType: string;
      order: Array<{
        materialId: string;
        quantity: number;
      }>;
      status: string;
      pageType: string;
      root_page: string;
    }) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const staffId = authStore.user?.uid;
        let workflowTrackerId;

        let workflowStatus: string;

        let dateObject: {
          dispatch_date?: string;
          received_date?: string;
          return_date?: string;
        } = {};
        if (payload.submitType === "Dispatch") {
          workflowTrackerId =
            "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
          workflowStatus = "Dispatched";
          dateObject = {
            dispatch_date: payload.dispatchDate,
          };
        } else if (payload.submitType === "Receive") {
          workflowTrackerId =
            "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
          workflowStatus = "Received";
          dateObject = {
            received_date: payload.receivedDate,
          };
        } else if (payload.submitType === "Return") {
          workflowTrackerId =
            "SITE_RET_" + (await getNextTrackerId("SITE_RET"));
          workflowStatus = "Return Accepted";
          dateObject = {
            received_date: payload.receivedDate,
          };
        } else {
          throw new Error("Invalid submit type.");
        }

        await runTransaction(db, async (transaction) => {
          // Fetch the workflow document
          const workflowRef = doc(db, "workflows", payload.workflowId);
          const workflowSnap = await getDoc(workflowRef);
          if (!workflowSnap.exists()) {
            throw new Error("Workflow not found.");
          }
          const workflowData = workflowSnap.data();

          // Update workflow status and add a new workflow entry
          const updatedWorkflows = [
            ...workflowData.workflows,
            {
              workflow_tracker_id: workflowTrackerId,
              status: workflowStatus,
              no_of_materials: payload.order.length,
              ...dateObject,
              comments: payload.comments,
              created_by: staffId,
              updated_by: staffId,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ];

          transaction.update(workflowRef, {
            current_status: workflowStatus,
            workflows: updatedWorkflows,
            updated_at: new Date(),
            updated_by: staffId,
          });

          // Add material transactions and update material stock
          for (const stock of payload.order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId,
              workflow_id: payload.workflowId,
              material_id: stock.materialId,
              quantity: stock.quantity,
              created_by: staffId,
              updated_by: staffId,
              created_at: new Date(),
              updated_at: new Date(),
            });

            const siteMaterialQuery = query(
              collection(db, "site_materials"),
              where("site_id", "==", workflowData.site_id),
              where("material_id", "==", stock.materialId)
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
              site_id: workflowData.site_id,
              material_id: stock.materialId,
              created_at: new Date(),
              updated_at: new Date(),
              created_by: staffId ?? "",
              updated_by: staffId ?? "",
            };

            const docRef = snap.docs[0].ref;
            const existingData = snap.docs[0].data();

            if (payload.submitType === "Dispatch") {
              data = {
                ...data,
                requested: (existingData.requested ?? 0) - stock.quantity,
                dispatched: (existingData.dispatched ?? 0) + stock.quantity,
              };
            } else if (payload.submitType === "Receive") {
              data = {
                ...data,
                dispatched: (existingData.dispatched ?? 0) - stock.quantity,
                received: (existingData.received ?? 0) + stock.quantity,
                available_at_site:
                  (existingData.available_at_site ?? 0) + stock.quantity,
              };
            } else if (payload.submitType === "Return") {
              data = {
                ...data,
                returned: (existingData.returned ?? 0) - stock.quantity,
                return_accepted:
                  (existingData.return_accepted ?? 0) + stock.quantity,
              };
            }
            transaction.update(docRef, data);

            // Update material stock_at_ho and stock_requested_from_supplier
            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);

            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_at_ho?: number;
                stock_requested_by_site?: number;
                stock_dispatched_to_site?: number;
                stock_available_at_site?: number;
                stock_returned_from_site?: number;
                stock_return_accepted_from_site?: number;
                stock_received_at_site?: number;
              };
              if (payload.submitType === "Dispatch") {
                transaction.update(materialRef, {
                  stock_at_ho: (docData.stock_at_ho ?? 0) - stock.quantity,
                  stock_requested_by_site:
                    (docData.stock_requested_by_site ?? 0) - stock.quantity,
                  stock_dispatched_to_site:
                    (docData.stock_dispatched_to_site ?? 0) + stock.quantity,
                  updated_at: new Date(),
                  updated_by: staffId,
                });
              } else if (payload.submitType === "Receive") {
                transaction.update(materialRef, {
                  stock_dispatched_to_site:
                    (docData.stock_dispatched_to_site ?? 0) - stock.quantity,
                  stock_available_at_site:
                    (docData.stock_available_at_site ?? 0) + stock.quantity,
                  stock_received_at_site:
                    (docData.stock_received_at_site ?? 0) + stock.quantity,
                  updated_at: new Date(),
                  updated_by: staffId,
                });
              } else if (payload.submitType === "Return") {
                transaction.update(materialRef, {
                  stock_return_accepted_from_site:
                    (docData.stock_return_accepted_from_site ?? 0) +
                    stock.quantity,
                  stock_at_ho: (docData.stock_at_ho ?? 0) + stock.quantity,
                  stock_returned_from_site:
                    (docData.stock_returned_from_site ?? 0) - stock.quantity,
                  updated_at: new Date(),
                  updated_by: staffId,
                });
              }
            }
          }
        });
        this.$patch({ loading: false });
        return {
          message: payload.submitType + " successful",
          route:
            "/home/site-stock-checkin?workflowId=" +
            payload.workflowId +
            "&root_page=Home" +
            "&status=" +
            payload.status +
            "&page_type=" +
            payload.pageType,
        };
      } catch (err) {
        const message =
          payload.submitType == "Return"
            ? "accept return of"
            : payload.submitType.toLowerCase();
        return {
          error: "Failed to " + message + " stock. Please try again.",
        };
        console.log("Error submitting site dispatch / receive bulk:", err);
      }
    },

    // Dispatch without Requests
    async submitStockDispatchBulk(payload: {
      siteId: string;
      order: Array<{
        materialId: string;
        quantity: number;
      }>;
      dispatchDate?: string;
      comments: string;
      root_page: string;
      actionType: string;
    }) {
      this.loading = true;
      console.log(payload);
      try {
        const authStore = useAuthStore();
        const hoStaffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));
        const workflowTrackerId =
          "SITE_REQ_" + (await getNextTrackerId("SITE_REQ"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: payload.siteId,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: null,
            current_status: "Dispatched",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: hoStaffId,
            updated_by: hoStaffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Dispatched",
                no_of_materials: payload.order.length,

                dispatch_date: payload.dispatchDate,
                comments: payload.comments,
                created_by: hoStaffId,
                updated_by: hoStaffId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          for (const stock of payload.order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId,
              workflow_id: workflowRef.id,
              material_id: stock.materialId,
              quantity: stock.quantity,
              created_by: hoStaffId,
              updated_by: hoStaffId,
              created_at: new Date(),
              updated_at: new Date(),
            });
            const siteMaterialQuery = query(
              collection(db, "site_materials"),
              where("site_id", "==", payload.siteId),
              where("material_id", "==", stock.materialId)
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
              site_id: payload.siteId,
              material_id: stock.materialId,
              created_by: hoStaffId ?? "",
              updated_by: hoStaffId ?? "",
              created_at: new Date(),
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
              };
              const siteMaterialRef = doc(collection(db, "site_materials"));
              transaction.set(siteMaterialRef, data);
            } else {
              const docRef = snap.docs[0].ref;
              const existingData = snap.docs[0].data();
              data = {
                ...data,
                dispatched: (existingData.dispatched ?? 0) + stock.quantity,
              };
              transaction.update(docRef, data);
            }
            // Update material stock_requested_by_site
            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);
            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_dispatched_to_site?: number;
                stock_at_ho?: number;
              };
              transaction.update(materialRef, {
                stock_dispatched_to_site:
                  (docData.stock_dispatched_to_site ?? 0) + stock.quantity,
                stock_at_ho: (docData.stock_at_ho ?? 0) - stock.quantity,
                updated_at: new Date(),
                updated_by: hoStaffId,
              });
            }
          }
        });

        const message = "Stock Dispatch successful";
        let route = "";
        this.$patch({ loading: false });

        if (payload.root_page == "Sites") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            payload.root_page +
            "&siteId=" +
            payload.siteId;
        } else if (payload.root_page == "Home") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        } else {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        }
        return {
          message: message,
          route: route,
        };
      } catch (err) {
        console.error("Error adding stock:", err);
        // throw err;
        return {
          error: "Failed to dispatch stock.",
        };
      } finally {
        this.loading = false;
      }
    },

    async submitReturnStock(payload: {
      siteId: string;
      materialId: string;
      quantity: number;
      comments: string;
      root_page: string;
      returnDate?: string;
    }) {
      this.loading = true;

      try {
        const authStore = useAuthStore();
        const siteStaffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));
        const workflowTrackerId =
          "SITE_RET_" + (await getNextTrackerId("SITE_RET"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: payload.siteId,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: null,
            current_status: "Returned",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: siteStaffId,
            updated_by: siteStaffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Returned",
                no_of_materials: 1,
                return_date: payload.returnDate,
                comments: payload.comments,
                created_by: siteStaffId,
                updated_by: siteStaffId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          const materialTxRef = doc(collection(db, "material_transactions"));
          transaction.set(materialTxRef, {
            workflow_tracker_id: workflowTrackerId,
            workflow_id: workflowRef.id,
            material_id: payload.materialId,
            quantity: payload.quantity,
            created_by: siteStaffId,
            updated_by: siteStaffId,
            created_at: new Date(),
            updated_at: new Date(),
          });
          // Update or create site_materials
          const siteMaterialQuery = query(
            collection(db, "site_materials"),
            where("site_id", "==", payload.siteId),
            where("material_id", "==", payload.materialId)
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
            site_id: payload.siteId,
            material_id: payload.materialId,
            created_by: siteStaffId ?? "",
            updated_by: siteStaffId ?? "",
            created_at: new Date(),
            updated_at: new Date(),
          };

          const docRef = snap.docs[0].ref;
          const existingData = snap.docs[0].data();
          data = {
            ...data,
            returned: (existingData.returned ?? 0) + payload.quantity,
            available_at_site:
              (existingData.available_at_site ?? 0) - payload.quantity,
          };
          transaction.update(docRef, data);

          // Update material stock_requested_by_site
          const materialRef = doc(db, "materials", payload.materialId);
          const materialSnap = await getDoc(materialRef);
          if (materialSnap.exists()) {
            const docData = materialSnap.data() as {
              stock_returned_from_site?: number;
              stock_available_at_site?: number;
            };
            transaction.update(materialRef, {
              stock_returned_from_site:
                (docData.stock_returned_from_site ?? 0) + payload.quantity,
              stock_available_at_site:
                (docData.stock_available_at_site ?? 0) - payload.quantity,
              updated_at: new Date(),
              updated_by: siteStaffId,
            });
          }
        });
        // await this.fetchWorkflows();
        this.$patch({ loading: false });
        return {
          message: "Stock Returned successfully.",
          route:
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            payload.root_page +
            "&siteId=" +
            payload.siteId,
        };
      } catch (err) {
        messageStore.showMessage(
          (err as Error).message || "Failed to return stock.",
          "error"
        );
        console.error("Error requesting stock:", err);
      }
    },

    async submitConsumeStock(payload: {
      siteId: string;
      materialId: string;
      quantity: number;
      comments: string;
      root_page: string;
      returnDate?: string;
    }) {
      this.loading = true;

      try {
        const authStore = useAuthStore();
        const siteStaffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));
        const workflowTrackerId =
          "SITE_CON_" + (await getNextTrackerId("SITE_CON"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: payload.siteId,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: null,
            current_status: "Consumed",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: siteStaffId,
            updated_by: siteStaffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Consumed",
                no_of_materials: 1,
                comments: payload.comments,
                created_by: siteStaffId,
                updated_by: siteStaffId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          const materialTxRef = doc(collection(db, "material_transactions"));
          transaction.set(materialTxRef, {
            workflow_tracker_id: workflowTrackerId,
            workflow_id: workflowRef.id,
            material_id: payload.materialId,
            quantity: payload.quantity,
            created_by: siteStaffId,
            updated_by: siteStaffId,
            created_at: new Date(),
            updated_at: new Date(),
          });
          // Update or create site_materials
          const siteMaterialQuery = query(
            collection(db, "site_materials"),
            where("site_id", "==", payload.siteId),
            where("material_id", "==", payload.materialId)
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
            site_id: payload.siteId,
            material_id: payload.materialId,
            created_by: siteStaffId ?? "",
            updated_by: siteStaffId ?? "",
            created_at: new Date(),
            updated_at: new Date(),
          };

          const docRef = snap.docs[0].ref;
          const existingData = snap.docs[0].data();
          data = {
            ...data,
            consumed: (existingData.consumed ?? 0) + payload.quantity,
            available_at_site:
              (existingData.available_at_site ?? 0) - payload.quantity,
          };
          transaction.update(docRef, data);

          // Update material stock_requested_by_site
          const materialRef = doc(db, "materials", payload.materialId);
          const materialSnap = await getDoc(materialRef);
          if (materialSnap.exists()) {
            const docData = materialSnap.data() as {
              stock_consumed_at_site?: number;
              stock_available_at_site?: number;
              total_stock?: number;
            };
            transaction.update(materialRef, {
              stock_consumed_at_site:
                (docData.stock_consumed_at_site ?? 0) + payload.quantity,
              stock_available_at_site:
                (docData.stock_available_at_site ?? 0) - payload.quantity,
              total_stock: (docData.total_stock ?? 0) - payload.quantity,
              updated_at: new Date(),
              updated_by: siteStaffId,
            });
          }
        });
        // await this.fetchWorkflows();
        this.$patch({ loading: false });
        return {
          message: "Stock Consumption registered successfully.",
          route:
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            payload.root_page +
            "&siteId=" +
            payload.siteId,
        };
      } catch (err) {
        messageStore.showMessage(
          (err as Error).message || "Failed to mark consumption of stock.",
          "error"
        );
        console.error("Error requesting stock:", err);
      }
    },

    // Bulk Return
    async submitStockReturnBulk(payload: {
      siteId: string;
      order: Array<{
        materialId: string;
        quantity: number;
      }>;
      returnDate?: string;
      comments: string;
      root_page: string;
      actionType: string;
    }) {
      this.loading = true;
      console.log(payload);
      try {
        const authStore = useAuthStore();
        const staffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));
        const workflowTrackerId =
          "SITE_RET_" + (await getNextTrackerId("SITE_RET"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: payload.siteId,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: null,
            current_status: "Returned",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: staffId,
            updated_by: staffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Returned",
                no_of_materials: payload.order.length,

                return_date: payload.returnDate,
                comments: payload.comments,
                created_by: staffId,
                updated_by: staffId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          for (const stock of payload.order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId,
              workflow_id: workflowRef.id,
              material_id: stock.materialId,
              quantity: stock.quantity,
              created_by: staffId,
              updated_by: staffId,
              created_at: new Date(),
              updated_at: new Date(),
            });
            const siteMaterialQuery = query(
              collection(db, "site_materials"),
              where("site_id", "==", payload.siteId),
              where("material_id", "==", stock.materialId)
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
              site_id: payload.siteId,
              material_id: stock.materialId,
              created_by: staffId ?? "",
              updated_by: staffId ?? "",
              created_at: new Date(),
              updated_at: new Date(),
            };

            const docRef = snap.docs[0].ref;
            const existingData = snap.docs[0].data();
            data = {
              ...data,
              returned: (existingData.returned ?? 0) + stock.quantity,
              available_at_site:
                (existingData.available_at_site ?? 0) - stock.quantity,
            };
            transaction.update(docRef, data);

            // Update material stock_requested_by_site
            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);
            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_returned_from_site?: number;
                stock_available_at_site?: number;
              };
              transaction.update(materialRef, {
                stock_returned_from_site:
                  (docData.stock_returned_from_site ?? 0) + stock.quantity,
                stock_available_at_site:
                  (docData.stock_available_at_site ?? 0) - stock.quantity,
                updated_at: new Date(),
                updated_by: staffId,
              });
            }
          }
        });

        const message = "Stock Return successful";
        let route = "";
        this.$patch({ loading: false });

        if (payload.root_page == "Sites") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            payload.root_page +
            "&siteId=" +
            payload.siteId;
        } else if (payload.root_page == "Home") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        } else {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        }
        return {
          message: message,
          route: route,
        };
      } catch (err) {
        console.error("Error adding stock:", err);
        // throw err;

        messageStore.showMessage(
          (err as Error).message || "Failed to return stock.",
          "error"
        );
        // return {
        //   error: "Failed to return stock. Please try again.",
        // };
      } finally {
        this.loading = false;
      }
    },

    async submitStockConsumeBulk(payload: {
      siteId: string;
      order: Array<{
        materialId: string;
        quantity: number;
      }>;
      returnDate?: string;
      comments: string;
      root_page: string;
      actionType: string;
    }) {
      this.loading = true;
      console.log(payload);
      try {
        const authStore = useAuthStore();
        const staffId = authStore.user?.uid;
        const mainWorkflowTrackerId =
          "SITE_WORKFLOW_" + (await getNextTrackerId("SITE_WORKFLOW"));
        const workflowTrackerId =
          "SITE_CON_" + (await getNextTrackerId("SITE_CON"));
        // Prepare workflowRef outside transaction to access its id later
        const workflowRef = doc(collection(db, "workflows"));
        await runTransaction(db, async (transaction) => {
          // Create workflow
          const workflowPayload = {
            site_id: payload.siteId,
            workflow_tracker_id: mainWorkflowTrackerId,
            supplier_id: null,
            current_status: "Consumed",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: staffId,
            updated_by: staffId,
            workflows: [
              {
                workflow_tracker_id: workflowTrackerId,
                status: "Consumed",
                no_of_materials: payload.order.length,

                comments: payload.comments,
                created_by: staffId,
                updated_by: staffId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
          transaction.set(workflowRef, workflowPayload);
          // Add material transaction
          for (const stock of payload.order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId,
              workflow_id: workflowRef.id,
              material_id: stock.materialId,
              quantity: stock.quantity,
              created_by: staffId,
              updated_by: staffId,
              created_at: new Date(),
              updated_at: new Date(),
            });
            const siteMaterialQuery = query(
              collection(db, "site_materials"),
              where("site_id", "==", payload.siteId),
              where("material_id", "==", stock.materialId)
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
              site_id: payload.siteId,
              material_id: stock.materialId,
              created_by: staffId ?? "",
              updated_by: staffId ?? "",
              created_at: new Date(),
              updated_at: new Date(),
            };

            const docRef = snap.docs[0].ref;
            const existingData = snap.docs[0].data();
            data = {
              ...data,
              consumed: (existingData.consumed ?? 0) + stock.quantity,
              available_at_site:
                (existingData.available_at_site ?? 0) - stock.quantity,
            };
            transaction.update(docRef, data);

            // Update material stock_requested_by_site
            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);
            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_consumed_from_site?: number;
                stock_available_at_site?: number;
                total_stock?: number;
              };
              transaction.update(materialRef, {
                stock_consumed_from_site:
                  (docData.stock_consumed_from_site ?? 0) + stock.quantity,
                stock_available_at_site:
                  (docData.stock_available_at_site ?? 0) - stock.quantity,
                total_stock: (docData.total_stock ?? 0) - stock.quantity,
                updated_at: new Date(),
                updated_by: staffId,
              });
            }
          }
        });

        const message = "Bulk Stock Consumption registered successful";
        let route = "";
        this.$patch({ loading: false });

        if (payload.root_page == "Sites") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            payload.root_page +
            "&siteId=" +
            payload.siteId;
        } else if (payload.root_page == "Home") {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        } else {
          route =
            "/home/site-stock-checkin?workflowId=" +
            workflowRef.id +
            "&root_page=" +
            "Home";
        }
        return {
          message: message,
          route: route,
        };
      } catch (err) {
        console.error("Error adding stock:", err);
        // throw err;
        messageStore.showMessage(
          (err as Error).message || "Failed to mark consumption of stock.",
          "error"
        );
        // return {
        //   error: "Failed to mark consumption of stock.",
        // };
      } finally {
        this.loading = false;
      }
    },

    async cancelSiteReturn(payload: {
      workflowId: string;
      comments: string;
      cancelType: string;
      status: string;
      pageType: string;
      root_page: string;
    }) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const hoStaffId = authStore.user?.uid;
        const workflowTrackerId =
          "SITE_RET_" + (await getNextTrackerId("SITE_RET"));
        const workflowStatus =
          payload.cancelType == "Cancel"
            ? "Return Cancelled"
            : payload.cancelType == "Decline"
            ? "Return Declined"
            : "";

        await runTransaction(db, async (transaction) => {
          // Fetch the workflow document
          const workflowRef = doc(db, "workflows", payload.workflowId);
          const workflowSnap = await getDoc(workflowRef);
          if (!workflowSnap.exists()) {
            throw new Error("Workflow not found.");
          }
          const workflowData = workflowSnap.data();

          if (workflowData.current_status !== "Returned") {
            throw new Error("Invalid workflow status");
          }
          const restockRequestWorkflow = workflowData.workflows[0];

          // Update workflow status and add a new workflow entry
          const updatedWorkflows = [
            ...workflowData.workflows,
            {
              workflow_tracker_id: workflowTrackerId,
              status: workflowStatus,
              no_of_materials: restockRequestWorkflow.no_of_materials,
              comments: payload.comments,
              created_by: hoStaffId,
              updated_by: hoStaffId,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ];

          transaction.update(workflowRef, {
            current_status: workflowStatus,
            workflows: updatedWorkflows,
            updated_at: new Date(),
            updated_by: hoStaffId,
          });

          await this.fetchMaterialTransactionsByWorkflowTrackerId(
            restockRequestWorkflow.workflow_tracker_id
          );
          const order = this.materialTransactions.map((doc) => ({
            materialId: doc.material_id,
            quantity: doc.quantity,
          }));

          // Add material transactions and update material stock
          for (const stock of order) {
            const materialTxRef = doc(collection(db, "material_transactions"));
            transaction.set(materialTxRef, {
              workflow_tracker_id: workflowTrackerId,
              workflow_id: payload.workflowId,
              material_id: stock.materialId,
              quantity: stock.quantity,
              created_by: hoStaffId,
              updated_by: hoStaffId,
              created_at: new Date(),
              updated_at: new Date(),
            });

            const siteMaterialQuery = query(
              collection(db, "site_materials"),
              where("site_id", "==", workflowData.site_id),
              where("material_id", "==", stock.materialId)
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
              site_id: workflowData.site_id,
              material_id: stock.materialId,
              created_at: new Date(),
              updated_at: new Date(),
              created_by: hoStaffId ?? "",
              updated_by: hoStaffId ?? "",
            };

            const docRef = snap.docs[0].ref;
            const existingData = snap.docs[0].data();
            data = {
              ...data,
              returned: (existingData.returned ?? 0) - stock.quantity,
              available_at_site:
                (existingData.available_at_site ?? 0) + stock.quantity,
            };
            transaction.update(docRef, data);

            // Update material stock_at_ho and stock_requested_from_supplier
            const materialRef = doc(db, "materials", stock.materialId);
            const materialSnap = await getDoc(materialRef);
            if (materialSnap.exists()) {
              const docData = materialSnap.data() as {
                stock_returned_from_site?: number;
                stock_available_at_site?: number;
              };
              transaction.update(materialRef, {
                stock_returned_from_site:
                  (docData.stock_returned_from_site ?? 0) - stock.quantity,
                stock_available_at_site:
                  (docData.stock_available_at_site ?? 0) + stock.quantity,
                updated_at: new Date(),
                updated_by: hoStaffId,
              });
            }
          }
        });
        this.$patch({ loading: false });
        return {
          message: "Request cancelled successfully",
          route:
            "/home/supplier-stock-checkin?workflowId=" +
            payload.workflowId +
            "&root_page=Home" +
            "&status=" +
            payload.status +
            "&page_type=" +
            payload.pageType,
        };
      } catch (err) {
        messageStore.showMessage(
          (err as Error).message ||
            "Failed to " + payload.cancelType + " return request",
          "error"
        );
        console.log("Error submitting supplier restocked:", err);
      }
    },
  },
  getters: {
    subcategoriesByCategory: (state) => (categoryId: string) => {
      return state.subcategories.filter((s) => s.category_id === categoryId);
    },
    materialsBySubcategory: (state) => (subcategoryId: string) => {
      return state.materials.filter((m) => m.subcategory_id === subcategoryId);
    },
    singleSubcategory: (state) => (subcategoryId: string) => {
      return state.subcategories.find((sc) => sc.id === subcategoryId);
    },
    categoryFromSubcategory: (state) => (subcategoryId: string) => {
      const subcat = state.subcategories.find((sc) => sc.id === subcategoryId);
      if (!subcat) return null;
      return state.categories.find((c) => c.id === subcat.category_id) || null;
    },
  },
  persist: {
    pick: ["categories", "subcategories", "suppliers"],
  },
});
