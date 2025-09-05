<template>
  <div class="p-2 min-h-screen">
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
            <i class="fas fa-cubes mr-1 text-[11px]"></i> Aging / Dead Stock
            Report
          </span>
        </li>
      </ol>
    </nav>
    <div class="flex items-center justify-between mb-6 gap-4">
      <div class="flex items-center gap-3">
        <div
          class="bg-teal-200 rounded-full p-3 flex items-center justify-center"
        >
          <i class="fas fa-cubes text-lg text-teal-700"></i>
        </div>
        <h2 class="text-lg font-bold text-teal-700 tracking-tight">
          Aging / Dead Stock Report
        </h2>
      </div>
      <div class="flex gap-2 items-center">
        <label class="text-xs">Inactive ≥</label>
        <input
          type="number"
          v-model.number="threshold"
          min="1"
          class="px-2 py-1 border rounded w-20 text-xs"
        />
        <span class="text-xs">days</span>

        <button
          class="px-3 py-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow disabled:opacity-50 transition"
          @click="loadReport"
        >
          <i class="fas fa-filter mr-1"></i> Apply
        </button>

        <button
          class="px-3 py-2 rounded bg-teal-50 hover:bg-teal-200 text-teal-700 text-xs font-semibold shadow transition"
          @click="exportCSV"
        >
          <i class="fas fa-file-csv mr-1"></i> Export CSV
        </button>

        <router-link
          to="/reports"
          class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-teal-700 text-xs font-semibold shadow transition"
        >
          <i class="fas fa-arrow-left mr-1"></i> Back
        </router-link>
      </div>
    </div>

    <!-- Parent table with expandable rows -->
    <div
      class="overflow-auto rounded shadow-lg border border-teal-100 bg-white"
    >
      <table class="min-w-[1000px] w-full rounded overflow-hidden">
        <thead class="bg-teal-50 text-teal-700 text-left text-xs">
          <tr>
            <th class="px-3 py-2 w-10 font-semibold text-xs"></th>
            <th class="px-3 py-2 font-semibold text-xs">Material</th>
            <th class="px-3 py-2 font-semibold text-xs">UOM</th>
            <th class="px-3 py-2 text-right font-semibold text-xs">
              Avail @ Sites
            </th>
            <th class="px-3 py-2 text-right font-semibold text-xs">HO Stock</th>
            <th class="px-3 py-2 text-right font-semibold text-xs">
              Total (HO+Sites)
            </th>
            <th class="px-3 py-2 font-semibold text-xs">Last Updated</th>
            <th class="px-3 py-2 text-right font-semibold text-xs">
              Days Inactive
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(r, idx) in rows" :key="r.id">
            <!-- parent row -->
            <tr
              :class="[
                'border-t transition text-xs',
                idx % 2 === 0 ? 'bg-white' : 'bg-teal-50',
                'hover:bg-teal-100',
              ]"
            >
              <td class="px-3 py-2 align-top">
                <button
                  class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100"
                  @click="toggle(r)"
                  :aria-expanded="isExpanded(r.id) ? 'true' : 'false'"
                  :title="isExpanded(r.id) ? 'Collapse' : 'Expand'"
                >
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="isExpanded(r.id) ? 'rotate-90' : ''"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M6 4a1 1 0 011.707-.707l6 6a1 1 0 010 1.414l-6 6A1 1 0 016 15.586L11.586 10 6 4.414A1 1 0 016 4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </td>
              <td class="px-3 py-2 align-top">{{ r.material }}</td>
              <td class="px-3 py-2 align-top">{{ r.uom }}</td>
              <td class="px-3 py-2 text-right align-top">
                {{ fmt(r.available_at_sites) }}
              </td>
              <td class="px-3 py-2 text-right align-top">
                {{ fmt(r.ho_stock) }}
              </td>
              <td class="px-3 py-2 text-right align-top">
                {{ fmt(r.total_stock) }}
              </td>
              <td class="px-3 py-2 align-top">{{ r.last_updated }}</td>
              <td class="px-3 py-2 text-right align-top font-medium">
                {{ r.days_inactive }}
              </td>
            </tr>

            <!-- child row -->
            <tr v-if="isExpanded(r.id)" class="bg-teal-50/50 text-xs">
              <td></td>
              <!-- colspan must cover the remaining 7 columns -->
              <td class="px-3 py-2" colspan="7">
                <div v-if="loadingChild[r.id]" class="text-gray-500 py-2">
                  Loading site breakdown…
                </div>

                <div
                  v-else-if="(siteBreakdown[r.id] || []).length === 0"
                  class="text-gray-500 py-2"
                >
                  No site data for this material.
                </div>

                <div v-else class="overflow-auto">
                  <table class="min-w-[700px] w-full border rounded">
                    <thead class="bg-white text-xs">
                      <tr>
                        <th class="px-3 py-2 text-left font-semibold text-xs">
                          Site
                        </th>
                        <th class="px-3 py-2 text-right font-semibold text-xs">
                          Received
                        </th>
                        <th class="px-3 py-2 text-right font-semibold text-xs">
                          Consumed
                        </th>
                        <th class="px-3 py-2 text-right font-semibold text-xs">
                          Returned
                        </th>
                        <th class="px-3 py-2 text-right font-semibold text-xs">
                          Available @ Site
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="row in siteBreakdown[r.id]"
                        :key="row.site_id"
                        class="border-t text-xs"
                      >
                        <td class="px-3 py-2 text-xs">{{ row.site_label }}</td>
                        <td class="px-3 py-2 text-right text-xs">
                          {{ fmt(row.received) }}
                        </td>
                        <td class="px-3 py-2 text-right text-xs">
                          {{ fmt(row.consumed) }}
                        </td>
                        <td class="px-3 py-2 text-right text-xs">
                          {{ fmt(row.returned) }}
                        </td>
                        <td class="px-3 py-2 text-right font-medium text-xs">
                          {{ fmt(row.available_at_site) }}
                        </td>
                      </tr>

                      <tr class="border-t bg-teal-50 font-bold text-xs">
                        <td class="px-3 py-2 text-right text-xs">Totals</td>
                        <td class="px-3 py-2 text-right text-xs">
                          {{ fmt(sum(siteBreakdown[r.id], "received")) }}
                        </td>
                        <td class="px-3 py-2 text-right text-xs">
                          {{ fmt(sum(siteBreakdown[r.id], "consumed")) }}
                        </td>
                        <td class="px-3 py-2 text-right text-xs">
                          {{ fmt(sum(siteBreakdown[r.id], "returned")) }}
                        </td>
                        <td class="px-3 py-2 text-right text-xs">
                          {{
                            fmt(sum(siteBreakdown[r.id], "available_at_site"))
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!rows.length">
            <!-- 8 columns total (incl. chevron) -->
            <td class="px-3 py-6 text-center text-gray-400 text-xs" colspan="8">
              No aging stock (qty &gt; 0) older than {{ threshold }} days
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toCSV } from "@/services/reports/stockSummary.service";
import {
  fetchAgingStockReport,
  fetchMaterialSiteBreakdown,
  type AgingRow,
  type MaterialSiteRow,
} from "@/services/reports/agingStock.service";

const rows = ref<AgingRow[]>([]);
const threshold = ref<number>(90); // default value

// expand state + cached child data
const expanded = ref<Record<string, boolean>>({});
const siteBreakdown = ref<Record<string, MaterialSiteRow[]>>({});
const loadingChild = ref<Record<string, boolean>>({});

function isExpanded(id: string) {
  return !!expanded.value[id];
}

function fmt(n: any) {
  const num = Number(n || 0);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

function sum(list: MaterialSiteRow[] | undefined, key: keyof MaterialSiteRow) {
  if (!list?.length) return 0;
  return list.reduce((acc, r) => acc + Number(r[key] || 0), 0);
}

async function toggle(r: AgingRow) {
  const id = r.id;
  expanded.value[id] = !expanded.value[id];

  if (expanded.value[id] && !siteBreakdown.value[id]) {
    loadingChild.value[id] = true;
    try {
      siteBreakdown.value[id] = await fetchMaterialSiteBreakdown(id);
    } finally {
      loadingChild.value[id] = false;
    }
  }
}

async function loadReport() {
  // collapse all, clear child cache (optional — keep if you want fresh)
  expanded.value = {};
  siteBreakdown.value = {};
  rows.value = await fetchAgingStockReport(threshold.value);
}

async function exportCSV() {
  // export only parent rows (materials)
  const headerMap = [
    { key: "material", label: "Material" },
    { key: "uom", label: "UOM" },
    { key: "available_at_sites", label: "Avail @ Sites" },
    { key: "ho_stock", label: "HO Stock" },
    { key: "total_stock", label: "Total (HO+Sites)" },
    { key: "last_updated", label: "Last Updated" },
    { key: "days_inactive", label: "Days Inactive" },
  ];
  const csv = toCSV(rows.value as any[], headerMap);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dt = new Date();
  const stamp = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(dt.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `aging-stock-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

onMounted(loadReport);
</script>

<style scoped>
.rotate-90 {
  transform: rotate(90deg);
}
</style>
