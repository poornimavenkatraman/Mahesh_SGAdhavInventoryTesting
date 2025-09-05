<template>
  <div class="p-2 min-h-screen ">
    <!-- Styled breadcrumb nav bar -->
    <nav
      class="flex items-center p-2 mb-3"
      aria-label="Breadcrumb"
      style="background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%)"
    >
      <ol class="flex items-center space-x-1">
        <li>
          <router-link
            to="/reports"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-teal-700 font-semibold text-[9px] hover:bg-teal-200 transition"
          >
            <i class="fas fa-chart-bar mr-1 text-[11px]"></i> Reports
          </router-link>
        </li>
        <li>
          <span class="mx-1 text-teal-400">
            <i class="fas fa-chevron-right text-[10px]"></i>
          </span>
        </li>
        <li>
          <span
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-teal-700 font-semibold text-[9px]"
            aria-current="page"
          >
            <i class="fas fa-cubes mr-1 text-[11px]"></i> Stock Summary by Material
          </span>
        </li>
      </ol>
    </nav>
  <div class="flex items-center justify-between mb-6 gap-4">
      <div class="flex items-center gap-3">
        <div class="bg-teal-200 rounded-full p-3 flex items-center justify-center">
          <i class="fas fa-cubes text-lg text-teal-700"></i>
        </div>
        <h2 class="text-lg font-bold text-teal-700 tracking-tight">Stock Summary by Material</h2>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-4 py-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow disabled:opacity-50 transition"
          :disabled="!rows.length"
          @click="exportCSV"
        >
          <i class="fas fa-file-csv mr-2"></i> Export CSV
        </button>
        <router-link to="/reports" class="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-teal-700 text-xs font-semibold shadow transition">
          <i class="fas fa-arrow-left mr-1"></i> Back
        </router-link>
        <!-- <button class="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-teal-700 text-sm font-semibold shadow transition" @click="$emit('close')">
          <i class="fas fa-times mr-2"></i> Close
        </button> -->
      </div>
    </div>

    <div class="overflow-auto rounded border border-teal-100 bg-white">
      <SimpleTable
        v-if="rows.length"
        :columns="columns"
        :rows="rows"
        :showTotals="true"
        :pageSize="10"
      />

      <div v-else class="text-gray-400 text-center py-16 text-lg">
        <i class="fas fa-exclamation-circle text-2xl text-teal-300 mb-2"></i><br>
        No materials found.<br>
        <span class="text-xs">(Check data or Firestore rules.)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import SimpleTable from "@/components/Reports/SimpleTable.vue";
import {
  fetchStockSummaryByMaterial,
  toCSV,
  type StockSummaryRow,
} from "@/services/reports/stockSummary.service";

const rows = ref<StockSummaryRow[]>([]);

const columns = [
  { key: "material", label: "Material" },
  { key: "uom", label: "UOM" },
  { key: "stock_at_ho", label: "Stock @ HO", align: "right", sum: true },
  { key: "stock_available_at_site", label: "Available @ Sites", align: "right", sum: true },
  { key: "total_stock", label: "Total Stock", align: "right", sum: true },
];

function fmt(n: unknown) {
  const num = Number(n || 0);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

async function load() {
  try {
    rows.value = await fetchStockSummaryByMaterial();
    console.log("[StockSummary] loaded rows:", rows.value.length);
  } catch (e) {
    console.error("[StockSummary] failed to load:", e);
    rows.value = [];
  }
}

async function exportCSV() {
  if (!rows.value.length) return;
  const flatColumns = columns.map(c => ({ key: c.key, label: c.label }));
  const csv = toCSV(rows.value as any[], flatColumns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dt = new Date();
  const stamp = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
  a.href = url;
  a.download = `stock-summary-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

onMounted(load);
</script>