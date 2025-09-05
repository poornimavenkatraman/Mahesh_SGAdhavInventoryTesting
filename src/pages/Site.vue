<template>
  <div class="pl-2 py-2 max-w-[66rem]">
    <nav
      class="flex items-center mb-0 pl-2 py-2"
      aria-label="Breadcrumb"
      style="background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%)"
    >
      <ol class="flex items-center space-x-1">
        <li>
          <router-link
            to="/sites"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px] hover:bg-red-200 transition"
          >
            <i class="fas fa-city mr-1"></i> Sites
          </router-link>
        </li>
        <li>
          <span class="mx-1 text-red-400">
            <i class="fas fa-chevron-right"></i>
          </span>
        </li>
        <li>
          <span
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px]"
            aria-current="page"
          >
            <i class="fas fa-building mr-1"></i>{{ siteStore.site?.site || "" }}
          </span>
        </li>
      </ol>
    </nav>
    <!-- Site Info -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-12"
    >
      <span class="animate-spin text-3xl text-red-400 mb-2">
        <i class="fas fa-spinner"></i>
      </span>
      <span class="text-red-600 text-base font-semibold"
        >Loading site info...</span
      >
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-2 px-2">
        <div class="flex items-center gap-3">
          <div class="bg-red-200 rounded-full p-2">
            <i class="fas fa-building text-xl text-red-700"></i>
          </div>
          <h2 class="text-lg font-bold text-red-700">
            {{ siteStore.site?.site || "" }}
          </h2>
          <!-- Status pill -->
          <span
            class="ml-3 px-3 py-1 rounded-full text-xs font-semibold"
            :class="
              siteStore.site?.status === 'Active'
                ? 'bg-red-100 text-red-700'
                : siteStore.site?.status === 'Closed'
                ? 'bg-gray-200 text-gray-600'
                : 'bg-orange-100 text-orange-700'
            "
          >
            {{ siteStore.site?.status || "" }}
          </span>
        </div>
        <div class="flex gap-3 px-3 py-2 items-center">
          <button v-if="hasAccess(userRole as Role, 'requestStock')"
            class="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
            title="Request Stock from HO"
            @click="openRequestHO"
          >
            <i class="fas fa-warehouse"></i>
          </button>
          <button v-if="hasAccess(userRole as Role, 'requestStock')"
            class="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
            title="Request Stock from HO (Bulk)"
            @click="openBulkStockPreset('Request')"
          >
            <i class="fas fa-th"></i>
          </button>
          <button
            v-if="hasAccess(userRole as Role, 'dispatchStock')"
            class="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 border border-red-200 shadow transition"
            title="Dispatch Stock to Site"
            @click="showDispatchStock = true"
          >
            <i class="fas fa-shipping-fast"></i>
          </button>
          <button v-if="hasAccess(userRole as Role, 'dispatchStock')"
            class="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
            title="Dispatch Stock to Site (Bulk)"
            @click="openBulkStockPreset('Dispatch')"
          >
            <i class="fas fa-th"></i>
          </button>
          <button v-if="hasAccess(userRole as Role, 'returnStock')"
            class="ml-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
            title="Return Stock to HO"
            @click="openReturnStockModal('Return')"
          >
            <!-- <i class="fas fa-arrow-alt-circle-left"></i> -->
            <i class="fas fa-undo-alt"></i>
          </button>
          <button v-if="hasAccess(userRole as Role, 'returnStock')"
            class="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
            title="Return Stock to HO (Bulk)"
            @click="openBulkStockPreset('Return')"
          >
            <!-- <i class="fas fa-arrow-alt-circle-left"></i> -->
            <i class="fas fa-reply-all"></i>
          </button>


          <button v-if="hasAccess(userRole as Role, 'consumeStock')"
            class="ml-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
            title="Mark Stock Consumed"
            @click="openReturnStockModal('Consume')"
          >
            <!-- <i class="fas fa-arrow-alt-circle-left"></i> -->
            <i class="fas fa-arrow-down"></i>
          </button>
          <button v-if="hasAccess(userRole as Role, 'consumeStock')"
            class="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
            title="Mark Stock Consumed (Bulk)"
            @click="openBulkStockPreset('Consume')"
          >
            <!-- <i class="fas fa-arrow-alt-circle-left"></i> -->
            <i class="fas fa-arrow-alt-circle-down"></i>
          </button>
          <!-- Vertical 3 dots menu -->
          <div class="relative ml-2" v-if="hasAccess(userRole as Role, 'editSite')">
            <button
              id="site-menu-button"
              @click="openSiteMenu"
              class="p-3 rounded-full hover:bg-red-100 focus:outline-none"
            >
              <i class="fas fa-ellipsis-v text-red-700"></i>
            </button>
            <div
              v-if="showSiteMenu"
              id="site-menu-dropdown"
              class="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow-lg z-10"
            >
              <ul>
                <li
                  @click="editSite"
                  class="px-4 py-2 hover:bg-red-50 cursor-pointer text-red-700"
                >
                  Edit Site
                </li>
                <li
                  @click="closeSite"
                  class="px-4 py-2 hover:bg-red-50 cursor-pointer text-red-600"
                >
                  Close Site
                </li>
                <!-- <li
                  @click="archiveSite"
                  class="px-4 py-2 hover:bg-red-50 cursor-pointer text-red-600"
                >
                  Archive Site
                </li> -->
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-6 items-center text-gray-600 text-sm ml-12">
        <span class="flex items-center mr-4 text-xs">
          <i class="fas fa-map-marker-alt mr-1 text-red-500"></i
          >{{ siteStore.site?.location || "" }}
        </span>
        <span class="flex items-center text-xs">
          <i class="fas fa-city mr-1 text-orange-500 text-sm"></i
          >{{ siteStore.site?.city || "" }}
        </span>
        <span class="flex items-baseline ml-4 text-xs">
          <i class="fas fa-calendar-alt mr-1 text-red-500"></i>
          <span
            >Start Date:
            <b>{{ formatDate(siteStore.site?.start_date) }}</b></span
          >
        </span>
        <span
          v-if="
            siteStore.site?.status === 'Closed' ||
            siteStore.site?.status === 'Archived'
          "
          class="flex items-center ml-4 text-xs"
        >
          <i class="fas fa-calendar-check mr-1 text-gray-500"></i>
          <span
            >Closed Date:
            <b>{{ formatDate(siteStore.site?.closed_date) }}</b></span
          >
        </span>
      </div>

      <!-- Dashboard Counts -->

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-2 ml-5 p-4">
        <button
          class="bg-white border-t-4 border-red-200 hover:bg-red-50 rounded-lg p-4 flex flex-col items-center shadow focus:outline-none"
          @click="handleSiteRequestsClick"
        >
          <i class="fas fa-clipboard-list text-red-500 text-2xl mb-1"></i>
          <div class="text-xl font-bold text-red-700">
            {{ site_stats.requests }}
          </div>
          <div class="text-xs text-gray-500">Requests</div>
        </button>
        <button
          class="bg-white border-t-4 border-red-200 hover:bg-red-50 rounded-lg p-4 flex flex-col items-center shadow focus:outline-none"
          @click="handleSiteDispatchesClick"
        >
          <i class="fas fa-shipping-fast text-red-500 text-2xl mb-1"></i>
          <div class="text-xl font-bold text-red-700">
            {{ site_stats.dispatches }}
          </div>
          <div class="text-xs text-gray-500">Dispatches</div>
        </button>
        <button
          class="bg-white border-t-4 border-red-200 hover:bg-red-50 rounded-lg p-4 flex flex-col items-center shadow focus:outline-none"
          @click="handleSiteReturnsClick"
        >
          <i class="fas fa-undo text-red-500 text-2xl mb-1"></i>
          <div class="text-xl font-bold text-red-700">
            {{ site_stats.returns }}
          </div>
          <div class="text-xs text-gray-500">Returns</div>
        </button>
      </div>
    </div>
    <SiteMaterialCounts :siteId="siteId" />
    <RequestHO
      v-if="showRequestHO"
      :site-id="siteId"
      :site-locked="true"
      @close="closeRequestHO"
      root_page="Sites"
    />
    <ReturnStock
      v-if="showReturnStockModal"
      :site-id="siteId"
      :site-locked="true"
      :show-modal="showReturnStockModal"
      :action-type="returnOrOrderOrDispatchStock.actionType"
      @close="closeReturnStockModal"
    />
  
    <StockPresetRequest
      v-if="showStockPresetRequestModal"
      :site-id="siteId"
      :action-type="returnOrOrderOrDispatchStock.actionType"
      @close="closeStockPresetRequestModal"
      root_page="Sites"
    />

    <AddOrEditSite
      v-if="showAddSite"
      :edit-mode="true"
      :site-data="editSiteData"
      @close="closeAddSiteForm"
    />

    <div v-if="showDispatchStock">
      <DispatchStock @close="showDispatchStock = false" root_page="Sites" :siteId="siteId" :site-locked="true"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import SiteMaterialCounts from "@/components/SiteMaterialCounts.vue";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSiteStore } from "@/stores/siteStore";

import { formatDate } from "@/utils/date";

import RequestHO from "@/components/RequestHO.vue";
import ReturnStock from "@/components/ReturnStock.vue";
import StockPresetRequest from "@/components/StockPresetRequest.vue";
import AddOrEditSite from "@/components/AddOrEditSite.vue";
import { useAuthStore } from "@/stores/authStore";
import { hasAccess, Role } from "@/utils/permissions";
import DispatchStock from "@/components/DispatchStock.vue";
// import { hasAccess } from "@/utils/permissions";
// import type { Role }  from "@/utils/permissions";


const showDispatchStock = ref(false);
const showAddSite = ref(false);
const editSiteData = ref(undefined);
const route = useRoute();
const router = useRouter();
const siteId = ref(Array.isArray(route.params.siteId) ? route.params.siteId[0] : route.params.siteId);
const siteStore = useSiteStore();
const site_stats = ref({ requests: 0, dispatches: 0, returns: 0 });
const isLoading = ref(true);
const site = computed(() => siteStore.site);
const authStore = useAuthStore();
const userRole = computed(() => authStore.user?.role);


onMounted(async () => {
  await siteStore.fetchSiteById(String(siteId.value));
  site_stats.value = await siteStore.fetchSiteStats(String(siteId.value));
  isLoading.value = false;
});

const recentActivities = ref([]);
const showSiteMenu = ref(false);
let siteMenuClickHandler: ((event: MouseEvent) => void) | null = null;

function openSiteMenu() {
  showSiteMenu.value = true;
  siteMenuClickHandler = (event) => {
    const menu = document.getElementById("site-menu-dropdown");
    const button = document.getElementById("site-menu-button");
    if (
      menu &&
      !menu.contains(event.target as Node) &&
      button &&
      !button.contains(event.target as Node)
    ) {
      showSiteMenu.value = false;
      if (siteMenuClickHandler) {
        document.removeEventListener("mousedown", siteMenuClickHandler);
      }
    }
  };
  document.addEventListener("mousedown", siteMenuClickHandler);
}

function closeAddSiteForm() {
  showAddSite.value = false;
  editSiteData.value = undefined;
  // Refetch site info after update
  if (siteId.value) {
    isLoading.value = true;
    siteStore.fetchSiteById(siteId.value).then(() => {
      isLoading.value = false;
    });
  }
}

function closeSiteMenu() {
  showSiteMenu.value = false;
  if (siteMenuClickHandler !== null) {
    document.removeEventListener("mousedown", siteMenuClickHandler);
    siteMenuClickHandler = null;
  }
}

function editSite() {
  closeSiteMenu();
  editSiteData.value = { ...siteStore.site };
  showAddSite.value = true;
}

function closeSite() {
  closeSiteMenu();
  alert("Close Site clicked");
}

function archiveSite() {
  closeSiteMenu();
  alert("Archive Site clicked");
}

const showRequestHO = ref(false);
const showReturnStockModal = ref(false);
const showStockPresetRequestModal = ref(false);
const returnOrOrderOrDispatchStock = { actionType: "" };

function openRequestHO() {
  showRequestHO.value = true;
}
function closeRequestHO() {
  showRequestHO.value = false;
}

function openReturnStockModal(actionType: string) {
  showReturnStockModal.value = true;
  returnOrOrderOrDispatchStock.actionType = actionType;
}
function closeReturnStockModal() {
  showReturnStockModal.value = false;
}

function openBulkStockPreset(actionType: string) {
  showStockPresetRequestModal.value = true;
  returnOrOrderOrDispatchStock.actionType = actionType;
}
function closeStockPresetRequestModal() {
  showStockPresetRequestModal.value = false;
}

function handleSiteRequestsClick() {
  // Defensive check for siteStore.site
  const siteData = siteStore.site;
  if (!siteData || !siteData.site || !siteData.id) {
    // Optionally show an error or do nothing
    console.error("Site data not loaded");
    return;
  }
  router.push({
    name: "SiteStatus",
    query: {
      page_type: "Material Transactions",
      root_page: "Sites",
      status: "Requested",
      site: siteStore.site.site,
      siteId: siteStore.site.id,
    },
  });
}

function handleSiteDispatchesClick() {
  router.push({
    name: "SiteStatus",
    query: {
      page_type: "Material Transactions",
      root_page: "Sites",
      status: "Dispatched",
      site: siteStore.site.site,
      siteId: siteStore.site.id,
    },
  });
}

function handleSiteReturnsClick() {
  router.push({
    name: "SiteStatus",
    query: {
      page_type: "Material Transactions",
      root_page: "Sites",
      status: "Returned",
      site: siteStore.site.site,
      siteId: siteStore.site.id,
    },
  });
}
</script>

<style scoped>
/* Optional: for better icon alignment */
.fa-building,
.fa-map-marker-alt,
.fa-city {
  vertical-align: middle;
}

::v-global(.p-datatable-column-sorted) {
  //background-color: #ccfbf1 !important;
  background-color: #dc2626 !important; /* Tailwind red-600 */
  color: white !important;
}

::v-global(.p-badge) {
  //background-color: #14b8a6 !important; /* teal-500 */
  background-color: #dc2626 !important; /* Tailwind red-600 */
  color: white !important;
}
</style>
