<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
  >
    <div
      class="bg-white rounded-xl shadow-2xl p-6 min-w-[350px] max-w-md relative"
    >
      <button
        @click="$emit('close')"
        class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
      >
        <i class="fas fa-times"></i>
      </button>
      <h3 class="text-teal-700 font-bold text-lg mb-4 flex items-center">
        <i class="fas fa-cube mr-2"></i>Add Material
      </h3>
      <label class="block text-xs font-semibold mb-2"
        >Select Subcategories</label
      >
      <MultiSelect
        v-model="selectedSubcategories"
        :options="
          sortedCategories.map((cat) => ({
            label: cat.category,
            items: sortedSubcategories.filter((s) => s.category_id === cat.id),
          }))
        "
        optionLabel="subcategory"
        optionGroupLabel="label"
        optionGroupChildren="items"
        optionValue="id"
        placeholder="Select Subcategories"
        class="w-full text-xs mb-3"
        display="chip"
      />
      <label class="block text-xs font-semibold mb-2">Select Materials</label>
      <MultiSelect
        v-model="selectedMaterials"
        :options="
          sortedMaterials
            .filter((m) => selectedSubcategories.includes(m.subcategory_id))
            .slice()
            .sort((a, b) => {
              const aDisabled = disabledMaterials.includes(a.id);
              const bDisabled = disabledMaterials.includes(b.id);
              if (aDisabled !== bDisabled) {
                return aDisabled ? 1 : -1; // non-disabled first
              }
              return a.material.localeCompare(b.material);
            })
        "
        optionLabel="material"
        optionValue="id"
        placeholder="Select Materials"
        class="w-full text-xs"
        display="chip"
        :optionDisabled="(option) => disabledMaterials.includes(option.id)"
      />
      <div class="mt-4 flex justify-end">
        <button
          @click="addMaterials"
          class="bg-teal-700 text-white px-4 py-1 rounded shadow text-xs font-semibold hover:bg-teal-800"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, onMounted } from "vue";
import MultiSelect from "primevue/multiselect";
const props = defineProps<{
  show: boolean;
  categories: any[];
  subcategories: any[];
  materials: any[];
  existingMaterials?: string[];
}>();
const emit = defineEmits(["close", "add"]);
const selectedSubcategories = ref<string[]>([]);
const selectedMaterials = ref<string[]>([]);

// Disable already existing materials
const disabledMaterials = computed(() =>
  Array.isArray(props.existingMaterials) ? props.existingMaterials : []
);

const sortedCategories = computed(() =>
  (props.categories || [])
    .slice()
    .sort((a, b) => a.category.localeCompare(b.category))
);
const sortedSubcategories = computed(() =>
  (props.subcategories || [])
    .slice()
    .sort((a, b) => a.subcategory.localeCompare(b.subcategory))
);
const sortedMaterials = computed(() =>
  (props.materials || [])
    .slice()
    .sort((a, b) => a.material.localeCompare(b.material))
);

function addMaterials() {
  emit("add", {
    subcategories: selectedSubcategories.value,
    materials: selectedMaterials.value,
  });
  selectedSubcategories.value = [];
  selectedMaterials.value = [];
  emit("close");
}

onMounted(() => {
  if (
    Array.isArray(props.existingMaterials) &&
    props.existingMaterials.length
  ) {
    selectedMaterials.value = props.existingMaterials.slice();
  }
});
</script>
