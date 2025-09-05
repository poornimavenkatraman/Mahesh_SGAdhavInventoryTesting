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
      <h3 class="text-red-700 font-bold text-lg mb-4 flex items-center">
        <i class="fas fa-layer-group mr-2"></i>Add Subcategory
      </h3>
      <label class="block text-xs font-semibold mb-2"
        >Select Subcategories</label
      >
      <MultiSelect
        v-model="selected"
        :options="groupedSubcategories"
        optionLabel="subcategory"
        optionGroupLabel="category"
        optionGroupChildren="items"
        placeholder="Select Subcategories"
        class="w-full text-xs"
        display="chip"
        :optionDisabled="isSubcategoryDisabled"
      >
        <template #chip="{ value, removeCallback }">
          <span
            class="p-1 px-2 rounded-full bg-red-100 text-red-800 text-xs font-semibold mr-1 flex items-center"
          >
            {{ value.subcategory }}
            <button
              v-if="!isSubcategoryInitiallySelected(value)"
              @click.prevent="removeCallback"
              class="ml-1 text-red-600 hover:text-red-500"
              style="font-size: 12px"
              title="Remove"
              type="button"
            >
              <i class="fas fa-times"></i>
            </button>
            <span
              v-else
              class="ml-1 text-gray-400"
              title="Cannot remove initial selection"
            >
              <i class="fas fa-lock"></i>
            </span>
          </span>
        </template>
      </MultiSelect>
      <div class="mt-4 flex justify-end">
        <button
          @click="addSubcategories"
          class="bg-red-600 text-white px-4 py-1 rounded shadow text-xs font-semibold hover:bg-red-700"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, onMounted, watch } from "vue";
import MultiSelect from "primevue/multiselect";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

// Helper to check if a subcategory was initially selected from props
function isSubcategoryInitiallySelected(option: { id: string }) {
  return props.selected && props.selected.includes(option.id);
}

const props = defineProps<{ show: boolean; selected: string[] }>();
const emit = defineEmits(["close", "add", "update:selected"]);

const selected = ref<any[]>([]);
const categories = ref<any[]>([]);
const subcategories = ref<any[]>([]);

onMounted(async () => {
  const catSnap = await getDocs(collection(db, "categories"));
  categories.value = catSnap.docs.map((doc) => ({
    id: doc.id,
    category: doc.data().category,
  }));
  const subcatSnap = await getDocs(collection(db, "subcategories"));
  subcategories.value = subcatSnap.docs.map((doc) => ({
    id: doc.id,
    subcategory: doc.data().subcategory,
    category_id: doc.data().category_id,
  }));
  // Set initial selection after options are loaded
  if (props.selected && props.selected.length) {
    // Always preselect subcategories from parent, using references from groupedSubcategories
    const selectedObjs: any[] = [];
    groupedSubcategories.value.forEach((group) => {
      group.items.forEach((sub) => {
        if (props.selected.includes(sub.id)) {
          selectedObjs.push(sub);
        }
      });
    });
    selected.value = selectedObjs;
  } else {
    selected.value = [];
  }
});

// Watch for changes in props.selected and update selected value accordingly
watch(
  () => props.selected,
  (newSelected) => {
    if (newSelected && newSelected.length) {
      const selectedObjs: any[] = [];
      groupedSubcategories.value.forEach((group) => {
        group.items.forEach((sub) => {
          if (newSelected.includes(sub.id)) {
            selectedObjs.push(sub);
          }
        });
      });
      selected.value = selectedObjs;
    } else {
      selected.value = [];
    }
  }
);

const sortedCategories = computed(() =>
  categories.value.slice().sort((a, b) => a.category.localeCompare(b.category))
);
const sortedSubcategories = computed(() =>
  subcategories.value
    .slice()
    .sort((a, b) => a.subcategory.localeCompare(b.subcategory))
);

const groupedSubcategories = computed(() => {
  return sortedCategories.value.map((cat) => ({
    category: cat.category,
    items: sortedSubcategories.value.filter(
      (sub) => sub.category_id === cat.id
    ),
  }));
});


function addSubcategories() {
  // Always include disabled subcategories in selected
  const mustHave = props.selected || [];
  const allSelectedIds = Array.from(new Set([
    ...selected.value.map((sub) => sub.id),
    ...mustHave,
  ]));
  const newSelectedIds = allSelectedIds.filter((id) => !mustHave.includes(id));
  emit("add", newSelectedIds);
  // Reset selected to only the original selection, using correct object references
  const selectedObjs: any[] = [];
  groupedSubcategories.value.forEach((group) => {
    group.items.forEach((sub) => {
      if (mustHave.includes(sub.id)) {
        selectedObjs.push(sub);
      }
    });
  });
  selected.value = selectedObjs;
  emit("close");
}

// Prevent removing disabled options from selected
watch(selected, (newVal: any[], oldVal: any[]) => {
  const mustHave = props.selected || [];
  // If any disabled subcategory is missing, add it back
  const missing = mustHave.filter((id: string) => !newVal.map((sub) => sub.id).includes(id));
  if (missing.length > 0) {
    // Add missing disabled subcategories back
    groupedSubcategories.value.forEach((group) => {
      group.items.forEach((sub) => {
        if (missing.includes(sub.id)) {
          newVal.push(sub);
        }
      });
    });
    selected.value = Array.from(new Set(newVal));
  }
});

// Disable already selected subcategories
function isSubcategoryDisabled(option: any) {
  // If option is a group, never disable
  if (option.items) return false;
  // If option is in props.selected, disable
  return props.selected && props.selected.includes(option.id);
}
</script>
