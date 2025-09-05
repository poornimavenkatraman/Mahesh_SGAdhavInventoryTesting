<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center"
    style="background: linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(255,255,255,0.7) 50%, rgba(13,148,136,0.25) 100%); backdrop-filter: blur(2px);">
    <div class="w-full max-w-lg bg-white shadow-2xl rounded-xl p-8 relative">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-base"
        title="Close">
        <i class="fas fa-times"></i>
      </button>
      <div class="flex flex-col items-center mb-6">
        <div class="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center mb-2">
          <i class="fas fa-box-open text-lg text-teal-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-teal-700 mb-1">Add New Inventory Material</h2>
        <span class="text-gray-500 text-xs">Enter details to add a new material to inventory</span>
      </div>
      <form @submit.prevent="addItem" class="grid grid-cols-1 gap-y-4">
        <!-- First line: Category & Subcategory -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label class="block font-medium mb-1 text-teal-700">Category</label>
            <select v-model="form.CATEGORY" required
              class="cursor-pointer w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400">
              <option disabled value="">Select Category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block font-medium mb-1 text-teal-700">Subcategory</label>
            <select v-model="form.SUBCATEGORY" required
              class="cursor-pointer w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
              :disabled="!form.CATEGORY">
              <option disabled value="">Select Subcategory</option>
              <option v-for="sub in filteredSubcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
            </select>
          </div>
        </div>
        <!-- Second line: Material & UOM -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label class="block font-medium mb-1 text-teal-700">Material Name</label>
            <input v-model="form.MATERIAL_NAME" type="text"
              class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" required />
          </div>
          <div>
            <label class="block font-medium mb-1 text-teal-700">UOM</label>
            <select v-model="form.UOM" required
              class="cursor-pointer w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400">
              <option disabled value="">Select UOM</option>
              <option v-for="uom in uoms" :key="uom" :value="uom">{{ uom }}</option>
            </select>
          </div>
        </div>
        <div class="text-center mt-6">
          <button type="submit"
            class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded shadow transition flex items-center justify-center mx-auto">
            <i class="fas fa-plus mr-2"></i> Add Material
          </button>
        </div>
        <div v-if="successMessage"
          class="mt-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-center text-sm font-medium">
          {{ successMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";

const inventoryStore = useInventoryStore();

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

const form = ref({
  MATERIAL_NAME: "",
  CATEGORY: "",
  SUBCATEGORY: "",
  UOM: ""
});

const successMessage = ref("");

const categories = computed(() => inventoryStore.categories.map(c => ({ id: c.id, name: c.category })).sort((a, b) => a.name.localeCompare(b.name)));
const subcategories = computed(() => inventoryStore.subcategories.map(sc => ({ id: sc.id, name: sc.subcategory, category_id: sc.category_id })).sort((a, b) => a.name.localeCompare(b.name)));
const uoms = ref(["Bags","Kg", "Litre", "Metre", "Nos", "Pcs"].sort((a, b) => a.localeCompare(b)));

const filteredSubcategories = computed(() =>
  subcategories.value.filter(sc => sc.category_id === form.value.CATEGORY)
);

onMounted(async () => {
  await inventoryStore.fetchCategories();
  await inventoryStore.fetchSubcategories();
});

const addItem = async () => {
  try {
    // Replace Firestore addDoc with store action (define this in inventoryStore if missing)
    if (typeof inventoryStore.addInventoryItem === 'function') {
      await inventoryStore.addInventoryItem(form.value);
    } else {
      // fallback: show error
      throw new Error('addInventoryItem action not implemented in inventoryStore');
    }
    successMessage.value = "✅ Inventory item added successfully.";
    form.value.MATERIAL_NAME = "";
    form.value.CATEGORY = "";
    form.value.SUBCATEGORY = "";
    form.value.UOM = "";
    setTimeout(() => (successMessage.value = ""), 4000);
    // Optionally emit event to parent to refresh inventory
    // $emit('inventory-added')
  } catch (err: any) {
    successMessage.value = "❌ Error: " + err.message;
  }
};
</script>