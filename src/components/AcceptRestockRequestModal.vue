<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(15,163,146,0.12); backdrop-filter: blur(3px);">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[92vh] border border-teal-100">
      <div class="flex items-center justify-between p-6 border-b border-teal-50">
        <div class="flex items-center gap-3">
          <div class="bg-teal-100 rounded-full p-3">
            <i class="fas fa-dolly text-teal-700 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-teal-700">Check-In Stock from Supplier</h3>
            <p class="text-xs text-gray-500">Review and confirm the supplier's stock to check-in</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-teal-600" aria-label="Close modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="mx-6 p-2 rounded bg-teal-500 text-white flex gap-8 items-center">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold">Request ID:</span>
          <span class="font-semibold">{{ requestId }}</span>
        </div>
        </div>
      <div class="px-8 py-4 space-y-4">
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500">Supplier</div>
            <div class="font-semibold text-teal-700">{{ supplierName }}</div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-2">
          <div>
            <div class="text-xs text-gray-500">Requested Date</div>
            <div class="font-semibold text-teal-700">{{ requestDate }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Expected Date</div>
            <div class="font-semibold text-teal-700">{{ requestDate }}</div>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Description</label>
          <div class="text-xs text-gray-700 mb-3">{{ description }}</div>
        </div>
        <div class="bg-teal-50 rounded-xl p-4 border border-teal-100">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500">Category</div>
              <div class="font-semibold text-teal-700">{{ material.category }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Subcategory</div>
              <div class="font-semibold text-teal-700">{{ material.subcategory }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Material</div>
              <div class="font-semibold text-teal-700">{{ material.name }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Quantity</div>
              <div class="flex items-center gap-2 mt-1">
                <input type="number" v-model.number="material.quantity" min="1" class="w-28 px-2 py-1 border border-teal-200 rounded text-right font-semibold text-teal-700" />
                <div class="text-teal-700 font-semibold">{{ material.uom }}</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Check-In Comments</label>
          <textarea v-model="acceptanceNotes" rows="3" class="w-full border border-teal-200 rounded px-3 py-2 text-xs" placeholder="Enter check-in comments..."></textarea>
        </div>
        <div class="flex justify-end">
          <button @click="acceptRequest" class="bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-teal-800">Check-In Stock</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits(['accept', 'close']);

// Dummy data for demo
const supplierName = ref('ABC Suppliers');
const requestId = ref('REQ-20250819-001');
const requestDate = ref('2025-08-19');
const description = ref('Please supply as per request.');
const material = ref({
  name: 'Cement',
  quantity: 100,
  uom: 'Bags',
  category: 'Building Materials',
  subcategory: 'Cement & Concrete'
});
const acceptanceNotes = ref('');

function acceptRequest() {
  emit('accept', {
    supplierName: supplierName.value,
    requestId: requestId.value,
    requestDate: requestDate.value,
    material: material.value,
    description: description.value,
    acceptanceNotes: acceptanceNotes.value
  });
}
function closeModal() {
  emit('close');
}
</script>

<style scoped>
.overlay {
  background: rgba(0,0,0,0.3);
}
</style>