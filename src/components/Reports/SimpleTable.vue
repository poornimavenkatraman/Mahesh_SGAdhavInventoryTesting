<template>
  <div class="overflow-auto rounded mb-5 p-2">
    <table class="min-w-[900px] w-full rounded overflow-hidden">
      <thead class="bg-red-50 text-red-700 text-left text-xs">
        <tr>
          <th v-if="showIndex" class="px-3 py-2 font-semibold">#</th>
          <th v-for="c in columns" :key="c.key" class="px-3 py-2 font-semibold" :class="thClass(c)">
            {{ c.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(r, idx) in pagedRows"
          :key="r.id || idx"
          :class="[
            'border-t transition text-xs',
            idx % 2 === 0 ? 'bg-white' : 'bg-red-50',
            'hover:bg-red-100'
          ]"
        >
          <td v-if="showIndex" class="px-3 py-2">{{ idx + 1 + indexOffset + page * pageSize }}</td>
          <td v-for="c in columns" :key="c.key" class="px-3 py-2" :class="tdClass(c)">
            {{ format(r[c.key], c) }}
          </td>
        </tr>

        <tr v-if="showTotals" class="border-t bg-red-100 font-bold text-red-700 text-xs">
          <td v-if="showIndex" class="px-3 py-2">Totals</td>
          <td
            v-for="c in columns"
            :key="c.key"
            class="px-3 py-2"
            :class="tdClass(c)"
          >
            <span v-if="c.sum">{{ format(sum(c.key), c) }}</span>
          </td>
        </tr>

        <tr v-if="!rows.length">
          <td :colspan="columns.length + (showIndex ? 1 : 0)" class="px-3 py-6 text-center text-gray-400 text-xs">
            No data.
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Pagination controls -->
    <div v-if="rows.length > pageSize" class="flex justify-end items-center gap-2 mt-2 pr-2 text-xs">
      <button
        class="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-200 disabled:opacity-50"
        :disabled="page === 0"
        @click="page--"
      >Prev</button>
      <span>Page {{ page + 1 }} / {{ totalPages }}</span>
      <button
        class="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-200 disabled:opacity-50"
        :disabled="page >= totalPages - 1"
        @click="page++"
      >Next</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { type: Array, required: true }, // [{key,label,align?,sum?}]
  rows: { type: Array, default: () => [] },
  showIndex: { type: Boolean, default: true },
  indexOffset: { type: Number, default: 0 },
  showTotals: { type: Boolean, default: true },
  pageSize: { type: Number, default: 10 },
});

import { ref, computed } from "vue";
const page = ref(0);
const totalPages = computed(() => Math.ceil(props.rows.length / props.pageSize));
const pagedRows = computed(() => {
  const start = page.value * props.pageSize;
  return props.rows.slice(start, start + props.pageSize);
});

function tdClass(c) {
  return c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left";
}
function thClass(c) { return tdClass(c); }

function toNum(v) { return typeof v === "number" ? v : Number(v || 0); }
function sum(key) { return (props.rows || []).reduce((a, r) => a + toNum(r[key]), 0); }
function format(v, c) {
  if (c?.align === "right") {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n.toLocaleString() : "0";
  }
  return v ?? "";
}
</script>