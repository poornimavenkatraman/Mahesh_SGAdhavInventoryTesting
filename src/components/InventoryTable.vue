<template>

  <div
    class="rounded-xl px-4 pb-4 transition-colors max-w-5xl"
    :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'"
  >
    <!-- Search and Filter Controls -->
    <div
      class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <!-- Search Box (left, wide) -->
      <div class="flex-1">
        <div class="relative w-full max-w-lg">
          <span
            class="absolute left-3 top-1/2 -translate-y-1/2"
            :class="isDark ? 'text-gray-400' : 'text-gray-400'"
          >
            <i class="fas fa-search text-teal-600 text-base"></i>
          </span>
          <InputText
            v-model="globalFilter"
            placeholder="Search Inventory..."
            class="p-inputtext-sm pl-9 text-xs w-full rounded border"
            :class="
              isDark
                ? 'bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-400'
                : 'bg-white text-teal-900 border-teal-200 placeholder-teal-400'
            "
            style="
              padding-left: 2.75rem;
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
            "
          />
        </div>
      </div>

      <!-- Filters & Export (right) -->
      <div class="flex items-center gap-2 justify-end flex-wrap">
        <span
          :class="isDark ? 'text-teal-200' : 'text-teal-700'"
          class="font-semibold text-[13px]"
          >Category:</span
        >
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
        <span
          :class="isDark ? 'text-teal-200' : 'text-teal-700'"
          class="font-semibold text-[13px]"
          >Subcategory:</span
        >
        <MultiSelect
          v-model="selectedSubcategories"
          :options="subcategoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter Subcategories"
          class="w-44 text-xs"
          :disabled="selectedCategories.length === 0"
          display="chip"
          showClear
          optionGroupLabel="label"
          optionGroupChildren="items"
        />
        <button
          @click="exportToExcel"
          :class="
            isDark
              ? 'bg-teal-700 hover:bg-teal-800 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          "
          class="px-4 py-2 rounded shadow flex items-center gap-2 transition-colors"
        >
          <i class="fas fa-file-excel"></i>
          Export to Excel
        </button>
      </div>
    </div>

    <div v-if="inventoryStore.loading" class="flex items-center justify-center py-10">
      <span class="flex items-center gap-3">
        <!-- <svg class="animate-spin h-6 w-6 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg> -->
        <span class="animate-spin text-3xl text-teal-400 mb-2">
                <i class="fas fa-spinner"></i>
            </span>
        <span class="text-teal-600 text-lg font-semibold animate-pulse">Loading inventory...</span>
      </span>
    </div>
    <!-- DataTable with horizontal scroll and theme support -->
    <div v-else class="overflow-x-auto">
      <DataTable
        :value="displayMaterials"
        :paginator="true"
        :rows="rowsPerPage"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        :globalFilterFields="['material', 'category', 'subcategory']"
        :globalFilter="globalFilter"
        dataKey="id"
        :expandedRows="expandedRows"
        @rowExpand="onRowExpand"
        @rowCollapse="onRowCollapse"
        responsiveLayout="scroll"
        class="p-datatable-sm min-w-[900px] rounded"
        paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        :class="isDark ? 'p-datatable-dark' : ''"
        sortMode="multiple"
        :multiSortMeta="initialSortMeta"
        removableSort
      >
        <Column expander style="width: 5rem" />
        <Column
          field="category"
          header="Category"
          sortable
          style="min-width: 120px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        />
        <Column
          field="subcategory"
          header="Subcategory"
          sortable
          style="min-width: 120px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        />
        <Column
          field="material"
          header="Material"
          sortable
          style="min-width: 120px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        />
        <Column
          field="total_stock"
          sortable
          style="min-width: 150px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Total Stock</span>
              <span class="header-circle-icon" title="Current status count"
                >C</span
              >
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Current status count
              </span> -->
            </div>
          </template>
        </Column>
        
        <Column
          field="stock_at_ho"
          sortable
          style="min-width: 150px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Stock at HO</span>
              <span class="header-circle-icon" title="Current status count"
                >C</span
              >
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Current status count
              </span> -->
            </div>
          </template>
        </Column>
        <Column
          field="stock_requested_by_site"
          sortable
          style="min-width: 210px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Stock Requested by Site</span>
              <span class="header-circle-icon" title="Till date count">C</span>
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Till date count
              </span> -->
            </div>
          </template>
        </Column>
        <Column
          field="stock_dispatched_to_site"
          sortable
          style="min-width: 200px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Stock Dispatched to Site</span>
              <span class="header-circle-icon" title="Current status count"
                >C</span
              >
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Current status count
              </span> -->
            </div>
          </template>
        </Column>
        <Column
          field="stock_received_at_site"
          sortable
          style="min-width: 200px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Stock Received at Site</span>
              <span class="header-circle-icon" title="Till date count"
                >T</span
              >
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Current status count
              </span> -->
            </div>
          </template>
        </Column>
        <Column
          field="stock_available_at_site"
          sortable
          style="min-width: 200px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Stock Available at Site</span>
              <span class="header-circle-icon" title="Current status count"
                >C</span
              >
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Current status count
              </span> -->
            </div>
          </template>
        </Column>
        <Column
          field="stock_consumed_at_site"
          sortable
          style="min-width: 200px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Stock Consumed at Site</span>
              <span class="header-circle-icon" title="Till date count">T</span>
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Till date count
              </span> -->
            </div>
          </template>
        </Column>
        <Column
          field="stock_returned_from_site"
          sortable
          style="min-width: 210px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Stock Returned from Site</span>
              <span class="header-circle-icon" title="Till date count">C</span>
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Till date count
              </span> -->
            </div>
          </template>
        </Column>
        <Column
          field="stock_return_accepted_from_site"
          sortable
          style="min-width: 250px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Stock Return Accepted from Site</span>
              <span class="header-circle-icon" title="Till date count">T</span>
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Till date count
              </span> -->
            </div>
          </template>
        </Column>
        <Column
          field="stock_requested_from_supplier"
          sortable
          style="min-width: 240px"
          :headerStyle="{
            background: isDark ? '#134e4a' : '#f0fdfa',
            color: isDark ? '#f0fdfa' : '#134e4a',
          }"
        >
          <template #header>
            <div class="flex items-center gap-2 group relative">
              <span>Stock Requested from Supplier</span>
              <span class="header-circle-icon" title="Current status count">C</span>
              <!-- <span class="absolute left-10 top-1/2 -translate-y-1/2 bg-white border border-teal-300 text-teal-700 px-2 py-1 rounded shadow text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Current status count
              </span> -->
            </div>
          </template>
        </Column>
        
        <template #expansion="slotProps">
          <div class="bg-teal-50 p-2">
            <div class="mt-4 ml-10 mb-5">
              <h3
                class="text-teal-700 font-bold text-sm mb-2 flex items-center"
              >
                <span
                  class="inline-block bg-teal-100 text-teal-700 rounded-full p-2 mr-2"
                >
                  <i class="fas fa-building"></i>
                </span>
                Sites
              </h3>
              <DataTable
                :value="activeSiteMaterials(slotProps.data.id)"
                class="p-datatable-sm min-w-[900px] rounded"
              >
                <Column
                  field="siteName"
                  header="Site Name"
                  style="min-width: 150px"
                  :headerStyle="
                    isDark
                      ? { background: '#134e4a', color: '#f0fdfa' }
                      : { background: '#99f6e4', color: '#134e4a' }
                  "
                >
                  <template #body="siteProps">
                    <router-link
                      :to="`/sites/${siteProps.data.siteId}`"
                      class="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-700 font-semibold shadow hover:bg-teal-200 hover:text-teal-900 transition cursor-pointer border border-teal-300"
                    >
                      {{ siteProps.data.siteName }}
                    </router-link>
                  </template>
                </Column>
                <Column
                  field="location"
                  header="Location"
                  style="min-width: 120px"
                  :headerStyle="
                    isDark
                      ? { background: '#134e4a', color: '#f0fdfa' }
                      : { background: '#99f6e4', color: '#134e4a' }
                  "
                />
                <Column
                  field="available_at_site"
                  style="min-width: 120px"
                  :headerStyle="
                    isDark
                      ? { background: '#134e4a', color: '#f0fdfa' }
                      : { background: '#99f6e4', color: '#134e4a' }
                  "
                >
                  <template #header>
                    <div class="flex items-center gap-2 group relative">
                      <span>Available at Site</span>
                      <span
                        class="header-circle-icon"
                        title="Current status count"
                        >C</span
                      >
                    </div>
                  </template>
                </Column>
                <Column
                  field="requested"
                  style="min-width: 100px"
                  :headerStyle="
                    isDark
                      ? { background: '#134e4a', color: '#f0fdfa' }
                      : { background: '#99f6e4', color: '#134e4a' }
                  "
                >
                  <template #header>
                    <div class="flex items-center gap-2 group relative">
                      <span>Requested</span>
                      <span
                        class="header-circle-icon"
                        title="Current status count"
                        >C</span
                      >
                    </div>
                  </template>
                </Column>
                <Column
                  field="dispatched"
                  style="min-width: 100px"
                  :headerStyle="
                    isDark
                      ? { background: '#134e4a', color: '#f0fdfa' }
                      : { background: '#99f6e4', color: '#134e4a' }
                  "
                >
                  <template #header>
                    <div class="flex items-center gap-2 group relative">
                      <span>Dispatched</span>
                      <span
                        class="header-circle-icon"
                        title="Current status count"
                        >C</span
                      >
                    </div>
                  </template>
                </Column>
                <Column
                  field="received"
                  style="min-width: 100px"
                  :headerStyle="
                    isDark
                      ? { background: '#134e4a', color: '#f0fdfa' }
                      : { background: '#99f6e4', color: '#134e4a' }
                  "
                >
                  <template #header>
                    <div class="flex items-center gap-2 group relative">
                      <span>Received</span>
                      <span class="header-circle-icon" title="Till date count"
                        >T</span
                      >
                    </div>
                  </template>
                </Column>
                <Column
                  field="consumed"
                  style="min-width: 100px"
                  :headerStyle="
                    isDark
                      ? { background: '#134e4a', color: '#f0fdfa' }
                      : { background: '#99f6e4', color: '#134e4a' }
                  "
                >
                  <template #header>
                    <div class="flex items-center gap-2 group relative">
                      <span>Consumed</span>
                      <span class="header-circle-icon" title="Till date count"
                        >T</span
                      >
                    </div>
                  </template>
                </Column>
                <Column
                  field="returned"
                  style="min-width: 100px"
                  :headerStyle="
                    isDark
                      ? { background: '#134e4a', color: '#f0fdfa' }
                      : { background: '#99f6e4', color: '#134e4a' }
                  "
                >
                  <template #header>
                    <div class="flex items-center gap-2 group relative">
                      <span>Returned</span>
                      <span
                        class="header-circle-icon"
                        title="Current status count"
                        >C</span
                      >
                    </div>
                  </template>
                </Column>
                <Column
                  field="return_accepted"
                  style="min-width: 120px"
                  :headerStyle="
                    isDark
                      ? { background: '#134e4a', color: '#f0fdfa' }
                      : { background: '#99f6e4', color: '#134e4a' }
                  "
                >
                  <template #header>
                    <div class="flex items-center gap-2 group relative">
                      <span>Return Accepted</span>
                      <span class="header-circle-icon" title="Till date count"
                        >T</span
                      >
                    </div>
                  </template>
                </Column>
                <template #empty>
                  <div
                    class="flex flex-col items-center justify-center gap-2 w-full mx-auto"
                  >
                    <span
                      class="inline-block bg-teal-100 rounded-full p-2 shadow-md"
                    >
                      <i class="fas fa-box-open text-sm text-teal-500"></i>
                    </span>
                    <span class="text-sm font-semibold text-teal-700"
                      >No records found!</span
                    >
                  </div>
                </template>
              </DataTable>
            </div>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

import * as XLSX from "xlsx";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useSiteStore } from "@/stores/siteStore";
import { Column, DataTable, MultiSelect } from "primevue";
import InputText from "primevue/inputtext";

const siteStore = useSiteStore();
const inventoryStore = useInventoryStore();

const globalFilter = ref("");
const rowsPerPage = ref(10);
const sortField = ref(null);
const sortOrder = ref(null);
const selectedCategories = ref<string[]>([]);
const selectedSubcategories = ref<string[]>([]);

const expandedRows = ref<{ [key: string]: boolean }>({});
const siteMaterials = ref<Record<string, any[]>>({});

// const loading = ref(true);

const initialSortMeta = [
  { field: "category", order: 1 as 1 },
  { field: "subcategory", order: 1 as 1 },
  { field: "material", order: 1 as 1 },
];
onMounted(() => {
  siteStore.fetchActiveSites();
  inventoryStore.fetchCategories();
  inventoryStore.fetchSubcategories();
  inventoryStore.fetchMaterials();
  
  // loading.value = false;
});

watch(selectedCategories, (newVal, oldVal) => {
  if (newVal.length === 0) {
    selectedSubcategories.value = [];
  } else {
    // Remove subcategories that do not belong to any selected category
    const validSubcatIds = inventoryStore.subcategories
      .filter((sc) => newVal.includes(sc.category_id))
      .map((sc) => sc.id);
    selectedSubcategories.value = selectedSubcategories.value.filter((id) =>
      validSubcatIds.includes(id)
    );
  }
});

const categoryOptions = computed(() => {
  const cats = Array.from(
    new Set(inventoryStore.subcategories.map((sc) => sc.category_id))
  );
  return cats
    .map((catId) => {
      const cat = inventoryStore.categories.find((c) => c.id === catId);
      return { label: cat ? cat.category : catId, value: catId };
    })
    .filter((opt) => !!opt.label)
    .sort((a, b) => a.label.localeCompare(b.label));
});

const subcategoryOptions = computed(() => {
  let subs = inventoryStore.subcategories;
  if (selectedCategories.value.length > 0) {
    subs = subs.filter((sc) =>
      selectedCategories.value.includes(sc.category_id)
    );
  }
  const grouped: { [key: string]: { label: string; value: string }[] } = {};
  subs.forEach((sc) => {
    const cat = inventoryStore.categories.find((c) => c.id === sc.category_id);
    const catLabel = cat ? cat.category : sc.category_id;
    if (!grouped[catLabel]) grouped[catLabel] = [];
    grouped[catLabel].push({ label: sc.subcategory, value: sc.id });
  });
  return Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b))
    .map((catLabel) => ({
      label: catLabel,
      items: grouped[catLabel].sort((a, b) => a.label.localeCompare(b.label)),
    }));
});

// const props = defineProps<{ items: any[] }>();

const filteredMaterials = computed(() => {
  let arr = [...inventoryStore.materials];
  if (selectedCategories.value.length > 0) {
    arr = arr.filter((i: any) => {
      const subcat = inventoryStore.subcategories.find(
        (sc: any) => sc.id === i.subcategory_id
      );
      return subcat && selectedCategories.value.includes(subcat.category_id);
    });
  }
  if (selectedSubcategories.value.length > 0) {
    arr = arr.filter((i: any) =>
      selectedSubcategories.value.includes(i.subcategory_id)
    );
  }
  if (globalFilter.value) {
    const term = globalFilter.value.toLowerCase();
    arr = arr.filter((i: any) =>
      [
        inventoryStore.categoryFromSubcategory(i.subcategory_id).category,
        inventoryStore.singleSubcategory(i.subcategory_id).subcategory,
        i.material,
        i.uom,
        i.total_stock,
        i.stock_at_ho,
        i.stock_requested_by_site,
        i.stock_dispatched_to_site,
        i.stock_received_at_site,
        i.stock_available_at_site,
        i.stock_consumed_at_site,
        i.stock_returned_from_site,
        i.stock_return_accepted_from_site,
        i.stock_requested_from_supplier,
      ]
        .map((val: any) => (val ? val.toString().toLowerCase() : ""))
        .some((val: any) => val.includes(term))
    );
  }
  return arr;
});

const displayMaterials = computed(() =>
  filteredMaterials.value
    .map((item: any) => ({
      ...item,
      category: String(
        inventoryStore.categoryFromSubcategory(item.subcategory_id).category || ""
      ),
      subcategory: String(
        inventoryStore.singleSubcategory(item.subcategory_id).subcategory || ""
      ),
    }))
    .sort((a: any, b: any) => {
      const catA = a.category || "";
      const catB = b.category || "";
      const subA = a.subcategory || "";
      const subB = b.subcategory || "";
      const matA = a.material || "";
      const matB = b.material || "";
      return (
        catA.localeCompare(catB) ||
        subA.localeCompare(subB) ||
        matA.localeCompare(matB)
      );
    })
);

// Only fetch site_materials for a material when its row is expanded
const onRowExpand = async (event: any) => {
  const materialId = event.data.id;

  // Fetch active sites if not already loaded
  if (siteStore.activeSites.length === 0) {
    siteStore.fetchActiveSites();
  }

  // Fetch site_materials for this material if not already loaded
  if (!siteMaterials.value[materialId]) {
    await siteStore.fetchSiteMaterialsByMaterial(materialId);
    siteMaterials.value[materialId] = siteStore.siteMaterialsByMaterial;
  }
  expandedRows.value = { ...expandedRows.value, [materialId]: true };
};

// Helper to get active site materials for a material
function activeSiteMaterials(materialId: string) {
  const materials = siteMaterials.value[materialId] || [];
  // Only include site_materials where site_id matches an active site
  return materials
    .filter((sm) =>
      siteStore.activeSites.some((site) => site.id === sm.site_id)
    )
    .map((sm) => {
      const site = siteStore.activeSites.find((site) => site.id === sm.site_id);
      return {
        siteName: site?.site || sm.site_id,
        siteId: site?.id || sm.site_id, // Add siteId for router-link
        location: site?.location || "",
        available_at_site: sm.available_at_site || 0,
        requested: sm.requested || 0,
        dispatched: sm.dispatched || 0,
        received: sm.received || 0,
        consumed: sm.consumed || 0,
        returned: sm.returned || 0,
        return_accepted: sm.return_accepted || 0,
      };
    });
}

const onRowCollapse = (event: any) => {
  const { [event.data.id]: _, ...rest } = expandedRows.value;
  expandedRows.value = rest;
};

const exportToExcel = () => {
  const rows = displayMaterials.value.map((item) => ({
    // "Category":  getCategoryNameFromSubcategory(item.sub_category_id),
    // "Subcategory": getSubcategoryName(item.sub_category_id),
    Category: item.category,
    Subcategory: item.subcategory,
    Material: item.material,
    UOM: item.uom,
    "Total Stock": item.total_stock,
    "Stock at HO": item.stock_at_ho,
    "Stock Requested by Site": item.stock_requested_by_site,
    "Stock Dispatched to Site": item.stock_dispatched_to_site,
    "Stock Received at Site": item.stock_received_at_site,
    "Stock Available at Site": item.stock_available_at_site,
    "Stock Consumed at Site": item.stock_consumed_at_site,
    "Stock Returned from Site": item.stock_returned_from_site,
    "Stock Return Accepted from Site": item.stock_return_accepted_from_site,
    "Stock Requested from Supplier": item.stock_requested_from_supplier,

  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set header styles: bold, teal background, white text
  const header = Object.keys(rows[0]);
  const teal = { rgb: "14B8A6" }; // Tailwind teal-500
  const white = { rgb: "FFFFFF" };

  // Apply styles to header row
  header.forEach((col, idx) => {
    const cell = XLSX.utils.encode_cell({ r: 0, c: idx });
    if (!worksheet[cell]) worksheet[cell] = { t: "s", v: col };
    worksheet[cell].s = {
      font: { bold: true, color: white },
      fill: { fgColor: teal },
      alignment: { horizontal: "center", vertical: "center" },
    };
  });

  // Auto-size columns to fit header text
  worksheet["!cols"] = header.map((col) => ({
    wch: Math.max(col.length + 2, 18), // at least 18 chars or header length+2
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
  XLSX.writeFile(workbook, "inventory_export.xlsx");
};

// Theme detection (simple example, replace with your own logic or use a store)
const isDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);
</script>

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

.p-datatable-dark {
  background-color: #1f2937 !important;
  color: #f3f4f6 !important;
}

.p-datatable-dark .p-datatable-thead > tr > th,
.p-datatable-dark .p-datatable-tbody > tr > td {
  background-color: #1f2937 !important;
  color: #f3f4f6 !important;
}

.p-datatable-dark .p-datatable-tbody > tr.p-highlight {
  background-color: #334155 !important;
}

::v-global(.p-datatable-emptymessage) {
  text-align: center;
}

::v-global(.p-datatable-column-sorted) {
  background-color: #ccfbf1 !important;
}

::v-global(.p-badge) {
  background-color: #14b8a6 !important; /* teal-500 */
}
/* Reusable class for teal circle icons in table headers */
.header-circle-icon {
  @apply bg-teal-500 text-white font-semibold rounded-full w-5 h-5 flex items-center justify-center text-[9px] cursor-pointer shadow transition-shadow;
}
.group:hover .header-circle-icon {
  @apply shadow-lg;
}
</style>
