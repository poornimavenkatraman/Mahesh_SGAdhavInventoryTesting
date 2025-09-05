<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div class="flex items-center mb-4">
        <span class="bg-teal-100 text-teal-700 rounded-full p-2 mr-2">
          <i class="fas fa-layer-group"></i>
        </span>
        <h2 class="text-lg font-bold text-teal-700">Edit Subcategory Name</h2>
        <button class="ml-auto text-gray-400 hover:text-teal-700" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="submit">
        <div class="mb-4">
          <label class="block text-xs font-semibold text-teal-700 mb-1">Subcategory Name</label>
          <input v-model="name" type="text" class="w-full border border-teal-200 rounded px-3 py-2 text-xs" required />
        </div>
        <div v-if="errorMsg" class="mb-2 text-xs text-red-600">{{ errorMsg }}</div>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" class="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200" @click="$emit('close')">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700">
            Update Subcategory
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  open: Boolean,
  subcategory: Object
});
const emit = defineEmits(['close', 'submit']);
const name = ref('');
const errorMsg = ref("");

watch(() => props.open, (val) => {
  if (val && props.subcategory) {
    name.value = props.subcategory.subcategory;
    errorMsg.value = "";
  }
});

function submit() {
  if (!name.value.trim()) {
    errorMsg.value = "Subcategory name cannot be empty.";
    return;
  }
  emit('submit', name.value, (err) => {
    if (err) {
      errorMsg.value = err;
    }
  });
}
</script>
