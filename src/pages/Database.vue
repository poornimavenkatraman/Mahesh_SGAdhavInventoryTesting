<template>
  <div class="p-3 text-xs min-h-screen">
    <button
      @click="reinitDb"
      :disabled="loading"
      class="bg-red-500 text-white px-4 py-2 rounded mb-4"
      :class="{ 'opacity-50 cursor-not-allowed': loading }"
    >
      <span v-if="loading && loadingType === 'reinit'">
        <i class="fas fa-spinner fa-spin"></i> Re-initializing...
      </span>
      <span v-else>Re-initialize Database with Base Data</span>
    </button>
    <button
      @click="populateDummyData"
      :disabled="loading"
      class="ml-5 bg-red-500 text-white px-4 py-2 rounded mb-4"
      :class="{ 'opacity-50 cursor-not-allowed': loading }"
    >
      <span v-if="loading && loadingType === 'dummy'">
        <i class="fas fa-spinner fa-spin"></i> Clearing Transactional Data..
      </span>
      <span v-else>Clear Transactional Data</span>
    </button>
    <h2 class="text-lg font-bold mb-4 text-teal-700">Database Tables</h2>
    <div
      class="max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6"
    >
      <div
        v-for="tbl in tableList"
        :key="tbl.name"
        class="bg-white rounded-xl shadow p-3 border border-teal-100 cursor-pointer hover:shadow-lg transition"
        @click="showTable(tbl.name)"
      >
        <div class="flex items-center gap-2">
          <i :class="tbl.icon + ' text-lg text-teal-600'"></i>
          <div>
            <div class="text-base font-semibold text-teal-800">
              {{ tbl.label }}
            </div>
            <div class="text-gray-500 text-xs">
              View all {{ tbl.label.toLowerCase() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Data -->
    <div class="overflow-x-auto max-w-5xl  p-3">
      <div
        v-if="activeTable"
        class="mt-4 p-4"
        ref="tableSectionRef"
      >
        <h3 class="text-base font-bold mb-2 text-teal-700">
          {{ activeTableLabel }}
        </h3>
        <div class="flex flex-wrap gap-2 mb-2">
          <!-- Filter input -->
          <div class="relative">
            <input
              v-model="filterText"
              type="text"
              placeholder="Filter..."
              class="border border-teal-200 rounded px-2 py-2 text-xs w-56 pl-8"
            />
            <span
              class="absolute left-2 top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none"
            >
              <i class="fas fa-search"></i>
            </span>
          </div>
          <!-- Sort dropdown -->
          <select
            v-model="sortField"
            class="border border-teal-200 rounded px-2 py-1 text-xs w-56"
          >
            <option value="">Sort by...</option>
            <option v-for="field in tableFields" :key="field" :value="field">
              {{ field }}
            </option>
          </select>

          <button
            v-if="sortField"
            @click="sortAsc = !sortAsc"
            class="ml-1 px-2 py-1 rounded border border-teal-200 text-xs"
          >
            {{ sortAsc ? "▲" : "▼" }}
          </button>
        </div>
        <div
          v-if="loading"
          class="text-teal-600 flex items-center gap-2 mb-2 text-xs"
        >
          <i class="fas fa-spinner fa-spin"></i> Loading
          {{ activeTableLabel.toLowerCase() }}...
        </div>
        <div class="">
          <table
            class="bg-white border border-teal-200 rounded-lg text-xs shadow"
          >
            <thead>
              <tr class="bg-teal-100">
                <th
                  v-for="field in tableFields"
                  :key="field"
                  class="border-b border-teal-200 px-3 py-2 text-teal-700 font-semibold text-start"
                >
                  {{ field }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in paginatedRows"
                :key="row.id"
                class="hover:bg-teal-50 transition-colors"
              >
                <td
                  v-for="field in tableFields"
                  :key="field"
                  class="border-b border-teal-100 px-3 py-2"
                >
                  <span v-if="isTimestamp(row[field])">
                    {{ formatTimestamp(row[field]) }}
                  </span>
                  <span v-else>
                    {{ row[field] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="!filteredAndSortedRows.length && !loading"
          class="text-gray-500 mt-2 text-xs"
        >
          No {{ activeTableLabel.toLowerCase() }} found.
        </div>

        <!-- Pagination controls -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-xs text-gray-500">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded bg-teal-500 text-white text-xs disabled:opacity-50"
            >
              First
            </button>
            <button
              @click="currentPage > 1 ? currentPage-- : null"
              class="px-3 py-1 rounded bg-teal-500 text-white text-xs disabled:opacity-50"
            >
              Prev
            </button>
            <button
              @click="currentPage < totalPages ? currentPage++ : null"
              class="px-3 py-1 rounded bg-teal-500 text-white text-xs disabled:opacity-50"
            >
              Next
            </button>
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded bg-teal-500 text-white text-xs disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-2 mt-2"
        >
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-2 py-1 rounded border border-teal-200 text-xs bg-white text-teal-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span class="px-2">Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-2 py-1 rounded border border-teal-200 text-xs bg-white text-teal-700 disabled:opacity-50"
          >
            Next
          </button>
          <select
            v-model="pageSize"
            class="ml-2 border border-teal-200 rounded px-2 py-1 text-xs"
          >
            <option v-for="size in [10, 20, 50, 100]" :key="size" :value="size">
              {{ size }} per page
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { clearAndLoadAll } from "@/services/seeding/baseDataService";
import baseData from "@/assets/base_data_without_users.json";
import {
  clearAndCreateDummyData,
  clearCollectionsAndResetMaterialCounts,
} from "@/services/createDummyDataService_workflows_denormalized";

const loading = ref(false);
const loadingType = ref("");

async function reinitDb() {
  loading.value = true;
  loadingType.value = "reinit";
  try {
    await clearAndLoadAll(baseData);
    alert("Database re-initialized!");
  } finally {
    loading.value = false;
    loadingType.value = "";
  }
}

async function populateDummyData() {
  loading.value = true;
  loadingType.value = "dummy";
  try {
    await clearCollectionsAndResetMaterialCounts();
    alert("Cleared Transactional Data");
  } finally {
    loading.value = false;
    loadingType.value = "";
  }
}

const filterText = ref("");
const sortField = ref("");
const sortAsc = ref(true);

const filteredAndSortedRows = computed(() => {
  let rows = tableRows.value;
  // Deep flatten utility for filtering
  function flattenDeep(val: any): string {
    if (val == null) return "";
    if (
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "boolean"
    )
      return String(val);
    if (val instanceof Date) return val.toISOString();
    if (Array.isArray(val)) return val.map(flattenDeep).join(" ");
    if (typeof val === "object")
      return Object.values(val).map(flattenDeep).join(" ");
    return "";
  }
  // Filter
  if (filterText.value) {
    const f = filterText.value.toLowerCase();
    rows = rows.filter((row) => flattenDeep(row).toLowerCase().includes(f));
  }
  // Sort
  if (sortField.value) {
    rows = [...rows].sort((a, b) => {
      const av = a[sortField.value];
      const bv = b[sortField.value];
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      if (av === bv) return 0;
      if (sortAsc.value) {
        return av > bv ? 1 : -1;
      } else {
        return av < bv ? 1 : -1;
      }
    });
  }
  return rows;
});

const currentPage = ref(1);
const pageSize = ref(10); // Default page size
const totalPages = computed(() =>
  Math.ceil(filteredAndSortedRows.value.length / pageSize.value)
);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredAndSortedRows.value.slice(start, end);
});

// List your Firestore collections here
const tableList = [
  { name: "suppliers", label: "Suppliers", icon: "fas fa-truck" },
  { name: "categories", label: "Categories", icon: "fas fa-list-alt" },
  { name: "subcategories", label: "Subcategories", icon: "fas fa-sitemap" },
  { name: "materials", label: "Materials", icon: "fas fa-cubes" },
  { name: "sites", label: "Sites", icon: "fas fa-map-marker-alt" },
  { name: "users", label: "Users", icon: "fas fa-users" },
  { name: "user_sites", label: "User Sites", icon: "fas fa-user-tag" },
  { name: "site_materials", label: "Site Materials", icon: "fas fa-warehouse" },
  { name: "workflows", label: "Workflows", icon: "fas fa-clipboard-list" },
  {
    name: "material_transactions",
    label: "Material Transactions",
    icon: "fas fa-exchange-alt",
  },
  {
    name: "workflow_trackers",
    label: "Workflow Trackers",
    icon: "fas fa-tasks",
  },
];

const activeTable = ref<string | null>(null);
const activeTableLabel = computed(() => {
  const found = tableList.find((t) => t.name === activeTable.value);
  return found ? found.label : "";
});

const tableRows = ref<any[]>([]);

const tableFields = computed(() => {
  if (!tableRows.value.length) return [];
  const allFields = new Set<string>();
  tableRows.value.forEach((row) => {
    Object.keys(row).forEach((key) => allFields.add(key));
  });
  const fields = Array.from(allFields);
  if (fields.includes("id")) {
    fields.splice(fields.indexOf("id"), 1);
    fields.unshift("id");
  }
  return fields;
});

function isTimestamp(val: any) {
  return val && (typeof val.toDate === "function" || val instanceof Date);
}

function formatTimestamp(ts: any) {
  if (!ts) return "";
  let date: Date | null = null;
  if (typeof ts.toDate === "function") {
    date = ts.toDate();
  } else if (ts instanceof Date) {
    date = ts;
  } else if (typeof ts === "number" || typeof ts === "string") {
    date = new Date(ts);
  }
  if (!date) return String(ts);

  // Format: 8th Aug 2025 5:50:49 PM
  const day = date.getDate();
  const daySuffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}${daySuffix} ${month} ${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}

const tableSectionRef = ref<HTMLElement | null>(null);

const showTable = async (tableName: string) => {
  activeTable.value = tableName;
  loading.value = true;
  tableRows.value = [];
  const snapshot = await getDocs(collection(db, tableName));
  tableRows.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  loading.value = false;
  // Scroll to table after load
  nextTick(() => {
    if (tableSectionRef.value) {
      tableSectionRef.value.scrollIntoView({ behavior: "smooth" });
    }
  });
};
</script>
