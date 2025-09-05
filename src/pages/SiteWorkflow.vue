<template>
  <div class="p-2 min-h-screen">
    <nav
      class="flex items-center mb-0 p-2"
      aria-label="Breadcrumb"
      style="background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%)"
    >
      <ol class="flex items-center space-x-1">
        <li v-if="route.query.root_page == 'Home'">
          <router-link
            to="/home"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px] hover:bg-red-200 transition"
          >
            <i class="fas fa-home mr-1"></i> Home
          </router-link>
        </li>
        <li v-if="route.query.root_page == 'Sites'">
          <router-link
            to="/sites"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px] hover:bg-red-200 transition"
          >
            <i class="fas fa-city mr-1"></i> Sites
          </router-link>
        </li>
        <li v-if="route.query.root_page == 'Sites' && route.query.siteId">
          <span class="mx-1 text-red-400">
            <i class="fas fa-chevron-right"></i>
          </span>
        </li>
        <li v-if="route.query.root_page == 'Sites' && route.query.siteId">
          <router-link
            :to="`/sites/${route.query.siteId}`"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px] hover:bg-red-200 transition"
          >
            <i class="fas fa-building mr-1"></i> {{ site?.site }}
          </router-link>
        </li>
        <li>
          <span class="mx-1 text-red-400">
            <i class="fas fa-chevron-right"></i>
          </span>
        </li>
        <li v-if="route.query.pageType">
          <router-link
            :to="`/home/site_status?page_type=${route.query.pageType}&root_page=${route.query.root_page}&status=${route.query.status}`"
            class="inline-flex items-baseline px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px] hover:bg-red-200 transition"
          >
            <i
              class="mr-1"
              :class="
                route.query.pageType == 'Recent Activity'
                  ? 'fas fa-history'
                  : 'fas fa-exchange-alt'
              "
            ></i>
            {{ route.query.pageType }}
          </router-link>
        </li>
        <li v-if="route.query.pageType">
          <span class="mx-1 text-red-400">
            <i class="fas fa-chevron-right"></i>
          </span>
        </li>
        <li>
          <span
            class="inline-flex items-baseline px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px]"
            aria-current="page"
          >
            <i class="mr-1 fas fa-clipboard-check"></i>
            Workflow Details
          </span>
        </li>
      </ol>
    </nav>
    <div class="flex items-center gap-3 mb-1 p-3">
      <div class="bg-red-200 rounded-full p-2">
        <i class="text-lg text-red-700 fas fa-clipboard-check"></i>
      </div>
      <h2 class="text-lg font-bold text-red-700">Site Workflow</h2>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <span class="animate-spin text-3xl text-red-400 mb-2">
        <i class="fas fa-spinner"></i>
      </span>
      <span class="ml-4 text-red-700 font-semibold">Loading...</span>
    </div>

    <div v-else class="p-6 pt-3 mt-1">
      <div
        class="bg-gradient-to-r from-red-400 to-red-100 border-1 border-red-500 px-6 py-3 mb-2 flex items-center gap-2 shadow-lg rounded"
      >
        <span
          class="font-bold text-red-900 flex-1 text-left text-xs tracking-wide"
        >
          Workflow ID:
          <span class="font-bold px-3 py-1 text-red-800 text-[10px]">
            {{ workflow?.workflow_tracker_id || "" }}
          </span>
          <span
            class="px-3 py-1 rounded ml-2 text-[11px] shadow font-medium"
            :class="
              workflow?.current_status === 'Request Cancelled' ||
              workflow?.current_status === 'Request Declined' ||
              workflow?.current_status === 'Return Cancelled' ||
              workflow?.current_status === 'Return Declined'
                ? 'bg-red-500 text-white'
                : 'bg-red-600 text-white'
            "
          >
            {{ workflow?.current_status || "" }}
          </span>
        </span>
        <span
          v-if="site?.site && site?.location"
          class="text-xs text-red-900 font-semibold ml-auto flex items-center gap-1"
        >
          <i class="fas fa-building text-red-600"></i> {{ site.site
          }}<span class="mx-1">|</span
          ><i class="fas fa-map-marker-alt text-red-600"></i
          >{{ site.location }}
        </span>
      </div>

      <div v-for="(subworkflow, index) in allWorkflows" :key="index">
        <div class="mb-2">
          <button
            class="w-full p-3 px-8 rounded-t flex flex-row justify-between items-center gap-4 border-b-2 border-white focus:outline-none"
            :class="
              subworkflow?.status === 'Request Cancelled' ||
              subworkflow?.status === 'Request Declined' ||
              subworkflow?.status === 'Return Cancelled' ||
              subworkflow?.status === 'Return Declined'
                ? 'bg-red-500 text-white'
                : 'bg-red-500 text-white'
            "
            @click="toggleAccordion(index)"
          >
            <span class="font-bold flex-1 text-left">
              <i class="mr-1 text-base fas fa-clipboard-check"></i>
              Event ID:
              <span class="font-semibold text-center ml-2">{{
                subworkflow?.workflow_tracker_id || "N/A"
              }}</span>
            </span>
            <span>
              <i
                :class="
                  expandedIndices.includes(index)
                    ? 'fas fa-chevron-up'
                    : 'fas fa-chevron-down'
                "
              ></i>
            </span>
          </button>
          <transition name="fade">
            <div v-show="expandedIndices.includes(index)">
              <div class="bg-red-50 rounded-b shadow py-4 px-8 mb-6">
                <div
                  :class="[
                    'gap-y-2 gap-x-10 mb-2',
                    [
                      'Request Cancelled',
                      'Request Declined',
                      'Return Cancelled',
                      'Return Declined',
                    ].includes(subworkflow?.status)
                      ? 'grid grid-rows-2 md:grid-rows-2'
                      : 'grid grid-rows-3 md:grid-rows-3',
                  ]"
                >
                  <div
                    class="grid grid-cols-3 md:grid-cols-3 w-full mb-1 items-center justify-between"
                  >
                    <div class="flex items-center">
                      <span
                        class="font-semibold text-red-700 mr-2 min-w-[80px]"
                        >Action:</span
                      >
                      <span
                        class="ml-8 inline-block px-3 py-1 rounded-full font-semibold text-xs text-center min-w-[90px]"
                        :class="
                          subworkflow?.status === 'Request Cancelled' ||
                          subworkflow?.status === 'Request Declined' ||
                          subworkflow?.status === 'Return Cancelled' ||
                          subworkflow?.status === 'Return Declined'
                            ? 'bg-red-200 text-red-600'
                            : 'bg-red-200 text-red-700'
                        "
                      >
                        {{ subworkflow?.status }}
                      </span>
                    </div>
                    <div class="flex items-center">
                      <span
                        class="font-semibold text-red-700 mr-2 min-w-[80px]"
                        >Action By:</span
                      >
                      <span
                        class="ml-8 font-medium text-red-900 min-w-[90px]"
                        >{{ subworkflow?.created_by_user_name || "" }}</span
                      >
                    </div>
                    <div class="flex items-center">
                      <span
                        class="font-semibold text-red-700 mr-2 min-w-[80px]"
                        >Actioned On:</span
                      >
                      <span
                        class="ml-8 font-medium text-red-900 min-w-[90px]"
                        >{{
                          subworkflow?.created_at
                            ? formatReadableDate(subworkflow.created_at)
                            : "N/A"
                        }}</span
                      >
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-3 md:grid-cols-3 w-full mb-2 items-center justify-between"
                    v-if="
                      ![
                        'Request Cancelled',
                        'Request Declined',
                        'Return Cancelled',
                        'Return Declined',
                      ].includes(subworkflow?.status)
                    "
                  >
                    <div
                      class="flex items-center"
                      v-if="subworkflow?.status == 'Requested'"
                    >
                      <span
                        class="font-semibold text-red-700 mr-2 min-w-[90px]"
                        >Requested Date:</span
                      >
                      <span
                        class="ml-8 font-medium text-red-900 min-w-[90px]"
                        >{{ formatDate(subworkflow?.request_date) }}</span
                      >
                    </div>
                    <div
                      class="flex mb-3"
                      v-if="subworkflow?.status == 'Requested'"
                    >
                      <span
                        class="font-semibold text-red-700 mr-2 min-w-[90px]"
                        >Expected Date:</span
                      >
                      <span
                        class="ml-8 font-medium text-red-900 min-w-[90px]"
                        >{{ formatDate(subworkflow?.delivery_date) }}</span
                      >
                    </div>
                    <div class="flex mb-3" v-if="subworkflow?.dispatch_date">
                      <span
                        class="font-semibold text-red-700 mr-2 min-w-[90px]"
                        >Dispatch Date:</span
                      >
                      <span
                        class="ml-8 font-medium text-red-900 min-w-[90px]"
                        >{{ formatDate(subworkflow?.dispatch_date) }}</span
                      >
                    </div>
                    <div class="flex mb-3" v-if="subworkflow?.received_date">
                      <span class="font-semibold text-red-700 min-w-[90px]"
                        >Received Date:</span
                      >
                      <span
                        class="ml-8 font-medium text-red-900 min-w-[90px]"
                        >{{ formatDate(subworkflow?.received_date) }}</span
                      >
                    </div>
                    <div
                      class="flex items-center"
                      v-if="subworkflow?.status == 'Returned'"
                    >
                      <span
                        class="font-semibold text-red-700 mr-2 min-w-[90px]"
                        >Returned Date:</span
                      >
                      <span
                        class="ml-8 font-medium text-red-900 min-w-[90px]"
                        >{{ formatDate(subworkflow?.return_date) }}</span
                      >
                    </div>
                  </div>
                  <div class="flex">
                    <span class="font-semibold text-red-700 min-w-[95px]"
                      >Comments:</span
                    >
                    <span class="ml-8 font-medium text-red-900">{{
                      subworkflow?.comments
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Materials Table -->
      <div
        v-for="(requests, category) in groupedByCategory"
        :key="category"
        class="mb-10 px-2 mt-5"
      >
        <h3 class="text-red-600 font-bold text-sm mb-4">
          <i class="fas fa-hard-hat mr-3"></i>{{ category }}
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs border rounded">
            <thead>
              <tr class="bg-red-100 text-red-700">
                <th class="py-2 px-3 text-left">Subcategory</th>
                <th class="py-2 px-3 text-left">Material</th>
                <th
                  v-for="header in columnHeaders"
                  :key="header.status"
                  class="py-2 px-3 text-left"
                >
                  {{ header.status }}
                </th>

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
                  {{ req?.material }}
                  <span
                    v-if="showMaterialAvailability"
                    class="ml-2 text-[10px] px-2 py-1 rounded bg-red-100 text-red-700 font-semibold"
                    >Available at HO: {{ req?.stock_at_ho || 0 }}</span
                  >
                </td>
                <td
                  v-for="header in columnHeaders"
                  :key="header.status"
                  class="py-2 px-3 align-middle"
                >
                  <template v-if="header.editable">
                    <input
                      :disabled="countsEditable"
                      required
                      type="number"
                      v-model.number="(req.transactions.find((t: { status: string; }) => t.status === header.status) || {}).quantity"
                      min="0"
                      class="border rounded px-2 py-1 w-20 text-right"
                      :style="{
                      background:
                      (() => {
                        const idx = req.transactions.findIndex((t: { status: string }) => t.status === header.status);
                        if (header.editable && idx > 0) {
                          const current = req.transactions[idx]?.quantity;
                          const prev = req.transactions[idx - 1]?.quantity;
                          // Convert stock_available_at_site to number before comparing
                          const stockAvailable = Number(req?.stock_at_ho) || 0;
                          if (!isNaN(stockAvailable) && current > stockAvailable && header.status === 'Dispatch') {
                              return '#FCA5A5'; // red-300
                          }
                          return current !== prev ? '#FEF9C3' : '';
                        }
                        return '';
                      })()
                    }"
                      @change="
                      () => {
                        if (req && req.transactions) {
                          const transaction = req.transactions.find(
                            (t: { status: string }) => t.status === header.status
                          );
                          if (transaction) {
                            if (transaction?.quantity < 0) {
                              transaction.quantity = 0;
                            }
                          }
                        }
                      }"
                    />
                  </template>
                  <template v-else>
                    {{
                      req.transactions.find(
                        (t: { status: string }) => t.status === header.status
                      )?.quantity ?? ""
                    }}
                  </template>
                </td>
                <td class="py-2 px-3 align-middle">{{ req?.uom || "" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Check-In Comments and Actions -->
      <div class="mt-8 p-3">
        <div v-if="isActionable">
          <div v-if="submitButtonLabel === 'Dispatch Stock'">
            <div class="flex mb-3">
              <span class="font-semibold text-red-700 w-36 text-left"
                >Dispatch Date:<span class="text-red-500 ml-1">*</span></span
              >
              <input
                type="date"
                class="ml-2 w-40 text-left border rounded px-2 py-1"
                v-model="dispatchDate"
                :max="todayString"
                required
              />
            </div>
          </div>
          <div v-if="submitButtonLabel === 'Receive Stock' || submitButtonLabel === 'Accept Stock'">
            <div class="flex mb-3">
              <span class="font-semibold text-red-700 w-36 text-left"
                >Received Date:<span class="text-red-500 ml-1">*</span></span
              >
              <input
                type="date"
                class="ml-2 w-40 text-left border rounded px-2 py-1"
                v-model="receivedDate"
                :max="todayString"
                required
              />
            </div>
          </div>
          <label class="block text-red-700 font-semibold mb-2"
            >Comments<span class="text-red-500 ml-1">*</span></label
          >
          <textarea
            v-model="comments"
            required
            rows="3"
            class="w-full border rounded px-3 py-2 mb-4"
            placeholder="Enter comments..."
          ></textarea>
        </div>

        <div class="flex gap-4 justify-end">
          <button
            :key="submitButtonLabel"
            v-if="isLoading === false && submitButtonLabel"
            @click="checkinStock"
            class="bg-red-500 text-white px-4 py-2 rounded font-semibold shadow hover:bg-red-600 transition"
          >
            {{ submitButtonLabel }}
          </button>
          <button
            v-if="isLoading === false && cancelButtonLabel"
            @click="cancelCheckin"
            class="bg-red-500 text-white px-4 py-2 rounded font-semibold shadow hover:bg-red-600 transition"
          >
            {{ cancelButtonLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { DocumentData } from "firebase/firestore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useUserStore } from "@/stores/userStore";
import { useSiteStore } from "@/stores/siteStore";
import { formatDate, formatReadableDate } from "@/utils/date";
import { useAuth } from "@/composables/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { groupBy } from "lodash-es";
import { useMessageStore } from "@/stores/messageStore";
import { countsEditable, Role } from "@/utils/permissions";

const router = useRouter();
const userStore = useUserStore();
const inventoryStore = useInventoryStore();
const siteStore = useSiteStore();
const authStore = useAuthStore();
const authUser = authStore.user;
const messageStore = useMessageStore();

const route = useRoute();
const isLoading = ref(true);
const isActionable = ref(false);
const submitButtonLabel = ref("");
const cancelButtonLabel = ref("");
const showMaterialAvailability = ref(false);

let workflowId = route.query.workflowId || "";
if (Array.isArray(workflowId)) workflowId = workflowId[0] || "";

const workflow = ref<DocumentData | null>(null);

const site = ref<any>(null);
const supplier = ref<any>(null);
const allWorkflows = ref<any[]>([]);
const enrichedRequests = ref<any[]>([]);
const columnHeaders = ref<Array<{ status: string; editable: boolean }>>([]);
const today = new Date();
const todayString = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const dispatchDate = todayString;
const receivedDate = todayString;

// Track which workflows are expanded (multiple allowed)
const expandedIndices = ref<number[]>([]);

function toggleAccordion(index: number) {
  const i = expandedIndices.value.indexOf(index);
  if (i > -1) {
    expandedIndices.value.splice(i, 1);
  } else {
    expandedIndices.value.push(index);
  }
}

const groupedByCategory = computed(() => {
  // Group by category
  const grouped = groupBy(enrichedRequests.value, "category");

  // For each category, sort by subcategory and then material name
  Object.keys(grouped).forEach((category) => {
    grouped[category].sort((a, b) => {
      if (a.subcategory === b.subcategory) {
        return a.material.localeCompare(b.material);
      }
      return a.subcategory.localeCompare(b.subcategory);
    });
  });
  return grouped;
});

onMounted(async () => {
  isLoading.value = true;

  try {
    if (workflowId) {
      workflow.value = await inventoryStore.fetchWorkflowById(workflowId);

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
          if (status === "Requested") return 3;
          if (status === "Dispatched") return 2;
          if (status === "Received") return 1;

          if (status === "Request Cancelled") return 1;
          if (status === "Request Declined") return 1;

          if (status === "Consumed") return 1;
          if (status === "Returned") return 2;
          if (status === "Return Accepted") return 1;
          if (status === "Return Cancelled") return 1;
          if (status === "Return Declined") return 1;

          return 4;
        };
        return statusOrder(a.status) - statusOrder(b.status);
      });

      await siteStore.fetchSiteById(workflow.value?.site_id);
      site.value = siteStore.site || { id: workflow.value?.site_id };
      // Keep all accordions open by default
      expandedIndices.value = allWorkflows.value.map((_, idx) => idx);

      // await inventoryStore.fetchSupplierById(workflow.value?.supplier_id);
      // supplier.value = inventoryStore.supplier || {
      //   id: workflow.value?.supplier_id,
      // };

      const materialCounts: Record<
        string,
        Array<{ status: string; quantity: number }>
      > = {};

      // Reverse allWorkflows and extract their statuses
      let workflowOrderByStatus = allWorkflows.value
        .slice()
        .reverse()
        .map((wf) => wf.status);

      workflowOrderByStatus.forEach((status) => {
        if (
          ![
            "Request Cancelled",
            "Request Declined",
            "Return Cancelled",
            "Return Declined",
          ].includes(status)
        ) {
          columnHeaders.value.push({
            status,
            editable: false,
          });
        }
      });

      await Promise.all(
        allWorkflows.value
          .slice()
          .reverse()
          .map(async (singleWorkflow) => {
            await inventoryStore.fetchMaterialTransactionsByWorkflowTrackerId(
              singleWorkflow.workflow_tracker_id
            );

            inventoryStore.materialTransactions.forEach((transaction) => {
              const materialId = transaction.material_id;

              if (!materialCounts[materialId]) {
                materialCounts[materialId] = [];
              }
              materialCounts[materialId].push({
                status: singleWorkflow.status,
                quantity: transaction.quantity,
              });
            });
          })
      );
      // Assign as plain object, not a ref, to avoid recursive reactivity
      const organizedCounts = organizeMaterialCountsBasedOnRoleAndStatus(
        workflow,
        materialCounts,
        columnHeaders
      );
      // materialCounts.value = organizedCounts;
      await getMaterialCategorySubcategory(organizedCounts);
    }
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoading.value = false;
  }
  isLoading.value = false;
});

async function getMaterialCategorySubcategory(materialCounts: any) {
  // Get stock_available_at_site directly from materials collection
  const materialIds = Object.keys(materialCounts);
  await inventoryStore.fetchMaterialsByIds(materialIds);

  // Build an array of materials with category, subcategory, name, and stock_available_at_site
  enrichedRequests.value = materialIds.map((materialId) => {
    const mat =
      inventoryStore.materialsByIds.find((m) => m.id === materialId) || {};
    return {
      materialId,
      category: mat.category_name || "Unknown",
      subcategory: mat.subcategory_name || "Unknown",
      material: mat.material || "Unknown",
      stock_at_ho: mat.stock_at_ho ?? 0,
      uom: mat.uom || "",
      transactions: materialCounts[materialId] || [],
    };
  });
}

function organizeMaterialCountsBasedOnRoleAndStatus(
  workflow: any,
  materialCounts: any,
  columnHeaders: any
) {
  const approver =
    authUser?.role == Role.Management || authUser?.role == Role.HOStaff
      ? "HO"
      : "Site";
  const status = workflow?.value.current_status;

  if (approver == "HO") {
    if (status === "Requested") {
      cancelButtonLabel.value = "Decline Stock Request";
      submitButtonLabel.value = "Dispatch Stock";
      showMaterialAvailability.value = true;
    } else if (status === "Returned") {
      cancelButtonLabel.value = "Decline Stock Return";
      submitButtonLabel.value = "Accept Stock";
    }
  } else if (approver == "Site") {
    if (status === "Requested") {
      cancelButtonLabel.value = "Cancel Stock Request";
    } else if (status === "Returned") {
      cancelButtonLabel.value = "Cancel Stock Return";
    } else if (status === "Dispatched") {
      submitButtonLabel.value = "Receive Stock";
    }
  }

  isActionable.value =
    submitButtonLabel.value != "" || cancelButtonLabel.value != "";

  if (approver == "HO" && ["Requested", "Returned"].includes(status)) {
    return organizeMaterialCountByStatus(status, materialCounts, columnHeaders);
    // Logic for organizing material counts for Management or HO Staff in Requested status
  } else if (approver == "Site" && status == "Dispatched") {
    return organizeMaterialCountByStatus(status, materialCounts, columnHeaders);
    // Logic for organizing material counts for Site Staff in Dispatched status
  } else {
    return materialCounts;
  }
}

function organizeMaterialCountByStatus(
  status: string,
  materialCounts: any,
  columnHeaders: any
) {
  const newColumnStatus =
    status === "Requested"
      ? "Dispatch"
      : status === "Returned"
      ? "Accept Return"
      : status === "Dispatched"
      ? "Received"
      : "";

  if (newColumnStatus !== "") {
    columnHeaders.value.push({
      status: newColumnStatus,
      editable: true,
    });
  }

  // For each material, push the new "Dispatch" transaction along with existing transactions
  Object.entries(materialCounts).forEach(([materialId, transactions]) => {
    const txns = transactions as Array<{ status: string; quantity: number }>;
    const dispatchTransactions = txns
      .filter((t) => t.status === status)
      .map((t) => ({ ...t, status: newColumnStatus }));

    // Push the new dispatch transaction(s) to the existing array
    (
      materialCounts[materialId] as Array<{ status: string; quantity: number }>
    ).push(...dispatchTransactions);
  });

  // Return plain object, not a ref
  const newMaterialCounts = Object.fromEntries(
    Object.entries(materialCounts).map(([materialId, transactions]) => [
      materialId,
      transactions as Array<{ status: string; quantity: number }>,
    ])
  );

  return newMaterialCounts;
}

const comments = ref("");

async function checkinStock() {
  if (isActionable.value) {
    if (!comments.value.trim()) {
      alert("Please enter comments before submitting.");
      return;
    }
    // Check if all editable quantity fields are filled and valid
    let allFilled = true;
    for (const req of enrichedRequests.value) {
      for (const header of columnHeaders.value) {
        if (header.editable) {
          const txn = req.transactions.find(
            (t: { status: string }) => t.status === header.status
          );
          if (
            !txn ||
            txn.quantity === undefined ||
            txn.quantity === null ||
            txn.quantity < 0 ||
            isNaN(txn.quantity) ||
            txn.quantity === ""
          ) {
            allFilled = false;
            break;
          }
        }
      }
      if (!allFilled) break;
    }
    if (!allFilled) {
      alert("Please fill all required quantity fields before submitting.");
      return;
    }

    if (
      (submitButtonLabel.value == "Dispatch Stock" &&
        workflow.value?.current_status === "Requested") ||
      (submitButtonLabel.value == "Receive Stock" &&
        workflow.value?.current_status === "Dispatched") ||
      (submitButtonLabel.value == "Accept Stock" &&
        workflow.value?.current_status === "Returned")
    ) {
      let statusCheck: string;
      let dateObject: { [key: string]: any } = {};
      if (submitButtonLabel.value == "Dispatch Stock") {
        statusCheck = "Dispatch";
        dateObject = { dispatchDate: dispatchDate };
      } else if (submitButtonLabel.value == "Receive Stock") {
        statusCheck = "Receive";
        dateObject = { receivedDate: receivedDate };
      } else if (submitButtonLabel.value == "Accept Stock") {
        statusCheck = "Return";
        dateObject = { receivedDate: receivedDate };
      } else {
        statusCheck = "";
      }

      if (statusCheck != "") {
        if (
          enrichedRequests.value.some(
            (req) =>
              req.transactions.find(
                (t: { status: string }) => t.status === statusCheck
              )?.quantity > req.stock_at_ho
          ) &&
          statusCheck === "Dispatch"
        ) {
          alert(
            "Quantity cannot exceed available stock at HO. Please adjust the quantities."
          );
          return;
        } else {
          // Prepare data for submission
          const submissionData = {
            workflowId: workflow.value?.id || "",
            comments: comments.value.trim(),
            ...dateObject,
            submitType: statusCheck,
            pageType: String(route.query.pageType || ""),
            root_page: String(route.query.root_page || ""),
            status: String(route.query.status || ""),

            order: enrichedRequests.value.map((req) => {
              const editableHeader = columnHeaders.value.find(
                (header) => header.editable
              );
              const quantity = editableHeader
                ? req.transactions.find(
                    (t: { status: string }) =>
                      t.status === editableHeader.status
                  )
                : null;
              return {
                materialId: req.materialId,
                quantity: quantity.quantity,
              };
            }),
          };

          // Submit the form data
          const response = await inventoryStore.siteStockBulk(submissionData);
          if (response && response.route) {
            router.go(0);
            messageStore.showMessage(response.message, "success");
          }
        }
      } else {
        messageStore.showMessage("Something went wrong!!", "error");
        return;
      }
    }
  }
}

async function cancelCheckin() {
  if (!comments.value.trim()) {
    alert("Please enter comments before submitting.");
    return;
  }

  if (workflow.value?.current_status === "Requested") {
    if (
      cancelButtonLabel.value == "Cancel Stock Request" ||
      cancelButtonLabel.value == "Decline Stock Request"
    ) {
      const cancelType =
        cancelButtonLabel.value == "Cancel Stock Request"
          ? "Cancel"
          : cancelButtonLabel.value == "Decline Stock Request"
          ? "Decline"
          : "";
      if (cancelType != "") {
        const submissionData = {
          workflowId: workflow.value?.id || "",
          comments: comments.value.trim(),
          pageType: String(route.query.pageType || ""),
          root_page: String(route.query.root_page || ""),
          status: String(route.query.status || ""),
          cancelType: cancelType,
        };
        const response = await inventoryStore.cancelSiteRequest(submissionData);

        if (response && response.route) {
          router.go(0);
          messageStore.showMessage(response.message, "success");
        }
      } else {
        messageStore.showMessage("Something went wrong!!", "success");
        return;
      }
    } else {
      messageStore.showMessage("Something went wrong!!", "success");
      return;
    }
  } else if (workflow.value?.current_status === "Returned") {
if (
      cancelButtonLabel.value == "Cancel Stock Return" ||
      cancelButtonLabel.value == "Decline Stock Return"
    ) {
      const cancelType =
        cancelButtonLabel.value == "Cancel Stock Return"
          ? "Cancel"
          : cancelButtonLabel.value == "Decline Stock Return"
          ? "Decline"
          : "";
      if (cancelType != "") {
        const submissionData = {
          workflowId: workflow.value?.id || "",
          comments: comments.value.trim(),
          pageType: String(route.query.pageType || ""),
          root_page: String(route.query.root_page || ""),
          status: String(route.query.status || ""),
          cancelType: cancelType,
        };
        const response = await inventoryStore.cancelSiteReturn(submissionData);

        if (response && response.route) {
          router.go(0);
          messageStore.showMessage(response.message, "success");
        }
      } else {
        messageStore.showMessage("Something went wrong!!", "success");
        return;
      }
    } else {
      messageStore.showMessage("Something went wrong!!", "success");
      return;
    }  }
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
