<script setup lang="ts">
import { ref, onMounted } from "vue";
import InventoryTable from "@/components/InventoryTable.vue";
import AddStock from "@/components/AddStock.vue"; // Import AddStock modal
import AddBulkStock from "@/pages/AddBulkStock.vue";

const materials = ref<any[]>([]);
const loading = ref(true);
const showAddStock = ref(false); // Add state for AddStock modal
const showBulkStock = ref(false); // Add state for Bulk Stock modal

</script>

<template>
  <div class="flex flex-col px-4 py-4">
    <div class="w-full bg-white shadow-sm rounded-xl">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="bg-teal-200 rounded-full p-2">
            <i class="fas fa-box-open text-xl text-teal-700"></i>
          </div>
          <h2 class="text-lg font-bold text-teal-700">Inventory</h2>
        </div>
        <div class="flex items-center gap-3">

          <!-- Add Stock Icon Button -->
          <!-- <button class="bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition"
            title="Add Stock" @click="showAddStock = true">
            <i class="fas fa-boxes-stacked"></i>
          </button> -->

          <!-- Add Bulk Stock Icon Button (redirects to page) -->
          <!-- <router-link to="/inventory/add-bulk-stock?actionType=Add"
            class="bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full p-3 shadow transition flex items-center justify-center"
            title="Bulk Add Stock">
            <i class="fas fa-cubes-stacked"></i>
          </router-link> -->

        </div>
      </div>

      <div class="overflow-x-auto">
  <InventoryTable />
      </div>

    </div>

    <!-- AddStock Modal -->
    <div v-if="showAddStock" class="fixed inset-0 z-50 flex items-center justify-center"
      style="background: linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(255,255,255,0.7) 50%, rgba(13,148,136,0.25) 100%); backdrop-filter: blur(2px);">
      <AddStock @close="showAddStock = false" />
    </div>

    <!-- AddBulkStock Modal (implement AddBulkStock.vue as needed) -->
    <div v-if="showBulkStock" class="fixed inset-0 z-50 flex items-center justify-center"
      style="background: linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(255,255,255,0.7) 50%, rgba(13,148,136,0.25) 100%); backdrop-filter: blur(2px);">
      <AddBulkStock @close="showBulkStock = false" />
    </div>
  </div>
</template>