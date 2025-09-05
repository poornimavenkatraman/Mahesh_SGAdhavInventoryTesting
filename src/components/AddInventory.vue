<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center"
    :style="{ background: backdropStyle }"
  >
    <div class="w-full max-w-lg bg-white shadow-2xl rounded-xl p-8 relative">
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-base"
        title="Close"
      >
        <i class="fas fa-times"></i>
      </button>
      <div class="flex flex-col items-center mb-6">
        <div :class="[theme.iconBg, 'w-12 h-12 rounded-full flex items-center justify-center mb-2']">
          <i :class="['fas fa-box-open text-lg', theme.iconText]"></i>
        </div>
        <h2 :class="['text-2xl font-bold mb-1', theme.headingText]">
          Add New Inventory Material
        </h2>
        <span class="text-gray-500 text-xs">
          Enter details to add a new material to inventory
        </span>
      </div>
      <form @submit.prevent="addItem" class="grid grid-cols-1 gap-y-4">
        <!-- First line: Category & Subcategory -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label :class="['block font-medium mb-1', theme.headingText]">Category</label>
            <select
              v-model="form.CATEGORY"
              required
              :class="['cursor-pointer w-full p-2 rounded border focus:ring-2', theme.borderLight, theme.ring]"
            >
              <option disabled value="">Select Category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div>
            <label :class="['block font-medium mb-1', theme.headingText]">Subcategory</label>
            <select
              v-model="form.SUBCATEGORY"
              required
              :disabled="!form.CATEGORY"
              :class="['cursor-pointer w-full p-2 rounded border focus:ring-2', theme.borderLight, theme.ring]"
            >
              <option disabled value="">Select Subcategory</option>
              <option v-for="sub in filteredSubcategories" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Second line: Material & UOM -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label :class="['block font-medium mb-1', theme.headingText]">Material Name</label>
            <input
              v-model="form.MATERIAL_NAME"
              type="text"
              required
              :class="['w-full p-2 rounded border focus:ring-2', theme.borderLight, theme.ring]"
            />
          </div>
          <div>
            <label :class="['block font-medium mb-1', theme.headingText]">UOM</label>
            <select
              v-model="form.UOM"
              required
              :class="['cursor-pointer w-full p-2 rounded border focus:ring-2', theme.borderLight, theme.ring]"
            >
              <option disabled value="">Select UOM</option>
              <option v-for="uom in uoms" :key="uom" :value="uom">{{ uom }}</option>
            </select>
          </div>
        </div>

        <!-- Submit -->
        <div class="text-center mt-6">
          <button
            type="submit"
            class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow transition flex items-center justify-center mx-auto"
          >
            <i class="fas fa-plus mr-2"></i> Add Material
          </button>
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="mt-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-center text-sm font-medium"
        >
          {{ successMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";
import useThemeColors from "@/composables/useThemeColors";

const theme = useThemeColors();
const inventoryStore = useInventoryStore();

const props = defineProps({
  open: Boolean
});

const form = ref({
  MATERIAL_NAME: "",
  CATEGORY: "",
  SUBCATEGORY: "",
  UOM: ""
});

const successMessage = ref("");

const categories = computed(() =>
  inventoryStore.categories
    .map(c => ({ id: c.id, name: c.category }))
    .sort((a, b) => a.name.localeCompare(b.name))
);

const subcategories = computed(() =>
  inventoryStore.subcategories
    .map(sc => ({
      id: sc.id,
      name: sc.subcategory,
      category_id: sc.category_id
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
);

const filteredSubcategories = computed(() =>
  subcategories.value.filter(sc => sc.category_id === form.value.CATEGORY)
);

const uoms = ref(["Bags", "Kg", "Litre", "Metre", "Nos", "Pcs"].sort());

const backdropStyle = theme.modalBackdrop;

onMounted(async () => {
  await inventoryStore.fetchCategories();
  await inventoryStore.fetchSubcategories();
});

const addItem = async () => {
  try {
    if (typeof inventoryStore.addInventoryItem === "function") {
      await inventoryStore.addInventoryItem(form.value);
    } else {
      throw new Error("addInventoryItem action not implemented in inventoryStore");
    }

    successMessage.value = "✅ Inventory item added successfully.";
    form.value = { MATERIAL_NAME: "", CATEGORY: "", SUBCATEGORY: "", UOM: "" };
    setTimeout(() => (successMessage.value = ""), 4000);
  } catch (err: any) {
    successMessage.value = "❌ Error: " + err.message;
  }
};
</script>
