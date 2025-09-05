<template>
  <div class="flex flex-col rounded px-4 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="bg-teal-200 rounded-full p-2">
          <i class="fas fa-chart-pie text-xl text-teal-700"></i>
        </div>
        <h2 class="text-lg font-bold text-teal-700">Home</h2>
      </div>
      <div class="flex gap-0 text-xs p-2">
        <!-- Dispatch Stock to Site (Individual & Bulk) -->
        <div
          v-if="userRole === Role.Management || userRole === Role.HOStaff"
          class="flex gap-2 rounded-lg px-3 py-2"
        >
          <button
            v-if="hasAccess(userRole as Role, 'dispatchStock')"
            class="bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 border border-teal-200 shadow transition"
            title="Dispatch Stock to Site"
            @click="showDispatchStock = true"
          >
            <i class="fas fa-shipping-fast"></i>
          </button>
          <button
            v-if="hasAccess(userRole as Role, 'dispatchStock')"
            class="bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 border border-teal-200 shadow transition"
            title="Dispatch Stock to Site (Bulk)"
            @click="openBulkStockPreset('Dispatch')"
          >
            <i class="fas fa-th"></i>
          </button>
        </div>

        <!-- Request Supplier for Stock -->

        <!-- Request Supplier for Stock (Individual & Bulk) -->
        <div
          v-if="userRole === Role.Management || userRole === Role.HOStaff"
          class="flex gap-2 rounded-lg px-3 py-2"
        >
          <button
            v-if="hasAccess(userRole as Role, 'requestInventory')"
            class="bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition border border-teal-200"
            title="Request Supplier for Restock"
            @click="showRequestSupplier = true"
          >
            <i class="fas fa-truck-loading"></i>
          </button>
          <router-link
            to="/inventory/add-bulk-stock?actionType=Request"
            v-if="hasAccess(userRole as Role, 'requestInventory')"
            class="bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition border border-teal-200 flex items-center justify-center"
            title="Request Supplier for Restock (Bulk)"
          >
            <i class="fas fa-cubes-stacked"></i>
          </router-link>
        </div>

        <div
          v-if="userRole === Role.Management || userRole === Role.HOStaff"
          class="flex gap-2 rounded-lg px-3 py-2"
        >
          <button
            v-if="hasAccess(userRole as Role, 'addSupplier')"
            class="bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition border border-teal-200"
            title="Add Supplier"
            @click="openSupplierModal"
          >
            <!-- <i class="fas fa-arrow-alt-circle-left"></i> -->
            <i class="fas fa-store"></i>
          </button>
        </div>

        <!-- Request Stock from HO -->
        <button
          v-if="hasAccess(userRole as Role, 'requestStock')"
          class="bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition border border-teal-200"
          title="Request Stock from HO"
          @click="showRequestHO = true"
        >
          <i class="fas fa-warehouse"></i>
        </button>

        <button
          v-if="hasAccess(userRole as Role, 'requestStock')"
          class="ml-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition border border-teal-200"
          title="Request Stock from HO (Bulk)"
          @click="openBulkStockPreset('Request')"
        >
          <i class="fas fa-th"></i>
        </button>

        <button
          v-if="hasAccess(userRole as Role, 'returnStock')"
          class="ml-6 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition border border-teal-200"
          title="Return Stock to HO"
          @click="openReturnStockModal('Return')"
        >
          <i class="fas fa-undo-alt"></i>
        </button>
        <button
          v-if="hasAccess(userRole as Role, 'returnStock')"
          class="ml-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition border border-teal-200"
          title="Return Stock to HO (Bulk)"
          @click="openBulkStockPreset('Return')"
        >
          <i class="fas fa-reply-all"></i>
        </button>

        <button
          v-if="hasAccess(userRole as Role, 'consumeStock')"
          class="ml-6 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition border border-teal-200"
          title="Mark Stock Consumed"
          @click="openReturnStockModal('Consume')"
        >
          <i class="fas fa-arrow-down"></i>
        </button>
        <button
          v-if="hasAccess(userRole as Role, 'consumeStock')"
          class="ml-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition border border-teal-200"
          title="Mark Stock Consumed (Bulk)"
          @click="openBulkStockPreset('Consume')"
        >
          <i class="fas fa-arrow-alt-circle-down"></i>
        </button>
      </div>
    </div>

    <!-- Dashboard Counts - Cards -->
    <div class="mt-3 flex flex-col items-center">
      <div
        class="grid grid-cols-1 gap-14 w-full"
        :class="userRole === Role.SiteStaff ? 'md:grid-cols-3' : 'md:grid-cols-4'"
      >
        <div
          v-for="card in dashboardCards"
          :key="card.label"
          class="cursor-pointer transition-colors hover:bg-teal-50 hover:shadow-lg bg-white shadow rounded-lg px-3 py-2 flex flex-col items-center border-t-4 border-teal-200"
          @click="handleCardClick(card.type)"
        >
          <div class="my-1">
            <i :class="card.icon + ' text-lg text-teal-500'" />
          </div>
          <div>
            <span v-if="loadingDashboardCardCounts[card.type].value">
              <i class="fas fa-spinner animate-spin text-xl text-teal-400"></i>
            </span>
            <span v-else class="text-xl font-bold text-teal-600">{{
              card.count.value
            }}</span>
          </div>
          <span class="mt-2 text-gray-500">{{ card.label }}</span>
        </div>
      </div>
    </div>

    <div class="w-full mt-7 flex flex-col md:flex-row gap-8 px-5">
      <!-- Active Sites Cards (Left Side) -->
      <div class="flex flex-col gap-4 md:w-1/2 min-h-[280px]">
        <div class="flex items-baseline justify-between">
          <h2 class="text-base font-semibold text-teal-700">Active Sites</h2>
          <a
            href="#"
            class="bg-gradient-to-r from-teal-400 to-teal-600 text-white hover:from-teal-500 hover:to-teal-700 text-[10px] font-semibold px-2 py-1 rounded shadow transition inline-block"
            @click.prevent="handleViewAllSites"
          >
            View All
          </a>
        </div>
        <div
          v-if="loadingActiveSites"
          class="flex flex-col items-center justify-center py-8"
        >
          <span class="animate-spin text-3xl text-teal-400 mb-2">
            <i class="fas fa-spinner"></i>
          </span>
          <span class="text-teal-600 text-base font-semibold"
            >Loading active sites...</span
          >
        </div>
        <template v-else>
          <div
            v-if="activeSites.length === 0"
            class="p-4 bg-teal-50 text-center text-gray-400 border-l-4 border-teal-100 flex-1 flex items-center justify-center min-h-[72px] max-h-[280px] h-[280px]"
          >
            No active sites
          </div>
          <template v-else>
            <div
              v-for="site in activeSites.slice(0, 3)"
              :key="site.site"
              class="cursor-pointer bg-gradient-to-r from-white via-teal-50 to-white shadow-lg border-l-8 border-teal-500 px-6 py-3 flex flex-col hover:scale-[1.02] transition-transform"
              @click="goToSite(site.id)"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-teal-800 text-md">{{
                  site.site
                }}</span>
                <span
                  class="text-[10px] text-gray-500 bg-teal-100 px-2 py-1 rounded"
                  >{{ site.location }}</span
                >
              </div>
              <div class="flex gap-6 mt-1 mb-2">
                <div class="flex items-center gap-2">
                  <i class="fas fa-clipboard-list text-teal-500"></i>
                  <span class="text-xs text-gray-700"
                    >Requests:
                    <span class="font-bold text-teal-700">{{
                      site.requests
                    }}</span></span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-shipping-fast text-teal-500"></i>
                  <span class="text-xs text-gray-700"
                    >Dispatches:
                    <span class="font-bold text-teal-700">{{
                      site.dispatches
                    }}</span></span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-undo-alt text-teal-500"></i>
                  <span class="text-xs text-gray-700"
                    >Returns:
                    <span class="font-bold text-teal-700">{{
                      site.returns
                    }}</span></span
                  >
                </div>
              </div>
            </div>
            <!-- Filler for even height if sites < activities -->
            <div
              v-if="activeSites.length < latestWorkflowsDisplay.length"
              class="p-3 text-sm bg-teal-50 text-center text-gray-400 border-l-8 border-teal-100 flex-1 flex items-center justify-center"
            >
              No more sites to show!
            </div>
          </template>
        </template>
      </div>

      <!-- Recent Activity List (Right Side) -->
      <div class="md:w-2/3 min-h-[280px] flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-teal-700">Recent Activity</h2>
          <div class="flex items-baseline gap-2">
            <a
              href="#"
              class="bg-gradient-to-r from-teal-400 to-teal-600 text-white hover:from-teal-500 hover:to-teal-700 text-[10px] font-semibold px-2 py-1 rounded shadow transition inline-block"
              @click.prevent="handleViewAll"
            >
              View All
            </a>
          </div>
        </div>
        <div
          v-if="loadingRecentActivity"
          class="flex flex-col items-center justify-center py-8"
        >
          <span class="animate-spin text-3xl text-teal-400 mb-2">
            <i class="fas fa-spinner"></i>
          </span>
          <span class="text-teal-600 text-base font-semibold"
            >Loading recent activity...</span
          >
        </div>
        <template v-else>
          <ul
            v-if="latestWorkflowsDisplay.length > 0"
            class="flex flex-col gap-4 flex-1 py-2"
          >
            <li
              v-for="(activity, idx) in latestWorkflowsDisplay"
              :key="idx"
              class="border-teal-500 cursor-pointer bg-gradient-to-r from-white via-teal-50 to-white shadow-lg border-l-8 px-6 py-3 flex flex-col justify-center hover:scale-[1.02] transition-transform"
              @click="handleActivityClick(activity)"
            >
              <div class="flex items-center justify-between mb-1">
                <!-- ...existing code... -->
                <div>
                  <span
                    class="inline-block px-2 py-1 rounded text-[11px] font-semibold bg-teal-500 text-white"
                    style="
                      min-width: 50px;
                      max-width: 160px;
                      width: 150px;
                      text-align: center;
                    "
                  >
                    {{ activity.current_status }}
                  </span>
                </div>
                <span
                  class="text-[10px] text-gray-500 bg-teal-100 px-2 py-1 rounded truncate"
                  >{{ activity.site || activity.site_name || "" }}</span
                >
              </div>

              <div class="flex gap-6 items-center my-2">
                <div class="flex items-center gap-2">
                  <!-- <i class="fas fa-user text-teal-500"></i> -->
                  <span
                    class="text-[10px] font-semibold text-gray-700 truncate"
                    >{{ activity.workflow_tracker_id }}</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-user text-teal-500"></i>
                  <span class="text-xs text-gray-700 truncate">{{
                    activity.created_by_user_name
                  }}</span>
                </div>

                <div
                  v-if="activity.no_of_materials"
                  class="flex items-center gap-2 ml-2"
                >
                  <i class="fas fa-boxes text-teal-500"></i>
                  <span class="text-xs text-gray-700 truncate"
                    >Materials:
                    <span class="font-bold text-teal-700">{{
                      activity.no_of_materials
                    }}</span></span
                  >
                </div>
                <div v-if="activity.items" class="flex items-center gap-2">
                  <i class="fas fa-cubes-stacked text-teal-500"></i>
                  <span class="text-xs text-gray-700 truncate"
                    >Items:
                    <span class="font-bold text-teal-700">{{
                      activity.items
                    }}</span></span
                  >
                </div>
                <div class="flex items-center gap-2 ml-auto">
                  <i class="fas fa-clock text-teal-500"></i>
                  <span class="text-[10px] text-gray-700 truncate">{{
                    formatReadableDate(activity.created_at)
                  }}</span>
                </div>
              </div>
            </li>
          </ul>
          <div
            v-else
            class="p-5 bg-teal-50 text-center text-gray-400 border-l-8 border-teal-100 flex-1 flex items-center justify-center min-h-[72px] max-h-[280px] h-[280px]"
          >
            No recent activities
          </div>
        </template>
      </div>
      <div v-if="showDispatchStock">
        <DispatchStock
          @close="showDispatchStock = false"
          root_page="Home"
          siteId=""
          :siteLocked="false"
        />
      </div>

      <div v-if="showRequestSupplier">
        <RequestSupplier @close="showRequestSupplier = false" />
      </div>
      <div v-if="showRequestHO">
        <RequestHO @close="showRequestHO = false" root_page="Home" siteId="" />
      </div>

      <AddSupplierModal v-if="showAddSupplier" @close="closeSupplierModal" />
    </div>
    <StockPresetRequest
      v-if="showStockPresetRequestModal"
      site-id=""
      :site-locked="false"
      :action-type="returnOrOrderOrDispatchStock.actionType"
      @close="closeStockPresetRequestModal"
      root_page="Sites"
    />
    <ReturnStock
      v-if="showReturnStockModal"
      site-id=""
      :site-locked="false"
      :show-modal="showReturnStockModal"
      :action-type="returnOrOrderOrDispatchStock.actionType"
      @close="closeReturnStockModal"
    />
  </div>
</template>

<script setup lang="ts">
import { formatReadableDate } from "@/utils/date";
import { nextTick } from "vue";

// Computed display array for latestWorkflows
import { computed, ref, watchEffect } from "vue";

import { useRouter } from "vue-router";
import DispatchStock from "@/components/DispatchStock.vue";
import RequestSupplier from "@/components/RequestSupplier.vue";
import RequestHO from "@/components/RequestHO.vue";
import { useDashboardData } from "@/services/dashboardService";
import { onMounted } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useSiteStore } from "@/stores/siteStore";
import { useUserStore } from "@/stores/userStore";

import { useAuthStore } from "@/stores/authStore";
import { hasAccess } from "@/utils/permissions";
import { Role } from "@/utils/permissions";
import StockPresetRequest from "@/components/StockPresetRequest.vue";
import ReturnStock from "@/components/ReturnStock.vue";
import AddSupplierModal from "@/components/AddSupplierModal.vue";
const authStore = useAuthStore();

const userRole = computed(() => authStore.user?.role);
const returnOrOrderOrDispatchStock = { actionType: "" };

const router = useRouter();
const showDispatchStock = ref(false);
const showRequestSupplier = ref(false);
const showRequestHO = ref(false);
const showAddSupplier = ref(false);

const inventoryStore = useInventoryStore();
const siteStore = useSiteStore();
const userStore = useUserStore();
const showStockPresetRequestModal = ref(false);
const showReturnStockModal = ref(false);

const latestWorkflowsDisplay = ref<any[]>([]);
const loadingActiveSites = ref(true);
const loadingRecentActivity = ref(true);
const loadingDashboardCounts = ref(true);

const loadingDashboardCardCounts: Record<string, any> = {
  supplier: ref(true),
  requests: ref(true),
  deliveries: ref(true),
  returns: ref(true),
};

// Add missing function for bulk stock preset

function openBulkStockPreset(actionType: string) {
  showStockPresetRequestModal.value = true;
  returnOrOrderOrDispatchStock.actionType = actionType;
}

function closeStockPresetRequestModal() {
  showStockPresetRequestModal.value = false;
}

function openSupplierModal() {
  showAddSupplier.value = true;
}

function closeSupplierModal() {
  showAddSupplier.value = false;
}

function openReturnStockModal(actionType: string) {
  showReturnStockModal.value = true;
  returnOrOrderOrDispatchStock.actionType = actionType;
}
function closeReturnStockModal() {
  showReturnStockModal.value = false;
}

onMounted(async () => {
  await siteStore.fetchAccessibleSites();

  loadingActiveSites.value = true;
  // await siteStore.fetchAccessibleSites();
  // await siteStore.fetchActiveSites();
  loadingActiveSites.value = false;

  // Dashboard card counts
  loadingDashboardCardCounts.supplier.value = true;
  loadingDashboardCardCounts.requests.value = true;
  loadingDashboardCardCounts.deliveries.value = true;
  loadingDashboardCardCounts.returns.value = true;
  await nextTick();
  loadingDashboardCardCounts.supplier.value = false;
  loadingDashboardCardCounts.requests.value = false;
  loadingDashboardCardCounts.deliveries.value = false;
  loadingDashboardCardCounts.returns.value = false;

  loadingRecentActivity.value = true;

  await inventoryStore.fetchActiveSitesWorkflows();

  if (userRole.value !== Role.SiteStaff) {
    await inventoryStore.fetchSupplierWorkflows();
  }
  loadingRecentActivity.value = false;
});

// Use dashboard service for business logic
const {
  supplierRequests,
  siteRequests,
  siteDeliveries,
  siteReturns,
  activeSites,
} = useDashboardData();

const dashboardCards = computed(() => {
  const cards = [
    {
      label: "Requests for Supplier",
      icon: "fas fa-dolly",
      count: supplierRequests,
      type: "supplier",
    },
    {
      label: "Requests from Sites",
      icon: "fas fa-clipboard-list",
      count: siteRequests,
      type: "requests",
    },
    {
      label: "Dispatches towards Sites",
      icon: "fas fa-shipping-fast",
      count: siteDeliveries,
      type: "deliveries",
    },
    {
      label: "Returns from Sites",
      icon: "fas fa-undo-alt",
      count: siteReturns,
      type: "returns",
    },
  ];
  if (userRole.value === Role.SiteStaff) {
    return cards.filter((card) => card.type !== "supplier");
  }
  return cards;
});
const latestWorkflows = computed(async () => {
  const allWorkflows = [
    ...inventoryStore.activeSitesWorkflows,
    ...inventoryStore.supplierWorkflows,
  ];

  let topWorkflows = allWorkflows
    .sort((a, b) =>
      new Date(
        a.updated_at?.toDate ? a.updated_at.toDate() : a.updated_at
      ).getTime() <
      new Date(
        b.updated_at?.toDate ? b.updated_at.toDate() : b.updated_at
      ).getTime()
        ? 1
        : -1
    )
    .slice(0, 3);

  // Resolve user details for each workflow
  const workflowsWithUser = await Promise.all(
    topWorkflows.map(async (wf) => {
      let subworkflow = wf.workflows.find(
        (wfs: { status: any }) => wfs.status === wf.current_status
      );
      const userDetail =
        (await userStore.getUserById(subworkflow.created_by)) || "";

      let siteName = "";
      if (wf.site_id) {
        await siteStore.fetchSiteById(wf.site_id);
        siteName = siteStore.site.site;
      }

      let supplierName = "";
      if (wf.supplier_id) {
        await inventoryStore.fetchSupplierById(wf.supplier_id);
        supplierName = inventoryStore.supplier
          ? (inventoryStore.supplier as any).suppliers_name
          : "";
        siteName = "HO";
      }

      return {
        ...wf,
        created_by_user_name: userDetail
          ? (userDetail as any).user
          : wf.created_by,
        no_of_materials: subworkflow.no_of_materials,
        site_name: siteName || "",
        supplier_name: supplierName || "",
      };
    })
  );
  return workflowsWithUser;
});

watchEffect(async () => {
  const workflowsPromise = latestWorkflows.value;
  if (workflowsPromise && typeof workflowsPromise.then === "function") {
    latestWorkflowsDisplay.value = await workflowsPromise;
  } else {
    latestWorkflowsDisplay.value = [];
  }
});

function goToSite(siteId: any) {
  if (siteId) {
    router.push(`/sites/${siteId}`);
  }
}

function handleActivityClick(activity: {
  workflow_tracker_id: string;
  id: string;
  site_id: string;
  supplier_id: string;
}) {
  router.push({
    name: activity.site_id ? "SiteWorkflow" : "SupplierWorkflow",
    query: {
      workflowId: activity.id || "",
      root_page: "Home",
    },
  });
}

function handleViewAll() {
  router.push({
    name: "SiteStatus",
    query: {
      page_type: "Recent Activity",
      root_page: "Home",
      status: "",
    },
  });
}

function handleViewAllSites() {
  // Replace with your desired action, e.g. navigate to a full sites page
  router.push({ name: "Sites" });
}

function handleCardClick(type: string) {
  if (type === "requests") {
    router.push({
      name: "SiteStatus",
      query: {
        status: "Requested",
        root_page: "Home",
        page_type: "Site Material Transactions",
      },
    });
  } else if (type === "deliveries") {
    router.push({
      name: "SiteStatus",
      query: {
        status: "Dispatched",
        root_page: "Home",
        page_type: "Site Material Transactions",
      },
    });
  } else if (type === "returns") {
    router.push({
      name: "SiteStatus",
      query: {
        status: "Returned",
        root_page: "Home",
        page_type: "Site Material Transactions",
      },
    });
  } else if (type === "supplier") {
    router.push({
      name: "SiteStatus",
      query: {
        status: "Restock Request",
        root_page: "Home",
        page_type: "Supplier Material Transactions",
      },
    });
  } else {
    alert(`Card clicked: ${type}`);
  }
}
</script>
