<template>
  <div class="p-4">
    <div class="flex items-center gap-3 mb-4">
      <div class="bg-teal-200 rounded-full p-2">
        <i class="fas fa-chart-line text-lg text-teal-700"></i>
      </div>
      <h2 class="text-lg font-bold text-teal-700">Reports</h2>
    </div>
    <!-- Report Type Pills -->
    <div class="flex gap-3 mb-8">
      <span v-for="report in reports" :key="report.type" @click="selectedReport = report.type" :class="[
        'px-4 py-2 rounded-full cursor-pointer font-semibold transition',
        selectedReport === report.type
          ? 'bg-teal-600 text-white'
          : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
      ]">
        {{ report.label }}
      </span>
    </div>
    <!-- Selected Report Card -->
    <div v-if="selectedReport" class="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold text-teal-700 mb-2">
        {{reports.find(r => r.type === selectedReport).label}}
      </h2>
      <p class="text-gray-600 mb-4">
        {{reports.find(r => r.type === selectedReport).desc}}
      </p>
      <!-- Report Filter Form -->
      <form class="mb-6 flex flex-col gap-4 items-start">
        <!-- FY and Month Pills in Same Line -->
        <div>
          <label class="block text-teal-700 font-medium mb-1">Financial Year / Month</label>
          <div class="flex gap-2 flex-wrap">
            <span v-for="fy in financialYears" :key="fy.label" @click="selectFY(fy)" :class="[
              'px-3 py-1 rounded-full cursor-pointer font-semibold transition',
              filters.fy === fy.label
                ? 'bg-teal-600 text-white'
                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
            ]">
              {{ fy.label }}
            </span>
            <span v-for="month in lastThreeMonths" :key="month.label" @click="selectMonth(month)" :class="[
              'px-3 py-1 rounded-full cursor-pointer font-semibold transition',
              filters.month === month.label
                ? 'bg-teal-600 text-white'
                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
            ]">
              {{ month.label }}
            </span>
          </div>
        </div>
        <!-- Date Selection -->
        <div class="flex gap-4 flex-wrap">
          <div>
            <label class="block text-teal-700 font-medium mb-1">Start Date</label>
            <input v-model="filters.startDate" type="date"
              class="border border-teal-200 rounded px-3 py-2 focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label class="block text-teal-700 font-medium mb-1">End Date</label>
            <input v-model="filters.endDate" type="date"
              class="border border-teal-200 rounded px-3 py-2 focus:ring-2 focus:ring-teal-400" />
          </div>
        </div>
        <!-- Other filters in a separate wider line -->
        <div class="flex gap-4 flex-wrap w-full">
          <div v-if="selectedReport === 'stock-summary'" class="min-w-[220px]">
            <label class="block text-teal-700 font-medium mb-1">Category</label>
            <select v-model="filters.category"
              class="border border-teal-200 rounded px-4 py-2 w-full focus:ring-2 focus:ring-teal-400">
              <option value="">All</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div v-if="selectedReport === 'site-consumption'" class="min-w-[220px]">
            <label class="block text-teal-700 font-medium mb-1">Site</label>
            <select v-model="filters.site"
              class="border border-teal-200 rounded px-4 py-2 w-full focus:ring-2 focus:ring-teal-400">
              <option value="">All</option>
              <option v-for="site in sites" :key="site" :value="site">{{ site }}</option>
            </select>
          </div>
          <div v-if="selectedReport === 'dispatch-history'" class="min-w-[220px]">
            <label class="block text-teal-700 font-medium mb-1">Site</label>
            <select v-model="filters.site"
              class="border border-teal-200 rounded px-4 py-2 w-full focus:ring-2 focus:ring-teal-400">
              <option value="">All</option>
              <option v-for="site in sites" :key="site" :value="site">{{ site }}</option>
            </select>
          </div>
          <div v-if="selectedReport === 'request-status'" class="min-w-[220px]">
            <label class="block text-teal-700 font-medium mb-1">Status</label>
            <select v-model="filters.requestStatus"
              class="border border-teal-200 rounded px-4 py-2 w-full focus:ring-2 focus:ring-teal-400">
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <button type="button"
          class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded shadow font-semibold ml-2">
          Generate Report
        </button>
      </form>
      <!-- Placeholder for report content/table/chart -->
      <div class="border border-teal-100 rounded p-6 text-center text-gray-400">
        [Report results will appear here]
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Helper to get last 3 months
function getLastThreeMonths() {
  const now = new Date();
  const monthsArr = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthsArr.push({
      label,
      start: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`,
      end: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()}`
    });
  }
  return monthsArr;
}

const reports = [
  {
    type: "stock-summary",
    label: "Stock Summary",
    desc: "View current stock levels by category, product, and site."
  },
  {
    type: "stock-movement",
    label: "Stock Movement",
    desc: "Track all inward and outward stock transactions."
  },
  {
    type: "site-consumption",
    label: "Site Consumption",
    desc: "Analyze stock usage for each site."
  },
  {
    type: "dispatch-history",
    label: "Dispatch History",
    desc: "Review all dispatches with dates, quantities, and destinations."
  },
  // {
  //   type: "request-status",
  //   label: "Request Status",
  //   desc: "Monitor pending, approved, and rejected stock requests."
  // }
];

const selectedReport = ref(reports[0].type);

const financialYears = [
  { label: "2023-24", start: "2023-04-01", end: "2024-03-31" },
  { label: "2024-25", start: "2024-04-01", end: "2025-03-31" }
];

const lastThreeMonths = getLastThreeMonths();

const categories = ["Steel", "Electrical", "Finishing", "Plumbing"];
const sites = ["Madipakkam", "Guindy", "Tambaram", "Velachery", "Manapakkam"];

const filters = ref({
  startDate: "",
  endDate: "",
  fy: "",
  month: "",
  category: "",
  site: "",
  site: "",
  requestStatus: ""
});

// When FY pill is clicked, set start/end dates automatically
function selectFY(fy) {
  filters.value.fy = fy.label;
  filters.value.startDate = fy.start;
  filters.value.endDate = fy.end;
  filters.value.month = "";
}

// When month pill is clicked, set start/end dates automatically
function selectMonth(month) {
  filters.value.month = month.label;
  filters.value.startDate = month.start;
  filters.value.endDate = month.end;
  filters.value.fy = "";
}
</script>