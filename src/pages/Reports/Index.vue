<template>
  <div class="p-4 max-w-5xl space-y-6 min-h-screen">
    <div class="flex items-center gap-3">
        <div class="bg-teal-200 rounded-full p-2">
          <i class="fas fa-chart-bar text-xl text-teal-700"></i>
        </div>
        <h2 class="text-lg font-bold text-teal-700">Reports</h2>
      </div>
    
    <!-- <div class="flex items-center gap-3 mb-6">
      <div class="bg-teal-100 rounded-full p-3 flex items-center justify-center">
        <i class="fas fa-chart-bar text-2xl text-teal-700"></i>
      </div>
      <h1 class="text-3xl font-bold text-teal-700 tracking-tight">Reports Dashboard</h1>
    </div> -->

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Inventory & Stock -->
      <section class="rounded-2xl border border-teal-100 shadow-lg overflow-hidden bg-white">
        <div class="px-4 py-3 bg-teal-50 font-semibold flex items-center gap-2 text-teal-900 text-sm">
          <i class="fas fa-cubes text-teal-500 text-xl"></i>
          Inventory & Stock
        </div>
        <div class="p-3 space-y-2">
          <router-link
            v-for="it in inventoryItems"
            :key="it.key"
            :to="reportRoute(it.key)"
            class="w-full px-4 py-3 rounded-xl border border-teal-100 bg-white hover:bg-teal-50 text-left shadow-sm transition flex items-center gap-3"
          >
            <i class="fas fa-box-open text-teal-400 text-lg"></i>
            <div>
              <div class="font-semibold text-teal-700">{{ it.title }}</div>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Suppliers -->
      <section class="rounded-2xl border border-teal-100 shadow-lg overflow-hidden bg-white">
        <div class="px-4 py-3 bg-teal-50 font-semibold flex items-center gap-2 text-teal-900 text-sm">
          <i class="fas fa-truck text-teal-500 text-xl"></i>
          Suppliers
        </div>
        <div class="p-3 space-y-2">
          <router-link
            v-for="it in supplierItems"
            :key="it.key"
            :to="reportRoute(it.key)"
            class="w-full px-4 py-3 rounded-xl border border-teal-100 bg-white hover:bg-teal-50 text-left shadow-sm transition flex items-center gap-3"
          >
            <i class="fas fa-user-tie text-teal-400 text-lg"></i>
            <div>
              <div class="font-semibold text-teal-700">{{ it.title }}</div>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Insights -->
      <section class="rounded-2xl border border-teal-100 shadow-lg overflow-hidden bg-white">
        <div class="px-4 py-3 bg-teal-50 font-semibold flex items-center gap-2 text-teal-900 text-sm">
          <i class="fas fa-lightbulb text-teal-500 text-xl "></i>
          Insights
        </div>
        <div class="p-3 space-y-2">
          <router-link
            v-for="it in insightItems"
            :key="it.key"
            :to="reportRoute(it.key)"
            class="w-full px-4 py-3 rounded-xl border border-teal-100 bg-white hover:bg-teal-50 text-left shadow-sm transition flex items-center gap-3"
          >
            <i class="fas fa-chart-pie text-teal-400 text-lg"></i>
            <div>
              <div class="font-semibold text-teal-700">{{ it.title }}</div>
            </div>
          </router-link>
        </div>
      </section>
    </div>

  <!-- Active report removed: now routed to dedicated pages -->
  </div>

  <!-- Back to top for all reports -->
  <ScrollToTop />

</template>

<script setup lang="ts">
import ScrollToTop from "@/components/ScrollToTop.vue";
import { useRouter } from "vue-router";

const inventoryItems = [
  { key: "stockSummaryByMaterial", title: "Stock Summary by Material" },
  { key: "agingStock", title: "Aging / Dead Stock" },
  { key: "siteStockAvailability", title: "Site-Wise Stock Availability" },
  { key: "hoStockAvailability", title: "Availability at HO" },
];

const supplierItems = [
  { key: "pendingSupplierRequests", title: "Pending Supplier Requests" },
];

const insightItems = [
  { key: "riskDashboard", title: "Risk Dashboard" },
];

function reportRoute(key: string) {
  switch (key) {
    case "stockSummaryByMaterial": return "/reports/stock-summary";
    case "agingStock": return "/reports/aging-stock";
    case "siteStockAvailability": return "/reports/site-stock-availability";
    case "hoStockAvailability": return "/reports/ho-stock-availability";
    case "pendingSupplierRequests": return "/reports/pending-supplier-requests";
    case "riskDashboard": return "/reports/risk-dashboard";
    default: return "/reports";
  }
}
</script>