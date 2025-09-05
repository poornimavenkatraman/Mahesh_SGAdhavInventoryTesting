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
            <i class="fas fa-building mr-1"></i> {{ route.query.site }}
          </router-link>
        </li>
        <li>
          <span class="mx-1 text-red-400">
            <i class="fas fa-chevron-right"></i>
          </span>
        </li>
        <li>
          <span
            class="inline-flex items-baseline px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px]"
            aria-current="page"
          >
            <i
              class="mr-1"
              :class="
                pageType == 'Recent Activity'
                  ? 'fas fa-history'
                  : 'fas fa-exchange-alt'
              "
            ></i>
            {{ pageType }}
          </span>
        </li>
      </ol>
    </nav>
    <div class="flex items-center gap-3 mb-1 p-3">
      <div class="bg-red-200 rounded-full p-2">
        <i
          class="text-xl text-red-700"
          :class="
            pageType == 'Recent Activity'
              ? 'fas fa-history'
              : 'fas fa-exchange-alt'
          "
        ></i>
      </div>
      <h2 class="text-lg font-bold text-red-700">
        {{ pageType }}
      </h2>
    </div>

    <div class="px-4">
      <div class="max-w-3xl">
        <div class="text-red-700 font-semibold text-lg mb-2">Filters</div>
        <div class="mb-2 flex flex-wrap gap-4 items-center">
          <input
            v-model="filterBy"
            type="text"
            placeholder="Requested By..."
            class="flex-1 min-w-[140px] border border-red-200 rounded px-3 py-2 font-semibold text-red-700 bg-white shadow-sm"
          />
          <select
            v-model="filterSite"
            :disabled="!!route.query.site"
            class="flex-1 min-w-[140px] border border-red-200 rounded px-3 py-2 font-semibold text-red-700 bg-white shadow-sm"
          >
            <option value="">All Sites</option>
            <option v-for="site in uniqueSites" :key="site" :value="site">
              {{ site }}
            </option>
          </select>
          <select
            v-model="filterType"
            class="flex-1 min-w-[140px] border border-red-200 rounded px-3 py-2 font-semibold text-red-700 bg-white shadow-sm"
          >
            <option value="">Request Type</option>
            <option value="Bulk">Bulk</option>
            <option value="Individual">Individual</option>
          </select>
          <!-- filepath: c:\Users\akka\Desktop\code\inventory_system\src\pages\SiteRequests.vue -->
          <!-- Add "Received at Site" to status filter dropdown -->
          <MultiSelect
            v-model="filterStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            optionGroupLabel="label"
            optionGroupChildren="statuses"
            placeholder="Filter Status(es)"
            class="flex-1 min-w-[180px] text-xs"
            display="chip"
            showClear
          />
        </div>
        <div class="mb-6 flex flex-wrap gap-4 items-center">
          <input
            v-model="dateRange.start"
            type="date"
            class="flex-1 border border-red-200 rounded px-3 py-2 font-semibold text-red-700 bg-white shadow-sm"
          />
          <span class="text-gray-500 font-semibold">to</span>
          <input
            v-model="dateRange.end"
            type="date"
            class="flex-1 border border-red-200 rounded px-3 py-2 font-semibold text-red-700 bg-white shadow-sm"
          />
        </div>
      </div>

      <!-- Requests Table -->
      <div class="overflow-x-auto">
        <table
          class="min-w-full bg-white rounded-xl shadow-md border border-red-100"
        >
          <thead>
            <tr class="text-red-800 table-header-gradient">
              <th
                v-for="col in [
                  'id',
                  'site',
                  'type',
                  'No of Materials',
                  'requestedBy',
                  'date',
                  'status',
                ]"
                :key="col"
                @click="setSort(col)"
                class="py-3 px-4 text-left font-bold cursor-pointer hover:bg-red-300 transition"
                :class="col === 'id' ? 'border-l-1 border-red-200' : ''"
              >
                {{
                  col === "id"
                    ? "Workflow Id"
                    : col.charAt(0).toUpperCase() +
                      col.slice(1).replace(/([A-Z])/g, " $1")
                }}
                <span v-if="sortBy.includes(col)">
                  {{ sortOrder[col] === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th class="py-3 px-4 text-left font-bold">View</th>
            </tr>
          </thead>
          <tbody>
            <!-- Defensive checks for request properties in table rendering -->
            <template v-for="req in paginatedRequests" :key="req.id">
              <tr
                
                class=""
                @click="toggleExpand(req.id)"
              >
                <td
                  class="py-2 px-4 border-l-1 border-red-200 font-semibold text-gray-700"
                >
                  {{ req.id ?? "" }}
                </td>
                <td class="py-2 px-4 font-semibold text-red-700">
                  {{ req.site ?? "" }}
                </td>
                <td class="py-2 px-4 text-red-600 font-semibold">
                  {{ req.type ?? "" }}
                </td>
                <td class="py-2 px-4 text-red-600 font-semibold">
                  {{ req.noOfMaterials ?? "" }}
                </td>
                <td class="py-2 px-4 text-gray-600 font-semibold">
                  {{ req.requestedBy ?? "" }}
                </td>
                <td class="py-2 px-4 text-gray-600">{{ req.date ?? "" }}</td>
                <td class="py-2 px-4">
                  <span
                    :class="[
                      'inline-block px-3 py-1 rounded-full font-semibold text-xs',
                      req.status === 'Requested'
                        ? 'bg-yellow-100 text-yellow-700'
                        : req.status === 'Request Cancelled'
                        ? 'bg-red-100 text-red-700'
                        : req.status === 'Request Declined'
                        ? 'bg-red-100 text-red-700'
                        : req.status === 'Dispatched'
                        ? 'bg-green-100 text-green-700'
                        : req.status === 'Received'
                        ? 'bg-red-100 text-red-700'
                        : req.status === 'Consumed'
                        ? 'bg-lime-100 text-lime-700'
                        : req.status === 'Returned'
                        ? 'bg-purple-100 text-purple-700'
                        : req.status === 'Return Cancelled'
                        ? 'bg-red-100 text-red-700'
                        : req.status === 'Return Declined'
                        ? 'bg-red-100 text-red-700'
                        : req.status === 'Restock Request'
                        ? 'bg-orange-100 text-orange-700'
                        : req.status === 'Restocked'
                        ? 'bg-orange-200 text-orange-800'
                        : req.status === 'Restock Cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600',
                    ]"
                  >
                    {{ req.status ?? "" }}
                  </span>
                </td>
                <td class="py-2 px-4 flex gap-2 border-red-50">
                  <button
                    @click.stop="viewDetails(req)"
                    class="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded shadow flex items-center gap-1 font-semibold"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
              <!-- Expanded Row -->
              <tr
                v-if="expandedIds.includes(req.id)"
                class="border-t-2 border-red-100"
              >
                <td
                  colspan="8"
                  class="px-6 py-4 border-l-2 border-red-500 border-b-2 border-r-2"
                >
                  <!-- filepath: c:\Users\akka\Desktop\code\inventory_system\src\pages\SiteRequests.vue -->
                  <WorkflowCard
                    :request="req"
                    @step-click="(step) => alert(`${step} Step Clicked`)"
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <!-- Pagination Controls -->
      <div class="flex justify-end items-center mt-6 gap-4">
        <button
          class="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold shadow hover:bg-red-200"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Prev
        </button>
        <span class="font-semibold text-red-700"
          >Page {{ currentPage }} of {{ totalPages }}</span
        >
        <button
          class="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold shadow hover:bg-red-200"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>

    <!-- <AcceptRestockRequestModal
      v-if="showAcceptRestockModal"
      :request="restockRequestData"
      @close="showAcceptRestockModal = false"
      @accept="handleAcceptedRestock"

    />

    <ReceiveStockAtSiteModal
      v-if="showReceiveStockAtSiteModal"
      :request="receiveStockAtSiteData"
      @close="showReceiveStockAtSiteModal = false"
    /> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import WorkflowCard from "@/components/WorkflowCard.vue";
import DispatchStock from "@/components/DispatchStock.vue";
import MultiSelect from "primevue/multiselect";
// import AcceptRestockRequestModal from "@/components/AcceptRestockRequestModal.vue";
// import ReceiveStockAtSiteModal from "@/components/ReceiveStockAtSiteModal.vue";
import { useSiteStore } from "@/stores/siteStore";
import { useUserStore } from "@/stores/userStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { formatReadableDate } from "@/utils/date";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const route = useRoute();

const userStore = useUserStore();
const siteStore = useSiteStore();
const inventoryStore = useInventoryStore();

const showAcceptRestockModal = ref(false);
const restockRequestData = ref(null);
const showReceiveStockAtSiteModal = ref(false);
const receiveStockAtSiteData = ref(null);

const expandedIds = ref([]);

const pageType = ref(route.query.page_type || "Material Transactions");
const filterType = ref("");
const filterStatus = ref(route.query.status ? [route.query.status.trim()] : []);
const filterBy = ref("");
const dateRange = ref({ start: "", end: "" });
const currentPage = ref(1);
const pageSize = ref(5);
const filterSite = ref(route.query.site || "");

// const { user } = useAuth();

const authStore = useAuthStore();
const authUser = authStore.user;

// Add: Watch for route.query.site changes and update filterSite
watch(
  () => route.query.site,
  (newSite) => {
    filterSite.value = newSite || "";
  }
);

const sortBy = ref(["date"]);
const sortOrder = ref({
  site: "asc",
  status: "asc",
  requestedBy: "asc",
  date: "desc",
  workflowId: "asc",
  noOfMaterials: "asc",
  type: "asc",
});

let allWorkflows = ref([]);

onMounted(async () => {
  await userStore.fetchUsers();
  await siteStore.fetchActiveSites();
  await siteStore.fetchAccessibleSites();


  // allWorkflows.value = [
  //   ...inventoryStore.activeSitesWorkflows,
  //   ...inventoryStore.supplierWorkflows,
  // ];
 
  if (pageType.value === "Supplier Material Transactions") {
    if(authUser.role === Role.Management || authUser.role === Role.HOStaff){
      await inventoryStore.fetchSupplierWorkflows();
      allWorkflows.value = [...inventoryStore.supplierWorkflows];
      
    }

  } else if (
    pageType.value === "Site Material Transactions" ||
    pageType.value === "Material Transactions"

  ) {
    await inventoryStore.fetchActiveSitesWorkflows();
    allWorkflows.value = [...inventoryStore.activeSitesWorkflows];

  } else if (pageType.value === "Recent Activity") {
    await inventoryStore.fetchActiveSitesWorkflows();
    allWorkflows.value = [
      ...inventoryStore.activeSitesWorkflows,
    ];
    if(user.value.role === Role.Management || user.value.role === Role.HOStaff){
      await inventoryStore.fetchSupplierWorkflows();
      allWorkflows.value = [...inventoryStore.supplierWorkflows];
    }
    
  }
  console.log(allWorkflows.value);
});

// Allow sorting by all columns except Actions
function setSort(col) {
  // Prevent sorting for Actions column
  if (col === "Actions") return;
  let key = col;
  if (col === "No of Materials") key = "noOfMaterials";
  if (col === "requestedBy") key = "requestedBy";
  // Toggle sort order or set new sort column
  if (sortBy.value.includes(key)) {
    sortOrder.value[key] = sortOrder.value[key] === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = [key];
    sortOrder.value[key] = "asc";
  }
}

import { allTransactions } from "@/utils/states";
import { useAuthStore } from "@/stores/authStore";
import { Role } from "@/utils/permissions";

// Prepare statusOptions from utils states, allTransactions
const statusOptions = computed(() => {
  // Flatten allTransactions to group by type and map states to label/value
  const groups = allTransactions.map(group => ({
    label: group.type === "Supplier" ? "Supplier Transactions" : "Site Transactions",
    statuses: group.states.map(state => ({
      label: state.replace(/-/g, " "),
      value: state
    }))
  }));

  if (pageType.value === "Supplier Material Transactions") {
    return [groups.find(g => g.label === "Supplier Transactions")];
  } else if (pageType.value === "Site Material Transactions") {
    return [groups.find(g => g.label === "Site Transactions")];
  } else if (pageType.value === "Recent Activity") {
    return groups;
  } else {
    return groups;
  }
});

const uniqueSites = computed(() => {
  const allSites = allWorkflows.value.map((r) => {
    return (
      siteStore.activeSites.find((s) => s.id === r.site_id)?.site ||
      r.site_id ||
      "HO"
    );
  });
  return Array.from(new Set(allSites)).sort();
});
const requests = computed(() => {
  return allWorkflows.value.map((tx, idx) => {
    const isBulk = Array.isArray(tx.stock) && tx.stock.length > 1;
    
    let workflowArr = [];
    workflowArr = (tx.workflows || [])
    .map((w) => {
      const user = userStore.users.find((u) => u.id === w.created_by);
      return {
        transaction_type: w.status,
        created_by_user_id: w.created_by,
        created_by_user_name: user ? user.user : w.created_by,
        created_at: formatReadableDate(w.created_at),
        workflow_tracker_id: w.workflow_tracker_id,
      };
    });
    return {
      id: tx.workflow_tracker_id,
      workflowId: tx.id || "",
      site:
        siteStore.activeSites.find((s) => s.id === tx.site_id)?.site ||
        tx.site_id ||
        "HO",
      siteId: tx.site_id || "",
      siteLocation:
        siteStore.activeSites.find((s) => s.id === tx.site_id)?.location || "",
      // type: Math.random() < 0.5 ? "Individual" : "Bulk",
      type: (() => {
        // Find the workflow object matching the current status
        const noOfMaterials =
          (tx.workflows || []).find((w) => w.status === tx.current_status)
            ?.no_of_materials || 0;
        const workflowStatus = tx.current_status?.trim();
        if (workflowStatus && noOfMaterials > 1) {
          return "Bulk";
        }
        return "Individual";
      })(),
      noOfMaterials:
        (tx.workflows || []).find((w) => w.status === tx.current_status)
          ?.no_of_materials || 0,

      requestedBy: (() => {
        const updatedById =
          (tx.workflows || []).find((w) => w.status === tx.current_status)
            ?.updated_by || "";
        const user = userStore.users.find((u) => u.id === updatedById);
        return user ? user.user : updatedById;
      })(),

      // requestedById: (() => {
      //   const createdById =
      //     (tx.workflows || []).find((w) => w.status === tx.current_status)
      //       ?.created_by || "";
      //   return createdById;
      // })(),

      date: (() => {
        const updatedAt =
          (tx.workflows || []).find((w) => w.status === tx.current_status)
            ?.updated_at || "";

        return formatReadableDate(updatedAt);
      })(),
      status: tx.current_status.trim() || "",
      workflows: workflowArr,
    };
  });
});

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return sortedFilteredRequests.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(sortedFilteredRequests.value.length / pageSize.value)
  );
});

const sortedFilteredRequests = computed(() => {
  let filtered = requests.value.filter((req) => {
    if (filterType.value && req.type !== filterType.value) return false;
    if (filterSite.value && req.site !== filterSite.value) return false;
    if (
      filterStatus.value &&
      filterStatus.value.length > 0 &&
      !filterStatus.value.includes(req.status.trim())
    )
      return false;
    if (
      filterBy.value &&
      !req.requestedBy.toLowerCase().includes(filterBy.value.toLowerCase())
    )
      return false;
    if (dateRange.value.start && req.date < dateRange.value.start) return false;
    if (dateRange.value.end && req.date > dateRange.value.end) return false;
    return true;
  });
  filtered = filtered.slice();
  if (!filterStatus.value || filterStatus.value.length === 0) {
    filtered.sort((a, b) => {
      if (a.status < b.status) return -1;
      if (a.status > b.status) return 1;
      return 0;
    });
  }
  sortBy.value.forEach((col) => {
    let key = col;
    if (col === "No of Materials") key = "noOfMaterials";
    filtered.sort((a, b) => {
      let valA = a[key],
        valB = b[key];
      // Natural sort for Workflow Id
      if (
        key === "id" &&
        typeof valA === "string" &&
        typeof valB === "string"
      ) {
        const numA = parseInt(valA.replace(/[^\d]/g, ""), 10);
        const numB = parseInt(valB.replace(/[^\d]/g, ""), 10);
        if (numA !== numB) {
          return sortOrder.value[key] === "asc" ? numA - numB : numB - numA;
        }
        // Fallback to string compare if numbers are equal
        if (valA < valB) return sortOrder.value[key] === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder.value[key] === "asc" ? 1 : -1;
        return 0;
      }
      if (key === "date") {
        valA = new Date(valA);
        valB = new Date(valB);
      }
      if (valA < valB) return sortOrder.value[key] === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder.value[key] === "asc" ? 1 : -1;
      return 0;
    });
  });
  return filtered;
});

function toggleExpand(id) {
  const idx = expandedIds.value.indexOf(id);
  if (idx === -1) {
    expandedIds.value.push(id);
  } else {
    expandedIds.value.splice(idx, 1);
  }
}

function cancelRestockRequest(req) {
  // Implement cancel logic here
}

function viewDetails(req) {
  // Implement view details logic here
  if(req.status == "Restock Request" || req.status == "Restocked" || req.status == "Restock Cancelled") {
    // if (req.type === "Bulk"){
      router.push({
        name: "SupplierWorkflow",
        query: {
          requestId: req.id,
          workflowId: req.workflowId || "",
          type: req.type,
          root_page: route.query.root_page,
          pageType: pageType.value,
          status: route.query.status
        },
      });
    // } else {
    //   restockRequestData.value = req;
    //   showAcceptRestockModal.value = true;
    // }
  }else{
    // if (req.type === "Bulk"){
      router.push({
        name: "SiteWorkflow",
        query: {
          requestId: req.id,
          workflowId: req.workflowId || "",
          type: req.type,
          root_page: route.query.root_page,
          pageType: pageType.value,
          status: route.query.status,
          siteId: route.query.siteId,
          site: route.query.site
        },
      });
    // } else {
    //   receiveStockAtSiteData.value = { ...req, requestType: "Dispatch Stock" }
    //   showAcceptRestockModal.value = true;
    // }
  }
}

function acceptRestockRequest(req) {
  // Assign random type for demonstration
  // const requestWithType = { ...req, type: randomType };
  if (req.type === "Bulk") {
    // Build breadcrumb info: link to site, label for current page
    const siteId = req.siteId || req.site_id || req.site_id || req.siteId || "";
    const siteName = req.site || req.siteName || "";
    router.push({
      name: "SupplierWorkflow",
      query: {
        requestId: req.id,
        workflowId: req.workflowId || "",
        type: req.type,
        root_page: route.query.root_page,
        pageType: pageType.value,
        status: route.query.status,
      },
    });
  } else {
    restockRequestData.value = req;
    showAcceptRestockModal.value = true;
  }
}

function handleAcceptedRestock(payload) {
  // Close modal
  showAcceptRestockModal.value = false;
  // TODO: integrate with backend to persist acceptance
}

// function dispatchRequest(req) {
//   if (!req) return; // Defensive check
//   dispatchData.value = {
//     site: req.site || "",
//     material: req.type === "Bulk" ? "" : req.item?.material || "",
//     category: req.type === "Bulk" ? "" : req.item?.category || "",
//     quantity: req.type === "Bulk" ? "" : req.item?.quantity || "",
//     description: req.type === "Bulk" ? "" : req.item?.description || "",
//     requestedBy: req.requestedBy || "",
//     requestId: req.id || ""
//   };
//   showDispatchModal.value = true;
// }

function dispatchRequest(req) {
  // Accept Return Request logic
  if (req.type === "Bulk") {
    router.push({
      name: "SiteWorkflow",
      query: {
        requestId: req.id,
        workflowId: req.workflowId || "",
        type: req.type,
        requestType: "Dispatch Stock",
        root_page: route.query.root_page,
        pageType: pageType.value,
        status: route.query.status,
        siteId: req.siteId || req.site_id || "",
      },
    });
  } else {
    // Set request_type for modal
    receiveStockAtSiteData.value = { ...req, requestType: "Dispatch Stock" };
    showReceiveStockAtSiteModal.value = true;
  }
}

function receiveStock(req) {
  const siteId = req.siteId || req.site_id || "";
  const siteName = req.site || req.siteName || "";

  if (req.type === "Bulk") {
    router.push({
      name: "SiteWorkflow",
      query: {
        requestId: req.id,
        workflowId: req.workflowId || "",
        type: req.type,
        root_page: route.query.root_page,
        pageType: pageType.value,
        status: route.query.status,
        siteId: siteId,
        requestType: "Receive Stock",
      },
    });
  } else {
    receiveStockAtSiteData.value = { ...req, requestType: "Receive Stock" };

    showReceiveStockAtSiteModal.value = true;
  }
}

function cancelRequest(req) {
  // Implement cancel logic here
}

function acceptReturn(req) {
  // Accept Return Request logic
  if (req.type === "Bulk") {
    router.push({
      name: "SiteWorkflow",
      query: {
        requestId: req.id,
        type: req.type,
        workflowId: req.workflowId || "",
        requestType: "Return Stock",
        root_page: route.query.root_page,
        pageType: pageType.value,
        status: route.query.status,
        siteId: req.siteId || req.site_id || "",
      },
    });
  } else {
    // Set request_type for modal
    receiveStockAtSiteData.value = { ...req, requestType: "Return Stock" };
    showReceiveStockAtSiteModal.value = true;
  }
}
</script>

<style scoped>
.table-header-gradient {
  /* background: linear-gradient(90deg, #99f6e4 0%, #99f6e4 30%, #f0fdfa 100%); */
  background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%);
}
.table-row-hover {
  transition: background 0.3s, box-shadow 0.3s;
}
.table-row-hover:hover {
  background: linear-gradient(90deg, #e6fffa 0%, #f0fdfa 100%);
  box-shadow: 0 2px 8px 0 rgba(45, 212, 191, 0.1);
}
/* Reduce font size of MultiSelect dropdown options */
::v-deep(.p-multiselect-panel .p-multiselect-item) {
  font-size: 0.5rem !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}
::v-deep(.p-multiselect-list .p-multiselect-option) {
  font-size: 0.5rem !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}
::v-global(.p-multiselect-list .p-multiselect-option) {
  font-size: 0.7rem !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}
::v-global(.p-multiselect-option-group) {
  font-size: 0.85rem !important;
}
::v-deep(.p-multiselect-panel .p-multiselect-item-group) {
  font-size: 0.5rem !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}
</style>
