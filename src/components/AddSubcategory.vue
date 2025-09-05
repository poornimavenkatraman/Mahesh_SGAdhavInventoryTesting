<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div class="flex items-center mb-4">
        <span class="bg-red-100 text-red-700 rounded-full p-2 mr-2">
          <i class="fas fa-layer-group"></i>
        </span>
        <h2 class="text-lg font-bold text-red-700">Add New Subcategory</h2>
        <button class="ml-auto text-gray-400 hover:text-red-700" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="submit">
        <div class="mb-4">
          <label class="block text-xs font-semibold text-red-700 mb-1">Category</label>
          <select v-model="selectedCategory" class="w-full border border-red-200 rounded px-3 py-2 text-xs" required>
            <option value="" disabled>Select Category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-semibold text-red-700 mb-1">Subcategory Name</label>
          <input v-model="subcategoryName" type="text" class="w-full border border-red-200 rounded px-3 py-2 text-xs" required />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" class="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200" @click="close">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700">
            Add Subcategory
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";

const inventoryStore = useInventoryStore();

const props = defineProps({
  open: { type: Boolean, default: false }
});
const emits = defineEmits(["close", "added"]);

const categories = computed(() => 
  inventoryStore.categories
    .map(c => ({ id: c.id, name: c.category }))
    .sort((a, b) => a.name.localeCompare(b.name))
);
const selectedCategory = ref("");
const subcategoryName = ref("");

function close() {
  emits("close");
  selectedCategory.value = "";
  subcategoryName.value = "";
}

async function submit() {
  if (!selectedCategory.value || !subcategoryName.value.trim()) return;
  try {
    await inventoryStore.addSubcategory(
      subcategoryName.value.trim(),
      selectedCategory.value
    );
    emits("added");
    close();
  } catch (err) {
    // Optionally show error message
    alert(err.message || "Failed to add subcategory.");
  }
}

onMounted(async () => {
  await inventoryStore.fetchCategories();
});
</script>