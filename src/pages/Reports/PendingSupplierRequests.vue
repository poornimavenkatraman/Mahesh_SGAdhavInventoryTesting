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
            <i class="fas fa-cubes mr-1 text-[11px]"></i> Pending Supplier Requests
            Report
          </span>
        </li>
      </ol>
    </nav>
    <div class="flex items-center justify-between mb-6 gap-4">
      <div class="flex items-center gap-3">
        <div class="bg-red-100 rounded-full p-3 flex items-center justify-center">
          <i class="fas fa-truck text-lg text-red-700"></i>
        </div>
        <h2 class="text-lg font-bold text-red-700 tracking-tight">Pending Supplier Requests</h2>
      </div>
      <div class="flex items-center gap-3">
        <!-- simple status checkboxes -->
        <div class="flex gap-3 items-center text-xs">
          <label class="font-medium">Statuses:</label>
          <label
            v-for="s in allStatuses"
            :key="s"
            class="inline-flex items-center gap-1"
          >
            <input type="checkbox" v-model="selected" :value="s" />
            <span class="capitalize">{{ s.replaceAll("_", " ") }}</span>
          </label>
        </div>

        <button
          class="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-200 text-red-700 text-xs font-semibold shadow transition"
          @click="load"
        >
          <i class="fas fa-filter mr-1"></i> Apply
        </button>

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

      <!-- Grouped by Supplier -->
      <div v-if="grouped.length" class="space-y-6">
        <div
          v-for="grp in grouped"
          :key="grp.supplier"
          class="rounded-2xl border border-red-100 shadow-lg bg-white overflow-hidden"
        >
          <div
            class="px-4 py-3 font-semibold bg-red-50 flex items-center justify-between text-xs text-red-700"
          >
            <span>{{ grp.supplier }}</span>
            <span class="text-xs text-gray-600"
              >Requests: {{ grp.items.length }}</span
            >
          </div>

          <div class="overflow-auto">
            <table class="min-w-[900px] w-full text-xs rounded-2xl overflow-hidden">
              <thead class="bg-white text-left text-xs">
                <tr>
                  <th class="px-3 py-2 w-10 text-xs"></th>
                  <th class="px-3 py-2 text-xs">Request ID</th>
                  <th class="px-3 py-2 text-xs">Site</th>
                  <th class="px-3 py-2 text-xs">Status</th>
                  <th class="px-3 py-2 text-xs">Created</th>
                  <th class="px-3 py-2 text-xs">Updated</th>
                  <th class="px-3 py-2 text-right text-xs">Days Open</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="r in grp.items" :key="r.id">
                  <tr :class="[
                    'border-t transition text-xs',
                    'hover:bg-red-50'
                  ]">
                    <td class="px-3 py-2 align-top text-xs">
                      <button
                        class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100"
                        @click="toggle(r.id)"
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
                    <td class="px-3 py-2 align-top font-mono text-xs">{{ r.id }}</td>
                    <td class="px-3 py-2 align-top text-xs">{{ r.site_label }}</td>
                    <td class="px-3 py-2 align-top capitalize text-xs">
                      {{ r.status.replaceAll("_", " ") }}
                    </td>
                    <td class="px-3 py-2 align-top text-xs">{{ r.created_at_str }}</td>
                    <td class="px-3 py-2 align-top text-xs">{{ r.updated_at_str }}</td>
                    <td class="px-3 py-2 align-top text-right font-medium text-xs">
                      {{ r.days_open }}
                    </td>
                  </tr>

                  <!-- Items (child row) -->
                  <tr v-if="isExpanded(r.id)" class="bg-red-50/50 border-t text-xs">
                    <td></td>
                    <td class="px-3 py-2 text-xs" colspan="6">
                      <div v-if="loading[r.id]" class="text-gray-500 py-2 text-xs">
                        Loading items…
                      </div>

                      <div
                        v-else-if="(items[r.id] || []).length === 0"
                        class="text-gray-500 py-2 text-xs"
                      >
                        No line items found for this request.
                      </div>

                      <div v-else class="overflow-auto">
                        <table
                          class="min-w-[700px] w-full border rounded"
                        >
                          <thead class="bg-white text-xs">
                            <tr>
                              <th class="px-3 py-2 text-left font-semibold text-xs">Material</th>
                              <th class="px-3 py-2 text-left font-semibold text-xs">UOM</th>
                              <th class="px-3 py-2 text-right font-semibold text-xs">Requested</th>
                              <th class="px-3 py-2 text-right font-semibold text-xs">Received</th>
                              <th class="px-3 py-2 text-right font-semibold text-xs">Pending</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="it in items[r.id]"
                              :key="it.material_id"
                              class="border-t text-xs"
                            >
                              <td class="px-3 py-2 text-xs">{{ it.material_name }}</td>
                              <td class="px-3 py-2 text-xs">{{ it.uom }}</td>
                              <td class="px-3 py-2 text-right text-xs">
                                {{ fmt(it.qty_requested) }}
                              </td>
                              <td class="px-3 py-2 text-right text-xs">
                                {{ fmt(it.qty_received) }}
                              </td>
                              <td class="px-3 py-2 text-right font-medium text-xs">
                                {{ fmt(it.qty_pending) }}
                              </td>
                            </tr>

                            <tr class="border-t bg-red-50 font-bold text-xs">
                              <td class="px-3 py-2 text-right text-xs">Totals</td>
                              <td></td>
                              <td class="px-3 py-2 text-right text-xs">
                                {{ fmt(sum(items[r.id], "qty_requested")) }}
                              </td>
                              <td class="px-3 py-2 text-right text-xs">
                                {{ fmt(sum(items[r.id], "qty_received")) }}
                              </td>
                              <td class="px-3 py-2 text-right text-xs">
                                {{ fmt(sum(items[r.id], "qty_pending")) }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-400 text-center py-10 text-xs">
        No pending supplier requests for the selected statuses.
      </div>
    </div>
  <!-- End main card -->
  <!-- End main card -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { toCSV } from "@/services/reports/stockSummary.service";
import {
  fetchPendingSupplierRequests,
  fetchSupplierRequestItems,
  type PendingRequestRow,
  type RequestItemRow,
} from "@/services/reports/pendingSupplierRequests.service";

const allStatuses = [
  "pending",
  "requested",
  "approved",
  "in_transit",
  "dispatched",
  "open",
];
const selected = ref<string[]>([...allStatuses]);

const rows = ref<PendingRequestRow[]>([]);
const expanded = ref<Record<string, boolean>>({});
const loading = ref<Record<string, boolean>>({});
const items = ref<Record<string, RequestItemRow[]>>({});

function isExpanded(id: string) {
  return !!expanded.value[id];
}

function fmt(n: unknown) {
  const num = Number(n || 0);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

function sum(list: RequestItemRow[] | undefined, key: keyof RequestItemRow) {
  if (!list?.length) return 0;
  return list.reduce((acc, r) => acc + Number(r[key] || 0), 0);
}

const grouped = computed(() => {
  const bySupplier: Record<string, PendingRequestRow[]> = {};
  for (const r of rows.value) (bySupplier[r.supplier_name] ||= []).push(r);
  return Object.keys(bySupplier)
    .sort()
    .map((supplier) => ({ supplier, items: bySupplier[supplier] }));
});

async function load() {
  expanded.value = {};
  items.value = {};
  loading.value = {};
  rows.value = await fetchPendingSupplierRequests();
}

async function toggle(id: string) {
  expanded.value[id] = !expanded.value[id];
  if (expanded.value[id] && !items.value[id]) {
    loading.value[id] = true;
    try {
      items.value[id] = await fetchSupplierRequestItems(id);
    } finally {
      loading.value[id] = false;
    }
  }
}

async function exportCSV() {
  // Export parent-level rows
  const columns = [
    { key: "supplier_name", label: "Supplier" },
    { key: "id", label: "Request ID" },
    { key: "site_label", label: "Site" },
    { key: "status", label: "Status" },
    { key: "created_at_str", label: "Created" },
    { key: "updated_at_str", label: "Updated" },
    { key: "days_open", label: "Days Open" },
  ];
  const csv = toCSV(rows.value as any[], columns as any);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dt = new Date();
  const stamp = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(dt.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `pending-supplier-requests-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

onMounted(load);
</script>

<style scoped>
.rotate-90 {
  transform: rotate(90deg);
}
</style>
