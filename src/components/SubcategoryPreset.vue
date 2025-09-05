<template>
  <Dialog :visible="open" modal :style="{ width: '32rem', borderRadius: '1rem' }" @click="$emit('close')">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="bg-teal-100 rounded-full p-3 flex items-center justify-center">
          <i class="fas fa-layer-group text-2xl text-teal-600"></i>
        </div>
        <div>
          <div class="text-lg font-bold text-teal-700">{{ props.subcategoryName || 'Subcategory' }}</div>
          <div class="text-sm text-gray-500">Category: <span class="font-semibold text-teal-600">{{ props.categoryName || '-' }}</span></div>
        </div>
      </div>
    </template>
    <div v-if="subcategoryName">
      <div class="mb-4 mt-2">
        <span class="font-bold text-teal-700">Materials</span>
      </div>
      <ul class="mt-2 rounded-lg overflow-hidden border border-teal-100 bg-white shadow">
        <li v-for="mat in filteredMaterials" :key="mat.id" class="py-2 px-4 border-b last:border-b-0 flex justify-between items-center hover:bg-teal-50 transition">
          <span class="text-[13px]  text-gray-700">{{ mat.name }}</span>
          <span class="text-xs text-gray-400">{{ mat.uom ? mat.uom : '' }}</span>
        </li>
        <li v-if="!filteredMaterials || filteredMaterials.length === 0" class="text-gray-400 py-4 text-center">No materials found.</li>
      </ul>
    </div>
    <div v-else class="flex flex-col items-center justify-center py-8">
      <i class="fas fa-spinner fa-spin text-2xl text-teal-400 mb-2"></i>
      <span class="text-gray-400">Loading...</span>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

const props = defineProps<{ subcategoryId?: string, open: boolean, materials: any[], categoryName?: string, subcategoryName?: string }>();

const filteredMaterials = computed(() => {
  if (!props.subcategoryId || !props.materials) return [];
  return props.materials
    .filter(m => m.subcategory_id === props.subcategoryId)
    .map(m => ({ id: m.id, name: m.material, uom: m.uom }))
    .sort((a, b) => a.name.localeCompare(b.name));
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
