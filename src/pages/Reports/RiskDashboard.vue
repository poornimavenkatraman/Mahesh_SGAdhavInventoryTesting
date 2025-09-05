<template>
  <div class="p-2  min-h-screen bg-red-50/30">
    <nav
      class="flex items-center p-2 mb-3"
      aria-label="Breadcrumb"
      style="background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%)"
    >
      <ol class="flex items-center space-x-1">
        <li>
          <router-link
            to="/reports"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px] hover:bg-red-200 transition"
          >
            <i class="fas fa-chart-bar mr-1 text-[11px]"></i> Reports
          </router-link>
        </li>
        <li>
          <span class="mx-1 text-red-400">
            <i class="fas fa-chevron-right text-[10px]"></i>
          </span>
        </li>
        <li>
          <span
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-red-700 font-semibold text-[9px]"
            aria-current="page"
          >
            <i class="fas fa-cubes mr-1 text-[11px]"></i> Risk Dashboard
            Report
          </span>
        </li>
      </ol>
    </nav>
    <div class="flex items-center justify-between p-2">
      <div class="flex items-center gap-3">
        <div
          class="bg-red-200 rounded-full p-2 flex items-center justify-center"
        >
          <i class="fas fa-exclamation-triangle text-lg text-red-700"></i>
        </div>
        <h2 class="text-lg font-bold text-red-700 tracking-tight">
          Risk Dashboard
        </h2>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1 text-xs">
          <label class="text-gray-600">HO ≤</label>
          <input
            type="number"
            v-model.number="hoThreshold"
            class="w-16 px-2 py-1 border rounded-xl text-xs"
            min="0"
          />
        </div>
        <div class="flex items-center gap-1 text-xs">
          <label class="text-gray-600">Site ≤</label>
          <input
            type="number"
            v-model.number="siteThreshold"
            class="w-16 px-2 py-1 border rounded-xl text-xs"
            min="0"
          />
        </div>
        <div class="flex items-center gap-1 text-xs">
          <label class="text-gray-600">Aging ≥</label>
          <input
            type="number"
            v-model.number="agingDays"
            class="w-16 px-2 py-1 border rounded-xl text-xs"
            min="1"
          />
          <span class="text-gray-600">days</span>
        </div>
        <div class="flex items-center gap-1 text-xs">
          <label class="text-gray-600">Pending ≥</label>
          <input
            type="number"
            v-model.number="pendingDays"
            class="w-16 px-2 py-1 border rounded-xl text-xs"
            min="1"
          />
          <span class="text-gray-600">days</span>
        </div>

        <select
          v-model="selectedSiteId"
          class="px-2 py-1 border rounded-xl min-w-40 text-xs"
        >
          <option value="">All Sites</option>
          <option v-for="s in sites" :key="s.id" :value="s.id">
            {{ s.label }}
          </option>
        </select>

        <button
          class="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-200 text-red-700 text-xs font-semibold shadow transition"
          @click="load"
        >
          <i class="fas fa-filter mr-1"></i> Apply
        </button>
      </div>
    </div>

    <div class="p-4">
      <!-- KPI cards -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          class="rounded border border-red-100 shadow bg-white p-4 flex flex-col items-center"
        >
          <div class="text-xs text-gray-600 mb-1">Low HO Stock</div>
          <div class="text-3xl font-bold text-red-700">{{ lowHO.length }}</div>
        </div>
        <div
          class="rounded border border-red-100 shadow bg-white p-4 flex flex-col items-center"
        >
          <div class="text-xs text-gray-600 mb-1">Low Site Stock</div>
          <div class="text-3xl font-bold text-red-700">
            {{ lowSite.length }}
          </div>
        </div>
        <div
          class="rounded border border-red-100 shadow bg-white p-4 flex flex-col items-center"
        >
          <div class="text-xs text-gray-600 mb-1">
            Aging (≥ {{ agingDays }}d)
          </div>
          <div class="text-3xl font-bold text-red-700">{{ aging.length }}</div>
        </div>
        <div
          class="rounded border border-red-100 shadow bg-white p-4 flex flex-col items-center"
        >
          <div class="text-xs text-gray-600 mb-1">
            Pending Supplier (≥ {{ pendingDays }}d)
          </div>
          <div class="text-3xl font-bold text-red-700">
            {{ pending.length }}
          </div>
        </div>
      </div>

      <!-- Low HO -->
      <section
        class="rounded border border-red-100 shadow bg-white overflow-hidden mb-6"
      >
        <div class="flex items-center justify-between px-4 py-3 bg-red-50">
          <h3 class="font-semibold text-red-700 text-xs">
            Low HO Stock (≤ {{ hoThreshold }})
          </h3>
          <button
            class="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-200 text-red-700 font-semibold shadow transition"
            :disabled="!lowHO.length"
            @click="exportCSV('ho')"
          >
            <i class="fas fa-file-csv mr-1"></i> Export CSV
          </button>
        </div>
        <div class="p-3 overflow-auto">
          <SimpleTable
            v-if="lowHO.length"
            :columns="columnsLowHO"
            :rows="lowHO"
            :showTotals="true"
          />
          <div v-else class="text-gray-400 text-center py-6 text-xs">
            No items.
          </div>
        </div>
      </section>

      <!-- Low Site -->
      <section
        class="rounded border border-red-100 shadow bg-white overflow-hidden mb-6"
      >
        <div class="flex items-center justify-between px-4 py-3 bg-red-50">
          <h3 class="font-semibold text-red-700 text-xs">
            Low Site Stock (≤ {{ siteThreshold }})
            <span v-if="selectedSiteLabel" class="text-gray-600 font-normal"
              >— {{ selectedSiteLabel }}</span
            >
          </h3>
          <button
            class="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-200 text-red-700 font-semibold shadow transition"
            :disabled="!lowSite.length"
            @click="exportCSV('site')"
          >
            <i class="fas fa-file-csv mr-1"></i> Export CSV
          </button>
        </div>
        <div class="p-3 overflow-auto">
          <SimpleTable
            v-if="lowSite.length"
            :columns="columnsLowSite"
            :rows="lowSite"
            :showTotals="false"
          />
          <div v-else class="text-gray-400 text-center py-6 text-xs">
            No items.
          </div>
        </div>
      </section>

      <!-- Aging -->
      <section
        class="rounded border border-red-100 shadow bg-white overflow-hidden mb-6"
      >
        <div class="flex items-center justify-between px-4 py-3 bg-red-50">
          <h3 class="font-semibold text-red-700 text-xs">
            Aging (≥ {{ agingDays }} days)
          </h3>
          <button
            class="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-200 text-red-700 font-semibold shadow transition"
            :disabled="!aging.length"
            @click="exportCSV('aging')"
          >
            <i class="fas fa-file-csv mr-1"></i> Export CSV
          </button>
        </div>
        <div class="p-3 overflow-auto">
          <SimpleTable
            v-if="aging.length"
            :columns="columnsAging"
            :rows="aging"
            :showTotals="false"
          />
          <div v-else class="text-gray-400 text-center py-6 text-xs">
            No items.
          </div>
        </div>
      </section>

      <!-- Pending Supplier -->
      <section
        class="rounded border border-red-100 shadow bg-white overflow-hidden mb-6"
      >
        <div class="flex items-center justify-between px-4 py-3 bg-red-50">
          <h3 class="font-semibold text-red-700 text-xs">
            Pending Supplier Requests (≥ {{ pendingDays }} days open)
          </h3>
          <button
            class="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-200 text-red-700 font-semibold shadow transition"
            :disabled="!pending.length"
            @click="exportCSV('pending')"
          >
            <i class="fas fa-file-csv mr-1"></i> Export CSV
          </button>
        </div>
        <div class="p-3 overflow-auto">
          <SimpleTable
            v-if="pending.length"
            :columns="columnsPending"
            :rows="pending"
            :showTotals="true"
          />
          <div v-else class="text-gray-400 text-center py-6 text-xs">
            No items.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import SimpleTable from "@/components/Reports/SimpleTable.vue";
import { toCSV } from "@/services/reports/stockSummary.service";
import {
  fetchRiskDashboard,
  fetchLowHOStock,
  fetchLowSiteStock,
  fetchAgingRisk,
  fetchPendingSupplierRisk,
  type LowHOStockRow,
  type LowSiteStockRow,
  type AgingRiskRow,
  type PendingRiskRow,
  csvLowHO,
  csvLowSite,
  csvAging,
  csvPending,
} from "@/services/reports/riskDashboard.service";
import {
  fetchSites,
  type SiteOption,
} from "@/services/reports/siteStockAvailability.service";

const hoThreshold = ref<number>(10);
const siteThreshold = ref<number>(5);
const agingDays = ref<number>(90);
const pendingDays = ref<number>(7);

const sites = ref<SiteOption[]>([]);
const selectedSiteId = ref<string>("");
const selectedSiteLabel = computed(() => {
  const match = sites.value.find((s) => s.id === selectedSiteId.value);
  return match?.label || "";
});

const lowHO = ref<LowHOStockRow[]>([]);
const lowSite = ref<LowSiteStockRow[]>([]);
const aging = ref<AgingRiskRow[]>([]);
const pending = ref<PendingRiskRow[]>([]);

const columnsLowHO = [
  { key: "material", label: "Material" },
  { key: "uom", label: "UOM" },
  { key: "stock_at_ho", label: "Stock @ HO", align: "right", sum: true },
  {
    key: "available_at_sites",
    label: "Available @ Sites",
    align: "right",
    sum: true,
  },
  { key: "total_stock", label: "Total (HO+Sites)", align: "right", sum: true },
];

const columnsLowSite = [
  { key: "site_label", label: "Site" },
  { key: "material", label: "Material" },
  { key: "uom", label: "UOM" },
  { key: "available_at_site", label: "Available @ Site", align: "right" },
];

const columnsAging = [
  { key: "material", label: "Material" },
  { key: "uom", label: "UOM" },
  { key: "days_inactive", label: "Days Inactive", align: "right" },
  { key: "total_stock", label: "Qty (HO+Sites)", align: "right", sum: true },
];

const columnsPending = [
  { key: "supplier_name", label: "Supplier" },
  { key: "id", label: "Request ID" },
  { key: "site_label", label: "Site" },
  { key: "days_open", label: "Days Open", align: "right" },
  { key: "pending_total", label: "Pending Qty", align: "right", sum: true },
];

async function loadSites() {
  sites.value = await fetchSites();
}

async function load() {
  // You can either call the aggregated fetch, or load each independently:
  // const data = await fetchRiskDashboard({ hoThreshold: hoThreshold.value, siteThreshold: siteThreshold.value, agingDays: agingDays.value, pendingDays: pendingDays.value, siteId: selectedSiteId.value || undefined });
  // lowHO.value = data.lowHO; lowSite.value = data.lowSite; aging.value = data.aging; pending.value = data.pending;

  // Separate loads keep UI responsive if you later add section-level spinners
  [lowHO.value, lowSite.value, aging.value, pending.value] = await Promise.all([
    fetchLowHOStock(hoThreshold.value),
    fetchLowSiteStock(siteThreshold.value, selectedSiteId.value || undefined),
    fetchAgingRisk(agingDays.value),
    fetchPendingSupplierRisk(pendingDays.value),
  ]);
}

function download(name: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dt = new Date();
  const stamp = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(dt.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `${name}-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportCSV(section: "ho" | "site" | "aging" | "pending") {
  if (section === "ho" && lowHO.value.length)
    return download("risk-low-ho", csvLowHO(lowHO.value));
  if (section === "site" && lowSite.value.length)
    return download("risk-low-site", csvLowSite(lowSite.value));
  if (section === "aging" && aging.value.length)
    return download("risk-aging", csvAging(aging.value));
  if (section === "pending" && pending.value.length)
    return download("risk-pending-supplier", csvPending(pending.value));
}

onMounted(async () => {
  await loadSites();
  await load();
});
</script>
