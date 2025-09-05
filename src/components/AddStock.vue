<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center"
    style="background: linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(255,255,255,0.7) 50%, rgba(13,148,136,0.25) 100%); backdrop-filter: blur(2px);">
    <div class="bg-white rounded-xl shadow-2xl px-8 py-4 max-w-lg relative overflow-y-auto max-h-[90vh]">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-base"
        title="Close">
        <i class="fas fa-times"></i>
      </button>
      <div class="flex flex-col items-center mb-6">
        <div class="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center mb-2">
          <i class="fas fa-boxes-stacked text-lg text-teal-600"></i>
        </div>
        <h2 class="text-xl font-bold text-teal-700 mb-1">Add Stock</h2>
        <span class="text-gray-500 text-xs">Enter details to add stock to inventory</span>
      </div>
      <form @submit.prevent="addStock" class="grid grid-cols-1 gap-y-4">
        <!-- Supplier (First Line) -->
        <div>
          <label class="block font-medium mb-1 text-teal-700">Supplier Name</label>
          <select v-model="form.SUPPLIER_NAME" required
            class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400">
            <option disabled value="">Select Supplier</option>
            <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.name">{{ supplier.name }}</option>
          </select>
        </div>
        <!-- Category & Subcategory (Second Line) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label class="block font-medium mb-1 text-teal-700">Category</label>
            <select v-model="form.CATEGORY" required
              class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400">
              <option disabled value="">Select Category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block font-medium mb-1 text-teal-700">Subcategory</label>
            <select v-model="form.SUBCATEGORY" required
              class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
              :disabled="!form.CATEGORY">
              <option disabled value="">Select Subcategory</option>
              <option v-for="sub in filteredSubcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
            </select>
          </div>
        </div>
        <!-- Material Name & Quantity (Next Line) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label class="block font-medium mb-1 text-teal-700">Material</label>
            <select v-model="form.MATERIAL" required
              class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
              :disabled="!form.SUBCATEGORY">
              <option disabled value="">Select Material</option>
              <option v-for="mat in filteredMaterials" :key="mat.id" :value="mat.id">{{ mat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block font-medium mb-1 text-teal-700">Quantity</label>
            <div class="flex items-center gap-2">
              <div class="relative w-full">
                <input v-model.number="form.QUANTITY" type="number" min="1"
                  class="w-full p-2 pr-12 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" required />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none">
                  {{ uom || 'PCS' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- Ordered Date & Received Date -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label class="block font-medium mb-1 text-teal-700">Ordered Date</label>
            <input v-model="form.ORDERED_DATE" type="date"
              class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" required />
          </div>
          <div>
            <label class="block font-medium mb-1 text-teal-700">Received Date</label>
            <input v-model="form.RECEIVED_DATE" type="date"
              class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" required />
          </div>
        </div>
        <!-- Description -->
        <div>
          <label class="block font-medium mb-1 text-teal-700">Description</label>
          <textarea v-model="form.DESCRIPTION" rows="2"
            class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"></textarea>
        </div>
        <div class="text-center mt-4">
          <button type="submit"
            class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded shadow transition flex items-center justify-center mx-auto">
            <i class="fas fa-plus mr-2"></i> Add Stock
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
import { ref, computed, watch, onMounted } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";

const inventoryStore = useInventoryStore();

const suppliers = computed(() => inventoryStore.suppliers.map(s => ({ id: s.id, name: s.suppliers_name })).sort((a, b) => a.name.localeCompare(b.name)));
const categories = computed(() => inventoryStore.categories.map(c => ({ id: c.id, name: c.category })).sort((a, b) => a.name.localeCompare(b.name)));
const subcategories = computed(() => inventoryStore.subcategories.map(sc => ({ id: sc.id, name: sc.subcategory, category_id: sc.category_id })).sort((a, b) => a.name.localeCompare(b.name)));
const materials = computed(() => inventoryStore.materials.map(m => ({ id: m.id, name: m.material, subcategory_id: m.subcategory_id, uom: m.uom })).sort((a, b) => a.name.localeCompare(b.name)));

const form = ref({
  SUPPLIER_NAME: "",
  CATEGORY: "",
  SUBCATEGORY: "",
  MATERIAL: "",
  QUANTITY: 1,
  ORDERED_DATE: "",
  RECEIVED_DATE: "",
  DESCRIPTION: ""
});

const successMessage = ref("");
const uom = ref("");

// Filter subcategories based on selected category
const filteredSubcategories = computed(() =>
  subcategories.value.filter(sc => sc.category_id === form.value.CATEGORY)
);

// Filter materials based on selected subcategory
const filteredMaterials = computed(() =>
  materials.value.filter(m => m.subcategory_id === form.value.SUBCATEGORY)
);

// Watch for material change to set UOM
watch(
  () => form.value.MATERIAL,
  (newMaterial) => {
    const mat = materials.value.find(m => m.id === newMaterial);
    uom.value = mat ? mat.uom : "";
  }
);

// Clear subcategory and material when category changes
watch(
  () => form.value.CATEGORY,
  () => {
    form.value.SUBCATEGORY = "";
    form.value.MATERIAL = "";
    uom.value = "";
  }
);

// Clear material when subcategory changes
watch(
  () => form.value.SUBCATEGORY,
  () => {
    form.value.MATERIAL = "";
    uom.value = "";
  }
);

// Fetch suppliers, categories, subcategories, materials from Firestore
onMounted(async () => {
  await inventoryStore.fetchSuppliers();
  await inventoryStore.fetchCategories();
  await inventoryStore.fetchSubcategories();
  await inventoryStore.fetchMaterials();
});

const addStock = async () => {
  try {
    // Replace Firestore addDoc with store action (define this in inventoryStore if missing)
    if (typeof inventoryStore.addStock === 'function') {
      await inventoryStore.addStock({
        ...form.value,
        UOM: uom.value
      });
    } else {
      // fallback: show error
      throw new Error('addStock action not implemented in inventoryStore');
    }
    successMessage.value = "✅ Stock added successfully.";
    form.value.SUPPLIER_NAME = "";
    form.value.CATEGORY = "";
    form.value.SUBCATEGORY = "";
    form.value.MATERIAL = "";
    form.value.QUANTITY = 1;
    form.value.ORDERED_DATE = "";
    form.value.RECEIVED_DATE = "";
    form.value.DESCRIPTION = "";
    uom.value = "";
    setTimeout(() => (successMessage.value = ""), 4000);
    // Optionally emit event to parent to refresh inventory
    // $emit('stock-added')
  } catch (err: any) {
    successMessage.value = "❌ Error: " + err.message;
  }
};
</script>