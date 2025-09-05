<template>
  <div class="p-4 min-h-[60vh]">
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
            <i class="fas fa-cubes mr-1 text-[11px]"></i> Availability at HO
            Report
          </span>
        </li>
      </ol>
    </nav>
    <div class="flex items-center justify-between mb-6 gap-4">
      <div class="flex items-center gap-3">
        <div class="bg-red-100 rounded-full p-3 flex items-center justify-center">
          <i class="fas fa-cubes text-lg text-red-700"></i>
        </div>
        <h2 class="text-lg font-bold text-red-700 tracking-tight">Availability at HO</h2>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-200 text-red-700 text-xs font-semibold shadow transition"
          :disabled="!rows.length"
          @click="exportCSV"
        >
          <i class="fas fa-file-csv mr-1"></i> Export CSV
        </button>
        <router-link to="/reports" class="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-red-700 text-xs font-semibold shadow transition">
          <i class="fas fa-arrow-left mr-1"></i> Back
        </router-link>
      </div>
    </div>

      <div v-if="rows.length" class="space-y-6">
        <div
          v-for="grp in grouped"
          :key="grp.category"
          class="rounded border border-red-100 shadow-lg bg-white"
        >
          <div class="px-4 py-3 font-semibold bg-red-50 rounded-t-2xl text-xs text-red-700">
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

      <div v-else class="text-gray-400 text-center py-10 text-xs">
        No materials with stock at HO &gt; 0.
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import SimpleTable from "@/components/Reports/SimpleTable.vue";
import { toCSV } from "@/services/reports/stockSummary.service";
import {
  fetchHOAvailabilityByCategory,
  type RowByMaterialHO,
} from "@/services/reports/hoStockAvailability.service";

const rows = ref<RowByMaterialHO[]>([]);

const columns = [
  { key: "material", label: "Material" },
  { key: "uom", label: "UOM" },
  { key: "stock_at_ho", label: "Stock @ HO", align: "right", sum: true },
];

const grouped = computed(() => {
  const byCat: Record<string, RowByMaterialHO[]> = {};
  for (const r of rows.value) (byCat[r.category] ||= []).push(r);
  return Object.keys(byCat)
    .sort()
    .map((cat) => ({ category: cat, items: byCat[cat] }));
});

function fmt(n: any) {
  const num = Number(n || 0);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

async function load() {
  rows.value = await fetchHOAvailabilityByCategory();
}

async function exportCSV() {
  if (!rows.value.length) return;
  const flatColumns = [
    { key: "category", label: "Category" },
    ...columns.map((c) => ({ key: c.key, label: c.label })),
  ];
  const csv = toCSV(rows.value as any[], flatColumns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dt = new Date();
  const stamp = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(dt.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `ho-availability-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

onMounted(load);
</script>
