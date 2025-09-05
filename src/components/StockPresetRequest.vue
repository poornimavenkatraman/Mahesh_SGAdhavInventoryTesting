<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center" style="background: linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(255,255,255,0.7) 50%, rgba(13,148,136,0.25) 100%); backdrop-filter: blur(2px);" >
    <div class="w-full max-w-lg bg-white rounded-xl shadow-lg relative p-6">
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-base"
        aria-label="Close"
      >
        <i class="fas fa-times"></i>
      </button>
      <!-- <h2 class="text-lg font-bold text-teal-700 mb-4 flex items-center gap-2">
        <i class="fas fa-layer-group text-teal-500"></i>
        Order Bulk Stock from HO (Presets)
      </h2> -->
      <div
        class="relative w-full flex flex-col items-center justify-center py-4 px-2 rounded-t-xl"
      >
      <div
          class="bg-teal-200 rounded-full p-3 flex items-center justify-center shadow mb-2 mx-auto"
        >
          <i class="fas fa-layer-group text-lg text-teal-600"></i>
        </div>
        <div class="w-full text-center">
          <div class="text-xl font-bold text-teal-700">{{ actionType }} Bulk Stock from HO</div>
          <div class="text-xs text-gray-500">Select presets to prepare your request form</div>
        </div>
      </div>
      <div class="mb-6">
        <label class="block text-xs font-semibold text-teal-700 mb-2">Select Site</label>
        <Dropdown
          v-model="selectedSite"
          :options="siteOptions"
          optionLabel="label"
          optionValue="value"
          :disabled="!!props.siteId"
          :placeholder="props.siteId ? siteOptions.find(s => s.value === props.siteId)?.label : 'Select site...'"
          class="w-full bg-white border border-teal-300 rounded-lg shadow focus:ring-2 focus:ring-teal-400"
        />
      </div>
      <div class="mb-6 mt-4">
        <label class="block text-xs font-semibold text-teal-700 mb-2"
          >Select Categories & Subcategories (Presets)</label
        >
        <MultiSelect
          v-model="selectedOptions"
          :options="categorySubcategoryOptions"
          optionLabel="label"
          optionValue="value"
          optionGroupLabel="label"
          optionGroupChildren="items"
          
          placeholder="Search and select..."
          class="w-full bg-white border border-teal-300 rounded-lg shadow focus:ring-2 focus:ring-teal-400"
        />
      </div>
        <button @click="proceedToNextStep" :disabled="!selectedOptions.length" class="w-20 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded shadow transition text-xs font-semibold mx-auto block">
          Next
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { useSiteStore } from "@/stores/siteStore";
const siteStore = useSiteStore();
const selectedSite = ref("");
const siteOptions = ref<any[]>([]);
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import MultiSelect from "primevue/multiselect";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

const props = defineProps<{ siteId?: string, actionType?: string, root_page: string }>();
const emit = defineEmits(["close"]);
const router = useRouter();
const route = useRoute();

const selectedOptions = ref<any[]>([]);
const categorySubcategoryOptions = ref<any[]>([]);

onMounted(async () => {
  // If siteId prop is present, preselect and disable
  if (props.siteId) {
    selectedSite.value = props.siteId;
  }
  // Fetch accessible sites
  await siteStore.fetchAccessibleSites();
  siteOptions.value = (siteStore.accessibleSites || []).map((site: any) => ({
    label: site.site || site.id,
    value: site.id
  }));
  // If siteId prop is present, preselect and disable
  if (props.siteId) {
    selectedSite.value = props.siteId;
  }
  const categoriesSnap = await getDocs(collection(db, "categories"));
  const categories = categoriesSnap.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const subcategoriesSnap = await getDocs(collection(db, "subcategories"));
  const subcategories = subcategoriesSnap.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const sortedCategories = categories.slice().sort((a: any, b: any) => (a.category || '').localeCompare(b.category || ''));
  const sortedSubcategories = subcategories.slice().sort((a: any, b: any) => (a.subcategory || '').localeCompare(b.subcategory || ''));

  categorySubcategoryOptions.value = sortedCategories
    .map((cat: any) => ({
      label: cat.category || cat.id,
      items: sortedSubcategories
        .filter((sub: any) => sub.category_id === cat.id)
        .map((sub: any) => ({ label: sub.subcategory || sub.id, value: sub.id })),
    }))
    .filter((group: any) => group.items.length > 0);
});

function proceedToNextStep() {
  emit("close");
  // Route to OrderBulk page, passing selected subcategories and siteId
  router.push({
    name: 'OrderBulk',
    query: {
      siteId: selectedSite.value,
      actionType: props.actionType || "",
      subcategories: selectedOptions.value.join(','),
      root_page: props.root_page || "Home",
    }
  });
}
</script>

<style scoped>
::v-global(.p-select-label) {
  font-size: 0.8rem !important;
  /* Example: adjust as needed */
}

::v-global(.p-select-option) {
  font-size: 0.7rem !important;
  /* Example: adjust as needed */
}

::v-global(.p-multiselect-option) {
  font-size: 0.7rem !important;
  /* Example: adjust as needed */
}

::v-global(.p-multiselect-option-group) {
  font-size: 0.8rem !important;
  /* Example: adjust as needed */
}
</style>
