<template>
  <div class="p-4 min-h-[60vh]">
    <nav class="flex items-center p-2 mb-3" aria-label="Breadcrumb"
      style="background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%)">
      <ol class="flex items-center space-x-1">
        <li>
          <router-link
            to="/reports"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white font-semibold text-[9px] hover:bg-opacity-80 transition"
            :class="theme.text"
          >
            <i class="fas fa-chart-bar mr-1 text-[11px]"></i> Reports
          </router-link>
        </li>
        <li>
          <span class="mx-1" :class="theme.subtleText">
            <i class="fas fa-chevron-right text-[10px]"></i>
          </span>
        </li>
        <li>
          <span
            class="inline-flex items-center px-2 py-1 rounded-full bg-white font-semibold text-[9px]"
            :class="theme.text"
            aria-current="page"
          >
            <i class="fas fa-cubes mr-1 text-[11px]"></i> Site-Wise Stock Availability Report
          </span>
        </li>
      </ol>
    </nav>

    <!-- Heading -->
    <div class="flex items-center justify-between mb-6 gap-4">
      <div class="flex items-center gap-3">
        <div class="rounded-full p-3 flex items-center justify-center" :class="theme.bg">
          <i class="fas fa-cubes text-lg" :class="theme.text"></i>
        </div>
        <h2 class="text-lg font-bold tracking-tight" :class="theme.text">Site-Wise Stock Availability</h2>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="selectedSiteId"
          class="px-2 py-1 border rounded min-w-64 text-xs"
          @change="loadReport"
        >
          <option value="" disabled>Select a site…</option>
          <option v-for="s in sites" :key="s.id" :value="s.id">
            {{ s.label }}
          </option>
        </select>

        <button
          class="px-3 py-2 rounded-xl text-xs font-semibold shadow transition"
          :class="[themeAccent.bg, themeAccent.hoverBg, theme.text]"
          :disabled="!rows.length"
          @click="exportCSV"
        >
          <i class="fas fa-file-csv mr-1"></i> Export CSV
        </button>

        <router-link
          to="/reports"
          class="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs font-semibold shadow transition"
          :class="theme.text"
        >
          <i class="fas fa-arrow-left mr-1"></i> Back
        </router-link>
      </div>
    </div>

    <!-- Grouped Table Output -->
    <div v-if="rows.length" class="space-y-6">
      <div
        v-for="grp in grouped"
        :key="grp.category"
        class="rounded shadow-lg bg-white"
        :class="theme.border"
      >
        <div class="px-4 py-3 font-semibold rounded text-xs" :class="[theme.bg, theme.text]">
          {{ grp.category }}
        </div>
        <div class="p-3">
          <SimpleTable
            :columns="columns"
            :rows="grp.items"
            :showTotals="true"
            :pageSize="10"
            class="text-xs"
          />
        </div>
      </div>
    </div>

    <!-- Empty Message -->
    <div v-else class="text-center py-10 text-xs text-gray-400">
      {{
        sites.length ? "No data available for this site." : "No sites found."
      }}
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import SimpleTable from "@/components/Reports/SimpleTable.vue";
import {
  fetchSites,
  fetchSiteAvailabilityByCategory,
  type SiteOption,
  type RowByMaterial,
} from "@/services/reports/siteStockAvailability.service";
import { toCSV } from "@/services/reports/stockSummary.service";
import { useThemeColors } from '@/composables/useThemeColors';
const theme = useThemeColors('error');
const themeAccent = useThemeColors('error');

const sites = ref<SiteOption[]>([]);
const selectedSiteId = ref<string>("");
const rows = ref<RowByMaterial[]>([]);

const columns = [
  { key: "material", label: "Material" },
  { key: "uom", label: "UOM" },
  { key: "received", label: "Received", align: "right", sum: true },
  { key: "consumed", label: "Consumed", align: "right", sum: true },
  { key: "returned", label: "Returned", align: "right", sum: true },
  {
    key: "available_at_site",
    label: "Available @ Site",
    align: "right",
    sum: true,
  },
];

const grouped = computed(() => {
  const byCat: Record<string, RowByMaterial[]> = {};
  for (const r of rows.value) {
    (byCat[r.category] ||= []).push(r);
  }
  return Object.keys(byCat)
    .sort()
    .map((cat) => ({ category: cat, items: byCat[cat] }));
});

async function loadSites() {
  const list = await fetchSites();
  sites.value = list;

  if (list.length) {
    // first site (alphabetically sorted in service)
    selectedSiteId.value = list[0].id;
    await loadReport();
  } else {
    selectedSiteId.value = "";
    rows.value = [];
  }
}

async function loadReport() {
  if (!selectedSiteId.value) return;
  rows.value = await fetchSiteAvailabilityByCategory(selectedSiteId.value);
}

async function exportCSV() {
  if (!rows.value.length) return;
  const flatColumns = [
    { key: "category", label: "Category" },
    ...columns.map((c) => ({ key: c.key, label: c.label })),
  ];
  const csv = toCSV(rows.value, flatColumns);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dt = new Date();
  const stamp = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(dt.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `site-availability-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

onMounted(loadSites);
</script>
