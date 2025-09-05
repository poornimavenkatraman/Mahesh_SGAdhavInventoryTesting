<template>
  <div class="p-2 min-h-screen">
    <div>
      <nav
        class="flex items-center mb-0 p-2"
        aria-label="Breadcrumb"
        style="background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%)"
      >
        <ol class="flex items-center space-x-1">
          <li v-if="route.query.root_page == 'Home'">
            <router-link
              to="/home"
              class="inline-flex items-center px-2 py-1 rounded-full bg-white text-teal-700 font-semibold text-[9px] hover:bg-teal-200 transition"
            >
              <i class="fas fa-home mr-1"></i> Home
            </router-link>
          </li>
          <li>
            <span class="mx-1 text-teal-400">
              <i class="fas fa-chevron-right"></i>
            </span>
          </li>
          <li v-if="route.query.pageType">
            <router-link
              :to="`/home/site_status?page_type=${route.query.pageType}&root_page=${route.query.root_page}&status=${route.query.status}`"
              class="inline-flex items-baseline px-2 py-1 rounded-full bg-white text-teal-700 font-semibold text-[9px] hover:bg-teal-200 transition"
            >
              <i class="mr-1 fas fa-exchange-alt"></i>
              {{ route.query.pageType || "" }}
            </router-link>
          </li>
          <li v-if="route.query.pageType">
            <span class="mx-1 text-teal-400">
              <i class="fas fa-chevron-right"></i>
            </span>
          </li>
          <li>
            <span
              class="inline-flex items-baseline px-2 py-1 rounded-full bg-white text-teal-700 font-semibold text-[9px]"
              aria-current="page"
            >
              <i class="fas fa-clipboard-check mr-1"></i>
              Workflow Details
            </span>
          </li>
        </ol>
      </nav>
      <div class="flex items-center gap-3 mb-1 p-3 justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-teal-200 rounded-full p-2">
            <i class="fas fa-clipboard-check text-xl text-teal-700"></i>
          </div>
          <h2 class="text-lg font-bold text-teal-700">Supplier Workflow</h2>
        </div>
      </div>

      <!-- <h2 class="text-teal-700 font-bold text-2xl mb-6 flex items-center">
        <i class="fas fa-truck mr-2"></i>Requested Stock Requests to Supplier
      </h2> -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center min-h-screen"
      >
        <!-- <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500"></div> -->
        <span class="animate-spin text-3xl text-teal-400 mb-2">
          <i class="fas fa-spinner"></i>
        </span>
        <span class="ml-4 text-teal-700 font-semibold">Loading...</span>
      </div>
      <div v-else class="p-6 pt-3 mt-1">
        <div
          class="bg-gradient-to-r from-teal-400 to-teal-100 border-1 border-teal-500 px-6 py-3 mb-2 flex items-center gap-2 shadow-lg rounded"
        >
          <span
            class="font-bold text-teal-900 flex-1 text-left text-xs tracking-wide"
          >
            Workflow ID:
            <span class="font-bold px-3 py-1 text-teal-800 text-[10px]">
              {{ workflow?.workflow_tracker_id || "" }}
            </span>
            <span
              class="px-3 py-1 rounded ml-2 text-[11px] shadow bg-teal-600 text-white font-medium"
            >
              {{ workflow?.current_status || "" }}
            </span>
          </span>
          <span
            v-if="supplier"
            class="text-xs text-teal-900 font-semibold ml-auto flex items-center gap-1"
          >
            <i class="fas fa-truck-loading text-teal-600 mr-1"></i>
            {{ supplier.suppliers_name }}
          </span>
        </div>

        <div v-for="(subworkflow, index) in allWorkflows" :key="index">
          <div
            class="p-3 px-8 rounded-t text-white flex flex-row justify-between items-center gap-4 border-b-2 border-white"
            :class="{
              'bg-teal-500': subworkflow?.status === 'Restock Request' || subworkflow?.status === 'Restocked',
              'bg-red-500': subworkflow?.status === 'Restock Cancelled',
            }"
          >
            <span class="font-bold flex-1 text-left">
              <i
                class="mr-1 text-base"
                :class="
                  subworkflow?.status === 'Restock Request'
                    ? 'fas fa-clipboard-list'
                    : 'fas fa-clipboard-check'
                "
              ></i>
              Event ID:
              <span class="font-semibold text-center ml-2">{{
                subworkflow?.workflow_tracker_id || "N/A"
              }}</span>
            </span>
          </div>
          <div class="bg-teal-50 rounded-b shadow py-4 px-8 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 mb-2">
              <div class="flex mb-1">
                <span class="font-semibold text-teal-700 w-36 text-left"
                  >Action :</span
                >
                <span
                  class="ml-4 w-30 inline-block px-2 py-1 rounded-full font-semibold text-xs text-center"
                  :class="{
                    'bg-teal-200 text-teal-700':
                      subworkflow?.status === 'Restock Request' || subworkflow?.status === 'Restocked',
                    'bg-red-200 text-red-700':
                      subworkflow?.status !== 'Restock Request' &&
                      subworkflow?.status !== 'Restocked',
                  }"
                >
                  {{ subworkflow?.status }}
                </span>
              </div>

              <div class="flex mb-1">
                <span class="font-semibold text-teal-700 w-36 text-left"
                  >Action By:</span
                >
                <span class="ml-4 w-40 text-left">{{
                  subworkflow?.created_by_user_name || ""
                }}</span>
              </div>
              <div class="flex mb-1 mt-2">
                <span class="font-semibold text-teal-700 w-36 text-left"
                  >Actioned On:</span
                >
                <span class="ml-4 w-40 text-left">{{
                  subworkflow?.created_at
                    ? formatReadableDate(subworkflow.created_at)
                    : "N/A"
                }}</span>
              </div>
              <div class="flex mb-1 mt-2" v-if="subworkflow?.status === 'Restocked'">
                <span class="block font-semibold text-teal-700 w-36 text-left"
                  >Received Date: </span>
                <span class="ml-4 w-40 text-left">{{
                  subworkflow?.received_date
                }}</span>
              </div>
              <div class="flex mb-1 mt-2">
                <span class="font-semibold text-teal-700 w-36 text-left"
                  >Comments:</span
                >
                <span class="ml-4 w-40 text-left">{{
                  subworkflow?.comments
                }}</span>
              </div>

              <div class="flex mb-1 mt-4" v-if="subworkflow?.status === 'Restock Request'">
                <span class="font-semibold text-teal-700 w-36 text-left"
                  >Requested Date:</span
                >
                <span class="ml-4 w-40 text-left">{{
                  subworkflow?.request_date
                }}</span>
              </div>
              <div class="flex mb-1 mt-4" v-if="subworkflow?.status === 'Restock Request'">
                <span class="font-semibold text-teal-700 w-36 text-left"
                  >Expected Delivery Date:</span
                >
                <span class="ml-4 w-40 text-left">{{
                  subworkflow?.delivery_date
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Materials Table -->
        <div
          v-for="(requests, category) in groupedByCategory"
          :key="category"
          class="mb-10 px-2"
        >
          <h3 class="text-teal-600 font-bold text-sm mb-2">
            <i class="fas fa-hard-hat mr-1"></i>{{ category }}
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-xs border rounded">
              <thead>
                <tr class="bg-teal-100 text-teal-700">
                  <th class="py-2 px-3 text-left">Subcategory</th>
                  <th class="py-2 px-3 text-left">Material</th>
                  <th class="py-2 px-3 text-left" v-if="workflow?.current_status !== 'Restock Cancelled'">Requested Quantity </th>
                  <th class="py-2 px-3 text-left">Received Quantity</th>
                  <th class="py-2 px-3 text-left">UOM</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="req in requests"
                  :key="
                    (req && req.id ? req.id : '') +
                    (req && req.materialId ? req.materialId : '')
                  "
                  class="border-b"
                >
                  <td class="py-2 px-3 align-middle">
                    {{ req?.subcategory || "" }}
                  </td>
                  <td class="py-2 px-3 align-middle">
                    {{ req?.material || "" }}
                  </td>
                  <td class="py-2 px-3 align-middle">
                    {{ req?.requested_quantity ?? "" }}
                  </td>
                  <td class="py-2 px-3 align-middle" v-if="workflow?.current_status !== 'Restock Cancelled'">
                    <input
                      v-if="req && req.editing"
                      required
                      type="number"
                      v-model.number="req.received_quantity"
                      min="0"
                      class="border rounded px-2 py-1 w-20 text-right"
                      @change="
                        () => {
                          if (req.received_quantity < 0)
                            req.received_quantity = 0;
                        }
                      "
                      :class="{
                        'bg-yellow-100 border-yellow-400':
                          req &&
                          req.received_quantity !== req.requested_quantity,
                      }"
                    />
                    {{
                      req && req.editing === false ? req.received_quantity : ""
                    }}
                  </td>
                  <td class="py-2 px-3 align-middle">{{ req?.uom || "" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Check-In Comments and Actions -->
        <div class="mt-8 p-3" v-if="workflow?.current_status === 'Restock Request'">
          <div>
            <div class="flex mb-1 mt-3">
              <span class="font-semibold text-teal-700 w-36 text-left"
                >Received Date:<span class="text-red-500 ml-1">*</span></span
              >
              <input
                type="date"
                class="ml-4 w-40 text-left border rounded px-2 py-1"
                v-model="receivedDate"
                :max="todayString"
                required
              />
            </div>
          </div>
          <label class="block text-teal-700 font-semibold mb-2"
            >Comments<span class="text-red-500 ml-1">*</span></label
          >
          <textarea
            v-model="comments"
            rows="3"
            class="w-full border rounded px-3 py-2 mb-4"
            placeholder="Enter comments..."
            required
          ></textarea>
          <div
            class="flex gap-4 justify-end"
            v-if="receiveWorkflow?.status !== 'Restocked'"
          >
            <button
              @click="checkinStock"
              class="bg-teal-700 text-white px-4 py-2 rounded font-semibold shadow hover:bg-gray-300 transition"
            >
              Check-In Stock
            </button>
            <button
              v-if="
                isLoading === false && receiveWorkflow?.status !== 'Restocked'
              "
              @click="cancelCheckin"
              class="bg-red-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-red-700 transition"
            >
              Cancel Stock Check-In
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DocumentData } from "firebase/firestore";

import { formatReadableDate } from "@/utils/date";
import { useUserStore } from "@/stores/userStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const userStore = useUserStore();
const inventoryStore = useInventoryStore();
const today = new Date();
const todayString = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

let workflowId = route.query.workflowId || "";
if (Array.isArray(workflowId)) workflowId = workflowId[0] || "";

const isLoading = ref(true);
const workflow = ref<DocumentData | null>(null);
const requestMaterialTransactions = ref<DocumentData[]>([]);
const receiveMaterialTransactions = ref<DocumentData[]>([]);

const requestWorkflow = ref<DocumentData | null>(null);
const receiveWorkflow = ref<DocumentData | null>(null);

const supplier = ref<any>(null);
const allWorkflows = ref<any[]>([]);
const enrichedRequests = ref<any[]>([]);

import { useMessageStore } from "@/stores/messageStore";

const messageStore = useMessageStore();
const router = useRouter();

const receivedDate = todayString;

onMounted(async () => {
  isLoading.value = true;
  try {
    if (workflowId) {
      workflow.value = await inventoryStore.fetchWorkflowById(workflowId);
      requestWorkflow.value =
        workflow.value?.workflows.find(
          (w: any) =>
            w && typeof w === "object" && w.status === "Restock Request"
        ) || null;

      receiveWorkflow.value =
        workflow.value?.workflows.find(
          (w: any) => w && typeof w === "object" && w.status === "Restocked"
        ) || null;

      // Ensure workflow has 'workflows' property before accessing
      if (workflow.value && Array.isArray(workflow.value.workflows)) {
        for (const w of workflow.value.workflows) {
          const subworkflow = { ...w };
          let userDetail = null;
          if (subworkflow.created_by) {
            userDetail =
              (await userStore.getUserById(subworkflow.created_by)) ||
              subworkflow.created_by;
            subworkflow.created_by_user_name = userDetail?.user || "";
          } else {
            subworkflow.created_by_user_name = "";
          }
          allWorkflows.value.push(subworkflow);
        }
      }

      // Sort allWorkflows: 'Restock Request' first, then 'Restocked', then others
      allWorkflows.value.sort((a, b) => {
        const statusOrder = (status: string) => {
          if (status === "Restocked") return 0;
          if (status === "Restock Request") return 1;
          if (status === "Restock Cancelled") return 0;
          return 3;
        };
        return statusOrder(a.status) - statusOrder(b.status);
      });

      await inventoryStore.fetchSupplierById(workflow.value?.supplier_id);
      supplier.value = inventoryStore.supplier || {
        id: workflow.value?.supplier_id,
      };

      await fetchMaterialTransactions();
      await buildEnrichedRequests();
    }
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoading.value = false;
  }
});

// watch(workflow, async (newVal: DocumentData | null) => {
//   if (newVal) {
//     await fetchMaterialTransactions();
//   }
// });

async function fetchMaterialTransactions() {
  // Defensive check for requestWorkflow
  if (!requestWorkflow.value?.workflow_tracker_id) {
    requestMaterialTransactions.value = [];
  } else {
    await inventoryStore.fetchMaterialTransactionsByWorkflowTrackerId(
      requestWorkflow.value.workflow_tracker_id
    );
    requestMaterialTransactions.value = inventoryStore.materialTransactions;
  }

  // Defensive check for receiveWorkflow
  if (!receiveWorkflow.value?.workflow_tracker_id) {
    receiveMaterialTransactions.value = [];
  } else {
    await inventoryStore.fetchMaterialTransactionsByWorkflowTrackerId(
      receiveWorkflow.value.workflow_tracker_id
    );
    receiveMaterialTransactions.value = inventoryStore.materialTransactions;
  }
}

async function buildEnrichedRequests() {
  // 1. Get all unique material_ids from materialTransactions
  const materialIds = Array.from(
    new Set(requestMaterialTransactions.value.map((tx) => tx.material_id))
  );
  if (!materialIds || materialIds.length === 0) {
    enrichedRequests.value = [];
    return;
  }

  // 2. Fetch materials by IDs
  await inventoryStore.fetchMaterialsByIds(materialIds);

  const materials = Array.isArray(inventoryStore.materialsByIds)
    ? inventoryStore.materialsByIds
    : [];

  // 3. Get unique subcategory_ids from materials
  const subcategoryIds = Array.from(
    new Set(materials.map((mat: any) => mat.subcategory_id))
  );
  if (!subcategoryIds || subcategoryIds.length === 0) {
    enrichedRequests.value = [];
    return;
  }

  await inventoryStore.fetchSubcategoriesByIds(subcategoryIds);
  const subcategoriesResult = inventoryStore.subcategoriesByIds;

  const subcategories = Array.isArray(subcategoriesResult)
    ? subcategoriesResult
    : [];

  // 4. Get unique category_ids from subcategories
  const categoryIds = Array.from(
    new Set(subcategories.map((sub: any) => sub.category_id))
  );
  if (!categoryIds || categoryIds.length === 0) {
    enrichedRequests.value = [];
    return;
  }
  await inventoryStore.fetchCategoriesByIds(categoryIds);
  const categoriesResult = inventoryStore.categoriesByIds;
  const categories = Array.isArray(categoriesResult) ? categoriesResult : [];

  // 5. Build enriched request list
  enrichedRequests.value = requestMaterialTransactions.value.map((tx) => {
    const material =
      materials.find((mat: any) => mat.id === tx.material_id) || {};
    const subcategory =
      subcategories.find((sub: any) => sub.id === material.subcategory_id) ||
      {};
    const category =
      categories.find((cat: any) => cat.id === subcategory.category_id) || {};

    const tx_receive = Array.isArray(receiveMaterialTransactions.value)
      ? receiveMaterialTransactions.value.find(
          (mt) => mt.material_id === tx.material_id
        )
      : undefined;

    return {
      id: tx.id,
      materialId: tx.material_id,
      material: material.material || "",
      subcategory: subcategory.subcategory || "",
      category: category.category || "",
      requested_quantity: tx.quantity,
      received_quantity:
        receiveWorkflow.value && receiveWorkflow.value.status === "Restocked"
          ? tx_receive?.quantity
          : tx.quantity,
      uom: material.uom,
      editing:
        receiveWorkflow.value && receiveWorkflow.value.status === "Restocked"
          ? false
          : true,
      // add other fields as needed
    };
  });
}

// watch(receiveMaterialTransactions, async (newVal) => {
//   try {
//     if (newVal && newVal.length > 0) {
//       await buildEnrichedRequests();
//     } else {
//       enrichedRequests.value = [];
//     }
//   } catch (error) {
//     console.error("Error in materialTransactions watcher:", error);
//   }
// });

const groupedByCategory = computed(() => {
  const groups: Record<string, any[]> = {};
  enrichedRequests.value.forEach((req) => {
    if (!groups[req.category]) groups[req.category] = [];
    groups[req.category].push(req);
  });
  // Sort each category's requests by subcategory, then material
  Object.keys(groups).forEach((cat) => {
    groups[cat].sort((a, b) => {
      if (a.subcategory < b.subcategory) return -1;
      if (a.subcategory > b.subcategory) return 1;
      if (a.material < b.material) return -1;
      if (a.material > b.material) return 1;
      return 0;
    });
  });
  // Sort categories alphabetically
  const sortedGroups: Record<string, any[]> = {};
  Object.keys(groups)
    .sort()
    .forEach((cat) => {
      sortedGroups[cat] = groups[cat];
    });
  return sortedGroups;
});

const comments = ref("");

async function checkinStock() {
  // Validate all received quantities and comments
  const allFilled = enrichedRequests.value.every(
    (req) =>
      req.received_quantity !== null &&
      req.received_quantity !== undefined &&
      req.received_quantity !== "" &&
      req.received_quantity >= 0
  );
  if (!allFilled) {
    alert("Please enter received quantity for all materials.");
    return;
  }
  if (!comments.value.trim()) {
    alert("Please enter comments before submitting.");
    return;
  }

  const submissionData = {
    workflowId: workflow.value?.id || "",
    receivedDate: receivedDate || "",
    order: enrichedRequests.value.map((req) => ({
      materialId: req.materialId,
      quantity: req.received_quantity,
    })),
    comments: comments.value.trim(),
    pageType: String(route.query.pageType || ""),
    root_page: String(route.query.root_page || ""),
    status: String(route.query.status || ""),
  };

  console.log("Prepared submission data:", submissionData);

  const response = await inventoryStore.submitSupplierRestocked(submissionData);

  // Show global message and route if response exists
  if (response && response.route) {
    // Use global message handler

    // router.push(response.route);
    router.go(0);
    messageStore.showMessage(response.message, "success");
  }
}

async function cancelCheckin() {
  // Logic to cancel the check-in, e.g. reset form, navigate away, or show a message
  if (!comments.value.trim()) {
    alert("Please enter comments before cancelling.");
    return;
  }

  const submissionData = {
    workflowId: workflow.value?.id || "",
    comments: comments.value.trim(),
    pageType: String(route.query.pageType || ""),
    root_page: String(route.query.root_page || ""),
    status: String(route.query.status || ""),
  };
  const response = await inventoryStore.cancelSupplierRestockRequest(submissionData);

  // Show global message and route if response exists
  if (response && response.route) {
    // Use global message handler

    // router.push(response.route);
    router.go(0);
    messageStore.showMessage(response.message, "success");
  }

  // Optionally, navigate to another page or close modal
  // router.push('/home')
}
</script>

<style scoped>
table {
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #e2e8f0;
}
</style>
