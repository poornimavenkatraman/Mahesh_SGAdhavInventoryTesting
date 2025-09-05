<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";

import { useSiteStore } from "@/stores/siteStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useSiteDashboardData } from "@/services/siteDashboardService";

import AddOrEditSite from "@/components/AddOrEditSite.vue";
import { useUserStore } from "@/stores/userStore";
import { formatReadableDate } from "@/utils/date";
import { useAuth } from "@/composables/useAuth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { hasAccess, Role } from "@/utils/permissions";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();

const search = ref("");
const sortBy = ref("name");
const filterStatus = ref("Active");
const filterType = ref("all");
const locationFilter = ref("");
const statuses = ["Active", "Closed", "Archived"];

const viewAll = ref(false);
const showAddSite = ref(false);
const isLoading = ref(true);

const userStore = useUserStore();
const latestWorkflowsDisplay = ref<any[]>([]);

const siteStore = useSiteStore();
const inventoryStore = useInventoryStore();
const { user } = useAuth();
const accessibleSiteIds = ref<string[]>([]);

onMounted(async () => {
  await siteStore.fetchSites();
  await siteStore.fetchActiveSites();
  await siteStore.fetchAccessibleSites();
  await inventoryStore.fetchActiveSitesWorkflows();
  await inventoryStore.fetchWorkflows();

  isLoading.value = false;
});

const { sitesWithCounts, filteredSitesAll, filteredSites } =
  useSiteDashboardData(
    search,
    filterStatus,
    sortBy,
    filterType,
    locationFilter,
    viewAll
  );

const latestWorkflows = computed(async () => {
  const allWorkflows = [...inventoryStore.activeSitesWorkflows];
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
    .slice(0, 5);

  // Resolve user details for each workflow
  const workflowsWithUser = await Promise.all(
    topWorkflows.map(async (wf) => {
      let subworkflow = wf.workflows.find(
        (wfs: { status: any }) => wfs.status === wf.current_status
      );
      const userDetail =
        (await userStore.getUserById(subworkflow.created_by)) || "";
      await siteStore.fetchSiteById(wf.site_id);
      const siteDetail = siteStore.site.site;
      return {
        ...wf,
        created_by_user_name: userDetail
          ? (userDetail as any).user
          : wf.created_by,
        no_of_materials: subworkflow.no_of_materials,
        site_name: siteDetail || "",
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

function goToSite(site: { id: any }) {
  router.push({ name: "Site", params: { siteId: site.id } });
}
function addNewSite() {
  showAddSite.value = true;
}
function closeAddSite() {
  showAddSite.value = false;
}
function toggleViewAll() {
  viewAll.value = !viewAll.value;
}
function handleViewAllActivity() {
  // Route to SiteStatus page with required query params
  router.push({
    name: "SiteStatus",
    query: {
      root_page: "Sites",
      status: "",
      page_type: "Site Material Transactions",
    },
  });
}
function handleActivityClick(activity: {
  workflow_tracker_id: string;
  id: string;
}) {
  router.push({
    name: "SiteWorkflow",
    query: {
      workflowId: activity.id || "",
      // type: "Site Material Transactions",
      root_page: "Sites",
      // pageType: "Site Material Transactions",
      // status: route.query.status,
      // siteId: route.query.siteId,
      // site: route.query.site
    },
  });
}
</script>
<template>
  <div class="p-4">
    <!-- Header -->
    <div class="flex items-center gap-3 justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="bg-red-200 rounded-full p-2">
          <i class="fas fa-building text-xl text-red-700"></i>
        </div>
        <h2 class="text-lg font-bold text-red-700">Sites</h2>
      </div>
      <div class="flex gap-4 text-xs">
        <!-- Add Site -->
        <button
          v-if="hasAccess(user?.role as Role, 'addSite')"
          class="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
          title="Add Site"
          @click="addNewSite"
        >
          <i class="fas fa-building"></i>
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-4 mt-4 items-center">
      <div class="relative">
        <input
          v-model="search"
          type="text"
          placeholder="Search sites..."
          class="border border-red-200 rounded px-3 py-2 pl-9 focus:ring-2 focus:ring-red-400 w-64 md:w-80"
        />
        <span
          class="absolute left-2 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none"
        >
          <i class="fas fa-search"></i>
        </span>
      </div>
      <!-- Location Dropdown -->
      <select
        v-model="locationFilter"
        class="border border-red-200 rounded px-3 py-2 focus:ring-2 focus:ring-red-400 text-xs w-auto min-w-[120px]"
      >
        <option value="">All Locations</option>
        <option v-for="loc in siteStore.allLocations" :key="loc" :value="loc">
          {{ loc }}
        </option>
      </select>
    </div>
    <!-- Controls Row: View All, Search, Sort -->
    <!-- <div class="flex flex-wrap gap-2 mb-4 mt-4 items-center">
      <input v-model="search" type="text" placeholder="Search sites..."
        class="border border-red-200 rounded px-3 py-2 focus:ring-2 focus:ring-red-400" />


      <select v-model="sortBy" class="border border-red-200 rounded px-2 py-2 focus:ring-2 focus:ring-red-400">
    <option value="name">Sort by Name</option>
    <option value="requests">Sort by Requests</option>
    <option value="dispatches">Sort by In Transit</option>
  </select>
    </div> -->

    <!-- Filter Pills -->
    <div class="flex items-center mb-2 gap-4 flex-wrap">
      <!-- All pill (shows both active and closed and archived) -->
      <span
        @click="filterStatus = 'All'"
        :class="[
          'px-4 py-1 rounded-full cursor-pointer font-semibold transition',
          filterStatus === 'All'
            ? 'bg-red-600 text-white'
            : 'bg-red-100 text-red-700 hover:bg-red-200',
        ]"
      >
        All
      </span>
      <!-- Status Pills (Active/Closed/Archived) -->
      <div class="flex gap-2">
        <span
          v-for="status in statuses"
          :key="status"
          @click="filterStatus = status"
          :class="[
            'px-4 py-1 rounded-full cursor-pointer font-semibold transition',
            filterStatus === status
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200',
          ]"
        >
          {{ status }}
        </span>
      </div>
      <!-- Divider for clarity -->
      <span class="mx-2 text-gray-300 select-none hidden md:inline">|</span>
      <!-- Project Filter Pills (All/Requests/In Transit/Returned) -->
      <div class="flex gap-2">
        <span
          @click="filterType = 'all'"
          :class="[
            'px-3 py-1 rounded-full cursor-pointer font-semibold transition',
            filterType === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200',
          ]"
        >
          All
        </span>
        <span
          @click="filterType = 'requests'"
          :class="[
            'px-3 py-1 rounded-full cursor-pointer font-semibold transition',
            filterType === 'requests'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200',
          ]"
        >
          Requests
        </span>
        <span
          @click="filterType = 'dispatches'"
          :class="[
            'px-3 py-1 rounded-full cursor-pointer font-semibold transition',
            filterType === 'dispatches'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200',
          ]"
        >
          Dispatches
        </span>
        <span
          @click="filterType = 'returns'"
          :class="[
            'px-3 py-1 rounded-full cursor-pointer font-semibold transition',
            filterType === 'returns'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200',
          ]"
        >
          Returns
        </span>
      </div>

      <div class="flex-1"></div>
      <button
        v-if="filteredSitesAll.length > 4"
        class="flex items-center bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded shadow font-semibold hover:from-red-500 hover:to-red-700 ml-auto"
        @click="toggleViewAll"
      >
        {{ viewAll ? "Collapse" : "... View All Sites" }}
      </button>
    </div>
    <!-- Site Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <template v-if="isLoading">
        <div
          class="flex flex-col items-center justify-center w-full col-span-full py-12 bg-red-50 rounded-xl border border-dashed border-red-200"
        >
          <i class="fas fa-spinner fa-spin text-4xl text-red-300 mb-2"></i>
          <div
            class="text-red-700 font-semibold text-lg mb-1 w-full text-center"
          >
            Loading sites...
          </div>
        </div>
      </template>
      <template v-else-if="filteredSites.length">
        <div
          v-for="site in filteredSites"
          :key="site.site_id"
          class="bg-white rounded-xl shadow-md py-4 px-4 flex flex-col hover:scale-105 transition-transform cursor-pointer min-w-[215px] relative"
          @click="goToSite(site)"
        >
          <!-- ...existing site card content... -->
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-red-800 text-[13px] flex items-center">
              {{ site.site }}
            </span>
          </div>
          <div class="flex flex-col gap-1 mt-3">
            <div class="flex gap-3">
              <div class="flex items-center gap-3">
                <i class="fas fa-clipboard-list text-red-500"></i>
                <span class="text-[11px] text-gray-700"
                  >Requests:
                  <span class="font-bold text-red-700">{{
                    site.requests
                  }}</span></span
                >
              </div>
              <div class="flex items-center gap-3">
                <i class="fas fa-shipping-fast text-red-500"></i>
                <span class="text-[11px] text-gray-700"
                  >Dispatches:
                  <span class="font-bold text-red-700">{{
                    site.dispatches
                  }}</span></span
                >
              </div>
            </div>
            <div class="flex items-center gap-3 mt-1">
              <i class="fas fa-undo text-red-500"></i>
              <span class="text-[11px] text-gray-700"
                >Returns:
                <span class="font-bold text-red-700">{{
                  site.returns || 0
                }}</span></span
              >
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span
              class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
              :class="
                site.status === 'Active'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-200 text-gray-600'
              "
            >
              {{ site.status }}
            </span>
            <span
              class="text-[10px] text-gray-500 bg-red-100 px-2 py-1 rounded"
            >
              {{ site.location }}
            </span>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          class="flex flex-col items-center justify-center w-full col-span-full py-12 bg-red-50 rounded-xl border border-dashed border-red-200"
        >
          <i class="fas fa-building text-4xl text-red-300 mb-2"></i>
          <div
            class="text-red-700 font-semibold text-lg mb-1 w-full text-center"
          >
            No sites
          </div>
          <!-- <button
            v-if="filteredSites.length === 0"
            class="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded shadow font-semibold hover:from-red-500 hover:to-red-700"
            @click="addNewSite"
          >
            Add New Site
          </button> -->
        </div>
      </template>
    </div>

    <!-- Recent Activity Section (same as AdminWelcome) -->
    <div class="min-h-[480px] flex flex-col">
      <div
        class="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-red-100 to-red-50 rounded-t-lg shadow"
      >
        <h2 class="text-base font-semibold text-red-700">Recent Activity</h2>
        <div class="flex items-center gap-2">
          <button
            class="text-[10px] bg-gradient-to-r from-red-400 to-red-600 text-white px-2 py-1 rounded shadow font-semibold hover:from-red-500 hover:to-red-700"
            @click="handleViewAllActivity"
          >
            View All
          </button>
          <!-- <button class="bg-white hover:bg-red-100 text-red-700 p-2 rounded-full shadow transition flex items-center"
            title="Filter" @click="handleFilterActivity">
            <i class="fas fa-filter text-lg"></i>
          </button> -->
        </div>
      </div>
      <ul
        class="bg-white rounded-b-lg shadow-lg divide-y divide-red-100 flex-1"
      >
        <li
          v-for="(activity, idx) in latestWorkflowsDisplay"
          :key="idx"
          class="p-3 flex flex-col cursor-pointer transition-transform hover:scale-[1.01] hover:bg-red-50 hover:text-red-700"
          @click="handleActivityClick(activity)"
          :class="{
            'border-l-4 border-red-500': idx === 0,
            'border-l-4 border-red-300': idx !== 0,
          }"
        >
          <div class="px-4">
            <div class="flex items-center justify-between mb-1">
              <!-- <span class="font-bold text-red-800 text-md capitalize truncate">{{ activity.current_status }} -->
              <!-- <span
                class="inline-block px-2 py-1 rounded text-[10px] font-semibold bg-red-500 text-white"
              >
                {{ activity.workflow_tracker_id }}
              </span> -->

              <span
                class="font-bold text-red-800 text-md capitalize truncate text-[11px]"
              >
                {{ activity.workflow_tracker_id }}
              </span>
              <span
                class="text-[10px] text-gray-500 bg-red-100 px-2 py-1 rounded truncate"
                >{{ activity.site || activity.site_name || "" }}</span
              >
            </div>

            <div class="flex gap-6 items-center my-2">
              <div class="flex items-center gap-2">
                <span
                  class="inline-block px-2 py-1 rounded text-[11px] font-semibold bg-red-500 text-white"
                  style="
                    min-width: 80px;
                    max-width: 150px;
                    width: 120px;
                    text-align: center;
                  "
                >
                  {{ activity.current_status }}
                </span>
              </div>
              <div class="flex-1"></div>
              <div class="flex items-center gap-2">
                <i class="fas fa-user text-red-500"></i>
                <span
                  class="text-xs text-gray-700 truncate"
                  style="
                    min-width: 45px;
                    max-width: 120px;
                    width: 45px;
                    text-align: left;
                  "
                  >{{ activity.created_by_user_name }}</span
                >
              </div>
              <div class="flex-1"></div>
              <div class="flex items-center gap-2">
                <i class="fas fa-tasks text-red-500"></i>
                <span class="text-xs text-gray-700 truncate">
                  <span class="font-bold text-red-700 ml-1">{{
                    activity.no_of_materials > 1 ? "Bulk Stock" : "Individual"
                  }}</span></span
                >
              </div>
              <div class="flex-1"></div>
              <div
                v-if="activity.no_of_materials"
                class="flex items-center gap-2"
              >
                <i class="fas fa-boxes text-red-500"></i>
                <span class="text-xs text-gray-700 truncate"
                  >Materials:
                  <span class="font-bold text-red-700">{{
                    activity.no_of_materials
                  }}</span></span
                >
              </div>
              <!-- <div v-if="activity.items" class="flex items-center gap-2">
                <i class="fas fa-cubes-stacked text-red-500"></i>
                <span class="text-xs text-gray-700 truncate">Items: <span class="font-bold text-red-700">{{
                  activity.items }}</span></span>
              </div> -->
              <div class="flex-1"></div>
              <div class="flex items-center gap-2 ml-auto">
                <i class="fas fa-clock text-red-500"></i>
                <span class="text-[10px] text-gray-700 truncate">{{
                  formatReadableDate(activity.created_at)
                }}</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <AddOrEditSite
      v-if="showAddSite"
      :edit-mode="false"
      @close="closeAddSite"
    />
  </div>
</template>
