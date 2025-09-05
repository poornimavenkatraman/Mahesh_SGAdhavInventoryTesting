<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
    <div class="bg-white rounded shadow-2xl p-8 w-full max-w-md relative border border-red-100">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-xl transition" title="Close">
        <i class="fas fa-times"></i>
      </button>
      <div class="flex items-center gap-3 mb-6">
        <div class="bg-red-100 rounded-full p-3 flex items-center justify-center">
          <i class="fas fa-truck text-lg text-red-700"></i>
        </div>
        <h2 class="text-lg font-bold text-red-700">Add Supplier</h2>
      </div>
      <form @submit.prevent="submitSupplier" class="space-y-5">
        <div>
          <label class="block font-semibold text-red-700 mb-1">Supplier Name <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" required class="w-full border border-red-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-400 text-xs" />
        </div>
        <div>
          <label class="block font-semibold text-red-700 mb-1">Contact <span class="text-red-500">*</span></label>
          <input v-model="form.contact" type="text" required class="w-full border border-red-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 text-xs" />
        </div>
        <!-- <div>
          <label class="block font-semibold text-red-700 mb-1">Email <span class="text-red-500">*</span></label>
          <input v-model="form.email" type="email" class="w-full border border-red-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 font-semibold text-base shadow-sm" />
        </div> -->
        <div>
          <label class="block font-semibold text-red-700 mb-1">Address</label>
          <textarea v-model="form.address" rows="2" class="w-full border border-red-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 text-xs"></textarea>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Cancel</button>
          <button type="submit" class="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow hover:from-red-600 hover:to-red-800 transition">Add Supplier</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useInventoryStore } from '@/stores/inventoryStore';
import { useMessageStore } from '@/stores/messageStore';
import { ref } from 'vue';

const inventoryStore = useInventoryStore();
const messageStore = useMessageStore();
const emit = defineEmits(['close']);
const form = ref({
  name: '',
  contact: '',
  // email: '',
  address: ''
});
async function submitSupplier() {
  if (!form.value.name || !form.value.contact) {
    alert('Please fill all mandatory fields.');
    return;
  }

  const response = await inventoryStore.addSupplier(form.value);
  if (response && response.message) {
    messageStore.showMessage(response.message, "success");
  }
  emit('close');
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
