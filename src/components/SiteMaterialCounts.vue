<template>
  <div class="ml-5 p-4 overflow-x-auto">
    <div
      class="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-red-100 to-red-50 rounded-t-lg shadow"
    >
      <h2 class="text-base font-semibold text-red-700">Site Inventory</h2>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <span class="animate-spin text-3xl text-red-400 mb-2">
        <i class="fas fa-spinner"></i>
      </span>
      <span class="text-red-600 text-base font-semibold"
        >Loading site inventory...</span
      >
    </div>
    <div v-else>
      <div class="flex items-center gap-4 mb-4 w-full max-w-4xl">
        <div class="relative flex-1">
          <i
            class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-base"
          ></i>
          <InputText
            v-model="search"
            placeholder="Search Inventory..."
            class="p-inputtext-sm pl-9 text-[11px] w-full rounded border bg-white text-red-900 border-red-200 placeholder-red-400"
            style="
              padding-left: 2.75rem;
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
            "
          />
        </div>
        <MultiSelect
          v-model="selectedCategories"
          :options="categoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter Categories"
          class="w-44 text-xs"
          display="chip"
          showClear
        />
        <MultiSelect
          v-model="selectedSubcategories"
          :options="subcategoryOptions"
          optionLabel="label"
          optionValue="value"
          optionGroupLabel="label"
          optionGroupChildren="items"
          placeholder="Filter Subcategories"
          class="w-44 text-xs"
          :disabled="selectedCategories.length === 0"
          display="chip"
          showClear
        />
        <button
          @click="exportToExcel"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-colors"
        >
          <i class="fas fa-file-excel"></i>
          Export to Excel
        </button>
      </div>

      <DataTable
        :value="filteredMaterials"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        :sortField="sortField"
        :sortOrder="sortOrder"
        responsiveLayout="scroll"
        class="p-datatable-sm shadow rounded bg-white"
        style="border: none"
        tableStyle="border-collapse: separate; border-spacing: 0 8px;"
        headerStyle="white-space: nowrap; padding: 16px 12px; font-size: 1rem;"
        bodyStyle="padding: 12px;"
        sortMode="multiple"
        :multiSortMeta="initialSortMeta"
        removableSort
      >
        <Column
          field="category"
          header="Category"
          sortable
          style="min-width: 120px; padding-right: 24px"
        />
        <Column
          field="subcategory"
          header="Subcategory"
          sortable
          style="min-width: 120px; padding-right: 24px"
        />
        <Column
          field="material_name"
          header="Material"
          sortable
          style="min-width: 140px; padding-right: 24px"
        />
        <Column
          field="available_at_site"
          sortable
          style="min-width: 100px; padding-right: 24px"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <span>Available</span>
              <span class="header-circle-icon" title="Current status count"
                >C</span
              >
            </div>
          </template>
        </Column>
        <Column
          field="requested"
          sortable
          style="min-width: 100px; padding-right: 24px"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <span>Requested</span>
              <span class="header-circle-icon" title="Current status count"
                >C</span
              >
            </div>
          </template>
        </Column>
        <Column
          field="dispatched"
          sortable
          style="min-width: 100px; padding-right: 24px"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <span>Dispatched</span>
              <span class="header-circle-icon" title="Current status count"
                >C</span
              >
            </div>
          </template>
        </Column>
        <Column
          field="received"
          sortable
          style="min-width: 100px; padding-right: 24px"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <span>Received</span>
              <span class="header-circle-icon" title="Till date count">T</span>
            </div>
          </template>
        </Column>
        <Column
          field="consumed"
          sortable
          style="min-width: 100px; padding-right: 24px"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <span>Consumed</span>
              <span class="header-circle-icon" title="Till date count">T</span>
            </div>
          </template>
        </Column>
        <Column
          field="returned"
          sortable
          style="min-width: 100px; padding-right: 24px"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <span>Returned</span>
              <span class="header-circle-icon" title="Current status count"
                >C</span
              >
            </div>
          </template>
        </Column>
        <Column
          field="return_accepted"
          sortable
          style="min-width: 180px; padding-right: 24px; width: 220px"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <span>Return Accepted</span>
              <span class="header-circle-icon" title="Till date count">T</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import MultiSelect from "primevue/multiselect";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  documentId,
} from "firebase/firestore";
import * as XLSX from "xlsx";

const props = defineProps<{ siteId: string }>();
const materials = ref<any[]>([]);
const loading = ref(true);
const search = ref("");
const sortField = ref("material_name");
const sortOrder = ref(1);
const initialSortMeta = [
  { field: "category", order: 1 as 1 }, // Sort by category ascending
  { field: "subcategory", order: 1 as 1 }, // Then by subcategory ascending
  { field: "material_name", order: 1 as 1 }, // Then by material ascending
];

import { useSiteStore } from "@/stores/siteStore";
import { useInventoryStore } from "@/stores/inventoryStore";
const siteStore = useSiteStore();
const inventoryStore = useInventoryStore();

onMounted(async () => {
  await inventoryStore.fetchCategories();
  await inventoryStore.fetchSubcategories();
  await siteStore.fetchSiteMaterials(props.siteId);
  await fetchSiteMaterials(props.siteId);
});

watch(
  () => props.siteId,
  (id) => fetchSiteMaterials(id)
);

async function fetchSiteMaterials(siteId: string) {
  loading.value = true;

  // Collect all needed material IDs
  const matIds = siteStore.siteMaterials
    .map((m) => m.material_id)
    .filter(Boolean);

  // Batch fetch materials
  let matMap: Record<string, any> = {};
  let subcatIds: string[] = [];
  if (matIds.length > 0) {
    for (let i = 0; i < matIds.length; i += 30) {
      const batchIds = matIds.slice(i, i + 30);
      await inventoryStore.fetchMaterialsByIds(batchIds);
      inventoryStore.materialsByIds.forEach((doc: any) => {
        matMap[doc.id] = doc;
        if (doc.subcategory_id) subcatIds.push(doc.subcategory_id);
      });
    }
  }

  // Batch fetch subcategories
  let subcatMap: Record<string, any> = {};
  if (subcatIds.length > 0) {
    subcatIds = Array.from(new Set(subcatIds));
    for (let i = 0; i < subcatIds.length; i += 30) {
      const batchIds = subcatIds.slice(i, i + 30);
      await inventoryStore.fetchSubcategoriesByIds(batchIds);
      inventoryStore.subcategoriesByIds.forEach((doc: any) => {
        subcatMap[doc.id] = doc;
      });
    }
  }

  // Collect all needed category IDs from subcategories
  const categoryIds = Object.values(subcatMap)
    .map((d: any) => d.category_id)
    .filter((v, i, arr) => v && arr.indexOf(v) === i);

  // Batch fetch categories
  let catMap: Record<string, any> = {};
  if (categoryIds.length > 0) {
    for (let i = 0; i < categoryIds.length; i += 30) {
      const batchIds = categoryIds.slice(i, i + 30);
      await inventoryStore.fetchCategoriesByIds(batchIds);
      inventoryStore.categoriesByIds.forEach((doc: any) => {
        catMap[doc.id] = doc;
      });
    }
  }

  // Build material details
  materials.value = siteStore.siteMaterials.map((m: any) => {
    const matId = m["material_id"] ?? m["id"];
    const matData = matMap[matId] || {};
    let subcategoryName = "";
    let categoryName = "";
    let subcatId = matData.subcategory_id;
    if (subcatId && subcatMap[subcatId]) {
      subcategoryName = subcatMap[subcatId].subcategory || "";
      const catId = subcatMap[subcatId].category_id;
      if (catId && catMap[catId]) {
        categoryName = catMap[catId].category || "";
      }
    }
    return {
      material_id: matId,
      material_name: matData.material || matData.name || matId,
      category: categoryName,
      subcategory: subcategoryName,
      available_at_site: m["available_at_site"] ?? 0,
      requested: m["requested"] ?? 0,
      dispatched: m["dispatched"] ?? 0,
      received: m["received"] ?? 0,
      consumed: m["consumed"] ?? 0,
      returned: m["returned"] ?? 0,
      return_accepted: m["return_accepted"] ?? 0,
    };
  });
  loading.value = false;
}

const selectedCategories = ref<string[]>([]);
const selectedSubcategories = ref<string[]>([]);

const categoryOptions = computed(() => {
  const cats = Array.from(
    new Set(inventoryStore.categories.map((c) => c.category).filter(Boolean))
  );
  return cats
    .sort((a, b) => a.localeCompare(b))
    .map((c) => ({ label: c, value: c }));
});

const subcategoryOptions = computed(() => {
  if (selectedCategories.value.length === 0) return [];
  // Group subcategories by category
  const grouped: Record<string, string[]> = {};
  inventoryStore.subcategories.forEach((subcat: any) => {
    if (
      selectedCategories.value.includes(
        inventoryStore.categories.find(
          (cat: any) => cat.id === subcat.category_id
        )?.category
      )
    ) {
      const catName = inventoryStore.categories.find(
        (cat: any) => cat.id === subcat.category_id
      )?.category;
      if (catName && subcat.subcategory) {
        if (!grouped[catName]) grouped[catName] = [];
        if (!grouped[catName].includes(subcat.subcategory))
          grouped[catName].push(subcat.subcategory);
      }
    }
  });
  // Convert to optgroup format for PrimeVue MultiSelect
  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([cat, subs]) => ({
      label: cat,
      items: subs
        .sort((a, b) => a.localeCompare(b))
        .map((s) => ({ label: s, value: s })),
    }));
});

watch(selectedCategories, (newVal, oldVal) => {
  if (newVal.length === 0) {
    selectedSubcategories.value = [];
  } else {
    // Remove subcategories that do not belong to any selected category
    const validSubcatIds = materials.value
      .filter((m) => newVal.includes(m.category))
      .map((m) => m.subcategory)
      .filter(Boolean);
    selectedSubcategories.value = selectedSubcategories.value.filter((id) =>
      validSubcatIds.includes(id)
    );
  }
});

const filteredMaterials = computed(() => {
  let arr = materials.value;
  if (selectedCategories.value.length > 0) {
    arr = arr.filter((m) => selectedCategories.value.includes(m.category));
  }
  if (selectedSubcategories.value.length > 0) {
    arr = arr.filter((m) =>
      selectedSubcategories.value.includes(m.subcategory)
    );
  }
  if (!search.value) return arr;
  const s = search.value.toLowerCase();
  return arr.filter(
    (m) =>
      m.material_name.toLowerCase().includes(s) ||
      m.category.toLowerCase().includes(s) ||
      m.subcategory.toLowerCase().includes(s)
  );
});

function exportToExcel() {
  const rows = filteredMaterials.value
    .slice()
    .sort((a, b) => {
      return (
        (a.category || "").localeCompare(b.category || "") ||
        (a.subcategory || "").localeCompare(b.subcategory || "") ||
        (a.material_name || "").localeCompare(b.material_name || "")
      );
    })
    .map((item) => ({
      Category: item.category,
      Subcategory: item.subcategory,
      Material: item.material_name,
      Available: item.available_at_site,
      Requested: item.requested,
      Dispatched: item.dispatched,
      Received: item.received,
      Consumed: item.consumed,
      Returned: item.returned,
      "Return Accepted": item.return_accepted,
    }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Site Inventory");
  XLSX.writeFile(workbook, "site_inventory_export.xlsx");
}
</script>

<style scoped>
table {
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid #e0e0e0;
}
</style>
<style scoped>
::v-global(.p-select-label) {
  font-size: 0.8rem !important;
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

/* Reusable class for teal circle icons in table headers */
.header-circle-icon {
  @apply bg-red-500 font-semibold text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] cursor-pointer shadow transition-shadow;
}
</style>
