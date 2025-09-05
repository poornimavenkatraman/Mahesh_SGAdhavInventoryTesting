<template>
  <div class="p-2 bg-white">
    <nav
      class="flex items-center mb-0 pl-2 py-2"
      aria-label="Breadcrumb"
      style="background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%)"
    >
      <ol class="flex items-center space-x-1">
        <li>
          <router-link
            to="/sites"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-teal-700 font-semibold text-[9px] hover:bg-teal-200 transition"
          >
            <i class="fas fa-city mr-1"></i> Sites
          </router-link>
        </li>
        <li>
          <span class="mx-1 text-teal-400">
            <i class="fas fa-chevron-right"></i>
          </span>
        </li>
        <li>
          <router-link
            :to="`/sites/${siteId}`"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-teal-700 font-semibold text-[9px] hover:bg-teal-200 transition"
            aria-current="page"
          >
            <i class="fas fa-building mr-1"></i>{{ siteName }}
          </router-link>
        </li>
        <li>
          <span class="mx-1 text-teal-400">
            <i class="fas fa-chevron-right"></i>
          </span>
        </li>
        <li>
          <span
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-teal-700 font-semibold text-[9px]"
            aria-current="page"
          >
            <i class="fas fa-boxes mr-1"></i>{{ route.query.actionType }} Bulk
            Materials
          </span>
        </li>
      </ol>
    </nav>
    <div class="max-w-4xl mt-3">
      <!-- Header Bar -->
      <div class="flex items-center justify-between mb-2 px-2">
        <div class="flex items-center gap-3">
          <div class="bg-teal-200 rounded-full p-2">
            <i class="fas fa-th text-xl text-teal-700"></i>
          </div>
          <h2 class="text-lg font-bold text-teal-700">
            {{ route.query.actionType }} Bulk Materials
          </h2>
        </div>
      </div>
      <div
        class="mb-4 ml-12 px-2 text-teal-700 font-semibold text-xs flex items-center gap-2"
      >
        <i class="fas fa-building"></i>
        <span>Site:</span>
        <router-link
          :to="`/sites/${siteId}`"
          class="bg-teal-100 px-2 py-1 rounded text-teal-900 ml-2 hover:bg-teal-200 transition font-semibold"
        >
          {{ siteName }}
        </router-link>
        <button
          @click="showAddSubcategory = true"
          class="ml-4 px-3 py-1 bg-teal-500 text-white rounded-full text-xs font-semibold shadow hover:bg-teal-600 transition flex items-center"
        >
          <i class="fas fa-layer-group mr-1"></i>Add Subcategory
        </button>
        <button
          @click="showAddMaterial = true"
          class="ml-2 px-3 py-1 bg-teal-700 text-white rounded-full text-xs font-semibold shadow hover:bg-teal-800 transition flex items-center"
        >
          <i class="fas fa-cube mr-1"></i>Add Material
        </button>
      </div>
      <div class="w-full ml-12 mb-14">
        <div
          v-if="loading"
          class="flex flex-col items-center justify-center text-teal-600 text-center py-8 text-lg animate-pulse"
        >
          <span class="animate-spin text-3xl text-teal-400 mb-2">
            <i class="fas fa-spinner"></i>
          </span>
          <span class="text-teal-600 text-base font-semibold"
            >Loading Available Materials...</span
          >
        </div>
        <div v-else>

          <div
            v-if="!accordionGroups.length && route.query.actionType !== 'Return' && route.query.actionType !== 'Dispatch' && route.query.actionType !== 'Consume'"
            class="text-gray-500 text-sm italic text-center py-10"
          >
            No materials added yet. Click "Add Subcategory" or "Add Material" to
            get started.
          </div>
          <div
            v-if="route.query.actionType == 'Return' || route.query.actionType == 'Consume'"
            class="flex items-center justify-center py-2 mb-2 text-xs font-semibold text-teal-700 bg-teal-50 rounded shadow"
            >
            <i class="fas fa-info-circle mr-2 text-teal-400"></i>
            {{ !accordionGroups.length ? "No materials to show!" : "Showing only materials available at sites" }}
          </div>
          <div
            v-if="route.query.actionType == 'Dispatch'"
            class="flex items-center justify-center py-2 mb-2 text-xs font-semibold text-teal-700 bg-teal-50 rounded shadow"
            >
            <i class="fas fa-info-circle mr-2 text-teal-400"></i>
            {{ !accordionGroups.length ? "No materials to show!" : "Showing only materials available at HO" }}
          </div>
          <div
            v-for="(catGroup, catIdx) in accordionGroups"
            :key="catIdx"
            class="mb-6"
          >
            <details open class="mb-2">
              <summary
                class="border-t-2 border-gray-100 rounded shadow-md pl-3 py-2 text-base font-bold text-teal-800 cursor-pointer select-none flex items-center gap-2"
                style="
                  background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%);
                "
              >
                <i class="fas fa-hard-hat"></i>
                <span
                  class="inline-block text-xs font-bold rounded-full py-1"
                  >{{ catGroup.category }}</span
                >
              </summary>
              <div class="ml-5 my-2 gap-6">
                <div
                  v-for="(subGroup, subIdx) in catGroup.subcategories"
                  :key="subGroup.subcategory"
                  :id="getSubcatDomId(subGroup.subcategory)"
                  class="flex-1 min-w-[22rem] flex items-start"
                >
                  <i
                    class="fas fa-angle-double-right mr-2 text-teal-400 mt-4"
                  ></i>
                  <details open class="mb-2 w-full">
                    <summary
                      class="border-t-2 border-gray-100 rounded shadow-md pl-3 py-2 text-base font-bold text-teal-800 cursor-pointer select-none flex items-center gap-2"
                      style="
                        background: linear-gradient(
                          90deg,
                          #81e6d9 0%,
                          #f0fdfa 100%
                        );
                      "
                    >
                      <i class="fas fa-layer-group"></i>
                      <span class="inline-block text-xs font-bold py-1">{{
                        subGroup.subcategory
                      }}</span>
                      <div class="flex-1"></div>
                      <!-- Action Buttons -->
                       <button
                        @click.stop="deleteZeroStockMaterials(catIdx, subIdx)"
                        class="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition flex items-center"
                      >
                        <i class="fas fa-trash-alt mr-1"></i>Delete Zero Quantity Materials
                      </button>
                      <button
                        @click.stop="deleteSubcategoryAccordion(catIdx, subIdx)"
                        class="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition flex items-center"
                      >
                        <i class="fas fa-trash-alt mr-1"></i>Delete
                      </button>
                      <button
                        @click.stop="reloadSubcategoryMaterials(catIdx, subIdx)"
                        class="ml-2 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-semibold hover:bg-teal-200 transition flex items-center mr-3"
                      >
                        <i class="fas fa-sync-alt mr-1"></i>Reload
                      </button>
                    </summary>
                    <div class="pl-5 pt-2 mb-4 gap-2 flex items-start">
                      <i
                        class="fas fa-angle-double-right mr-2 text-teal-400 mt-4"
                      ></i>
                      <table class="min-w-[30rem] mt-2 mb-2 border">
                        <thead>
                          <tr class="bg-teal-50">
                            <th class="p-2 text-left text-xs text-teal-700">
                              Material
                            </th>
                            <th class="p-2 text-left text-xs text-teal-700">
                              Quantity
                            </th>
                            <th class="p-2 text-left text-xs text-teal-700">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(mat, idx) in subGroup.materials"
                            :key="mat.id"
                            :id="`mat-${mat.id}`"
                            :class="[
                              'cursor-pointer',
                              mat._deleting === true
                                ? 'bg-red-200 animate-pulse'
                                : mat.highlighted === true
                                ? 'bg-teal-200 animate-pulse'
                                : 'hover:bg-teal-50 transition',
                            ]"
                          >
                            <td class="p-2 text-xs text-gray-700 font-medium">
                              {{ mat.material }}
                              <span
                                v-if="route.query.actionType === 'Dispatch'"
                                class="ml-2 text-[10px] px-2 py-1 rounded bg-teal-100 text-teal-700 font-semibold"
                                >Available at HO:
                                {{ mat.stock_at_ho }}</span
                              >
                              <span
                                v-if="route.query.actionType === 'Return' || route.query.actionType === 'Consume'"
                                class="ml-2 text-[10px] px-2 py-1 rounded bg-teal-100 text-teal-700 font-semibold"
                                >Available at Site:
                                {{ mat.stock_available_at_site || 0 }}</span>
                            </td>
                            <td class="p-2">
                              <input
                                type="number"
                                v-model.number="mat.quantity"
                                min="1"
                                required
                                class="w-16 p-1 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-400 text-teal-700 font-semibold text-xs"
                                :style="{
                                  background: (() => {
                                    if (route.query.actionType === 'Dispatch') {
                                      const stockAvailable = Number(
                                        mat?.stock_at_ho
                                      );
                                      if (
                                        !isNaN(stockAvailable) &&
                                        mat.quantity > stockAvailable
                                      ) {
                                        return '#FCA5A5'; // red-300
                                      }

                                      return '';
                                    }else if (route.query.actionType === 'Return' || route.query.actionType === 'Consume') {
                                      const stockAvailable = Number(
                                        mat?.stock_available_at_site
                                      );
                                      if (
                                        !isNaN(stockAvailable) &&
                                        mat.quantity > stockAvailable
                                      ) {
                                        return '#FCA5A5'; // red-300
                                      }

                                      return '';
                                    }
                                  })(),
                                }"
                                @change="
                                  () => {
                                    if (mat?.quantity < 0) {
                                      mat.quantity = 0;
                                    }
                                  }
                                "
                              />
                            </td>
                            <td class="p-2">
                              <button
                                @click="
                                  deleteMaterialAccordion(catIdx, subIdx, idx)
                                "
                                class="text-red-500 hover:text-red-700 text-xs p-2 rounded-full bg-red-50 shadow flex items-center justify-center"
                              >
                                <i class="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </details>
                </div>
              </div>
            </details>
          </div>
                    <!-- Dispatch Date and Comments Selector -->
          <hr></hr>
          <div class=" justify-left gap-4 mt-10 mb-14 ml-16" >
            <div class="flex items-baseline gap-2 mb-5" v-if="route.query.actionType === 'Return'">
              <label
                for="return-date"
                class="text-xs font-semibold text-teal-700 min-w-[140px]"
                >Return Date:<span class="text-red-500">*</span></label
              >
              <input
                id="return-date"
                type="date"
                v-model="returnDate"
                class="cursor-pointer border border-teal-300 rounded px-2 py-1 text-xs text-teal-700 focus:ring-2 focus:ring-teal-400"
                style="min-width: 140px"
              />
            </div>
            <div class="flex items-baseline gap-2 mb-5" v-if="route.query.actionType === 'Dispatch'">
              <label
                for="dispatch-date"
                class="text-xs font-semibold text-teal-700 min-w-[140px]"
                >Dispatch Date:<span class="text-red-500">*</span></label
              >
              <input
                id="dispatch-date"
                type="date"
                v-model="dispatchDate"
                class="cursor-pointer border border-teal-300 rounded px-2 py-1 text-xs text-teal-700 focus:ring-2 focus:ring-teal-400"
                style="min-width: 140px"
              />
            </div>
             <div class="flex items-baseline gap-2 mb-5" v-if="route.query.actionType === 'Request'">
              <label
                for="request-date"
                class="text-xs font-semibold text-teal-700 min-w-[140px]"
                >Request Date:<span class="text-red-500">*</span></label
              >
              <input
                id="request-date"
                type="date"
                v-model="requestDate"
                class="cursor-pointer border border-teal-300 rounded px-2 py-1 text-xs text-teal-700 focus:ring-2 focus:ring-teal-400"
                style="min-width: 140px"
              />
            </div>
             <div class="flex items-baseline gap-2 mb-5" v-if="route.query.actionType === 'Request'">
              <label
                for="delivery-date"
                class="text-xs font-semibold text-teal-700 min-w-[140px]"
                >Expected Delivery Date:<span class="text-red-500">*</span></label
              >
              <input
                id="delivery-date"
                type="date"
                v-model="deliveryDate"
                class="cursor-pointer border border-teal-300 rounded px-2 py-1 text-xs text-teal-700 focus:ring-2 focus:ring-teal-400"
                style="min-width: 140px"
              />
            </div>
            <div class="flex items-baseline gap-2">
              <label
                for="comments"
                class="text-xs font-semibold text-teal-700 min-w-[140px]"
                >Comments:<span class="text-red-500">*</span></label
              >
              <textarea
                id="comments"
                v-model="comments"
                class="border border-teal-300 rounded px-2 py-1 text-xs text-teal-700 focus:ring-2 focus:ring-teal-400"
                placeholder="Enter comments..."
                style="min-width: 450px; min-height: 120px; resize: vertical"
              ></textarea>
            </div>
          </div>
          <button
            @click="submitOrder"
            class="w-28 py-2 mt-4 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white rounded-lg shadow font-semibold text-xs transition mx-auto block"
          >
            <i class="fas fa-cubes mr-2"></i>Submit
          </button>
        </div>
      </div>
    </div>
    <!-- Placeholder for AddSubcategoryModal -->
    <AddSubcategoryModal
      :show="showAddSubcategory"
      v-model:selected="selectedSubcategories"
      @close="showAddSubcategory = false"
      @add="addSubcategoriesFromModal"
    />

    <AddMaterialModal
      :show="showAddMaterial"
      :categories="categories"
      :subcategories="subcategories"
      :materials="materials"
      :existing-materials="getExistingMaterialIdsForSelectedSubcategories()"
      @close="showAddMaterial = false"
      @add="addMaterialsFromModal"
    />
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import AddMaterialModal from "@/components/AddMaterialModal.vue";
import AddSubcategoryModal from "@/components/AddSubcategoryModal.vue";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useMessageStore } from "@/stores/messageStore";

const inventoryStore = useInventoryStore();
const router = useRouter();
const messageStore = useMessageStore();
// Dispatch date and comments
const todayStr = new Date().toISOString().slice(0, 10);
const dispatchDate = ref<string>(todayStr);
const returnDate = ref<string>(todayStr);
const requestDate = ref<string>(todayStr);
const deliveryDate = ref<string>(todayStr);
const comments = ref<string>("");

const selectedSubcategories = ref<string[]>([]);
const showAddSubcategory = ref(false);
const showAddMaterial = ref(false);
const selectedSubcategoriesModal = ref<string[]>([]);
const selectedSubcategoriesForMaterial = ref<string[]>([]);
const selectedMaterialsModal = ref<string[]>([]);

// These will be populated after fetch
const categories = ref<Category[]>([]);
const subcategories = ref<Subcategory[]>([]);
const materials = ref<Material[]>([]);
const loading = ref(true);
const groupedMaterials = ref<any[]>([]);
const accordionGroups = ref<any[]>([]);


interface Material {
  id: string;
  material: string;
  subcategory_id: string;
  category_id: string;
  quantity: number;
  uom?: string;
  stock_at_ho?: number;
  stock_available_at_site?: number;
  highlighted?: boolean;
}
interface Subcategory {
  id: string;
  subcategory: string;
  category_id: string;
}
interface Category {
  id: string;
  category: string;
}

// Helper to get already existing material ids for selected subcategories
function getExistingMaterialIdsForSelectedSubcategories() {
  const ids: string[] = [];
  accordionGroups.value.forEach((catGroup: any) => {
    catGroup.subcategories.forEach((subGroup: any) => {
      const subcatObj = subcategories.value.find(
        (sc) => sc.subcategory === subGroup.subcategory
      );
      if (subcatObj && selectedSubcategories.value.includes(subcatObj.id)) {
        subGroup.materials.forEach((mat: any) => {
          ids.push(mat.id);
        });
      }
    });
  });
  return ids;
}

function deleteZeroStockMaterials(catIdx: number, subIdx: number) {

  const subGroup = accordionGroups.value[catIdx].subcategories[subIdx];
  subGroup.materials = subGroup.materials.filter((mat: Material) => mat.quantity > 0);
  // If no materials left in subcategory, remove subcategory and update selectedSubcategories
  if (subGroup.materials.length === 0) {
    const subcatName = subGroup.subcategory;
    const subcatId = subcategories.value.find(
      (sc: Subcategory) => sc.subcategory === subcatName
    )?.id;
    accordionGroups.value[catIdx].subcategories.splice(subIdx, 1);
    // Remove from selectedSubcategories for modal
    if (subcatId) {
      selectedSubcategories.value = selectedSubcategories.value.filter(
        (id) => id !== subcatId
      );
    }
    // If no subcategories left in category, remove category group
    if (accordionGroups.value[catIdx].subcategories.length === 0) {
      accordionGroups.value.splice(catIdx, 1);
    }
  }
  accordionGroups.value = [...accordionGroups.value];
}

function deleteSubcategoryAccordion(catIdx: number, subIdx: number) {
  const subcatName =
    accordionGroups.value[catIdx].subcategories[subIdx].subcategory;
  const subcatId = subcategories.value.find(
    (sc: Subcategory) => sc.subcategory === subcatName
  )?.id;
  // Remove subcategory from accordionGroups
  accordionGroups.value[catIdx].subcategories.splice(subIdx, 1);
  // If no subcategories left in category, remove category group
  if (accordionGroups.value[catIdx].subcategories.length === 0) {
    accordionGroups.value.splice(catIdx, 1);
  }
  // Remove from selectedSubcategories as well
  if (subcatId) {
    selectedSubcategories.value = selectedSubcategories.value.filter(
      (id) => id !== subcatId
    );
  }
}

async function reloadSubcategoryMaterials(catIdx: number, subIdx: number) {
  const subcatName =
    accordionGroups.value[catIdx].subcategories[subIdx].subcategory;
  const subcatId = subcategories.value.find(
    (sc: Subcategory) => sc.subcategory === subcatName
  )?.id;
  if (!subcatId) return;
    const allMaterials = materials.value.filter(
    (mat: Material) => mat.subcategory_id === subcatId
  );
  const subGroup = accordionGroups.value[catIdx].subcategories[subIdx];
  const existingMaterialIds = subGroup.materials.map((m: Material) => m.id);
  // Add new materials directly to subGroup.materials to preserve reactivity
  allMaterials.forEach((mat: Material) => {
    if (!existingMaterialIds.includes(mat.id) && (route.query.actionType !== 'Dispatch' || (mat.stock_at_ho ?? 0) > 0) && (route.query.actionType !== 'Return' || (mat.stock_available_at_site ?? 0) > 0) && (route.query.actionType !== 'Consume' || (mat.stock_available_at_site ?? 0) > 0)) {
      const newMat = {
        ...mat,
        quantity: 0,
        uom: mat.uom ?? "",
        highlighted: true,
        _deleting: false,
      };
      subGroup.materials.unshift(newMat); // Add to start
      setTimeout(() => {
        newMat.highlighted = false;
        // Force Vue reactivity by replacing the array reference
        subGroup.materials = [...subGroup.materials];
      }, 500);
    }
  });
  // Move all newly added materials to the front, keep existing order for others
  subGroup.materials.sort((a: Material, b: Material) => {
    if (a.highlighted && !b.highlighted) return -1;
    if (!a.highlighted && b.highlighted) return 1;
    return 0;
  });
}

const route = useRoute();
const siteId = ref(
  (typeof route.query.siteId === "string"
    ? route.query.siteId
    : route.params.siteId) as string
);

const siteName = ref("Site Name");

onMounted(async () => {
  loading.value = true;
  
  if (siteId.value) {
    const siteSnap = await getDocs(collection(db, "sites"));
    const siteDoc = siteSnap.docs.find((doc) => doc.id === siteId.value);
    if (siteDoc) {
      siteName.value = siteDoc.data().site || "Site Name";
    }
  }

  // Fetch subcategories
  const subcategoriesSnap = await getDocs(collection(db, "subcategories"));
  subcategories.value = subcategoriesSnap.docs.map((doc) => ({
    id: doc.id,
    subcategory: doc.data().subcategory || "",
    category_id: doc.data().category_id || "",
  }));
  // Fetch categories
  const categoriesSnap = await getDocs(collection(db, "categories"));
  categories.value = categoriesSnap.docs.map((doc) => ({
    id: doc.id,
    category: doc.data().category || "",
  }));
  // Fetch materials
  const materialsSnap = await getDocs(collection(db, "materials"));
  materials.value = materialsSnap.docs.map((doc) => ({
    id: doc.id,
    material: doc.data().material || "",
    subcategory_id: doc.data().subcategory_id || "",
    category_id: doc.data().category_id || "",
    quantity: 0,
    stock_at_ho: doc.data().stock_at_ho || 0,
    stock_available_at_site: doc.data().stock_available_at_site || 0,
    uom: doc.data().uom || "",
  }));

  const actionType = route.query.actionType;
  // Filter materials by selected subcategories
  const filteredMaterials = computed(() => {
    if (actionType === 'Return' || actionType === 'Consume') {
      return materials.value.filter(m => (m.stock_available_at_site ?? 0) > 0);
    }
    if (actionType === 'Dispatch') {
      return materials.value.filter(m => (m.stock_at_ho ?? 0) > 0);
    }
    return materials.value.filter((mat) =>
      selectedSubcategories.value.includes(mat.subcategory_id)
    );
  });

  // Group by category/subcategory and sort materials alphabetically
  groupedMaterials.value = [];
  accordionGroups.value = [];
  // Build category -> subcategory -> materials structure
  const catMap: Record<string, { category: string; subcategories: any[] }> = {};
  for (const subcatId of selectedSubcategories.value) {
    const subcat = subcategories.value.find((sc) => sc.id === subcatId);
    if (!subcat) continue;
    const cat = categories.value.find((c) => c.id === subcat.category_id);
    const catName = cat ? cat.category : subcat.category_id;
    const subcatName = subcat.subcategory || subcat.id;
    const groupMats = filteredMaterials.value
      .filter((mat) => mat.subcategory_id === subcatId)
      .sort((a, b) => a.material.localeCompare(b.material));
    
    if(groupMats.length != 0){
      if (!catMap[catName])
        catMap[catName] = { category: catName, subcategories: [] };
        catMap[catName].subcategories.push({
          subcategory: subcatName,
          materials: groupMats,
        });
    }
   
  }
  selectedSubcategories.value = Object.keys(catMap).flatMap(
    (catName) =>
      catMap[catName].subcategories.map(
        (subGroup: { subcategory: string }) => {
          const subcatObj = subcategories.value.find(
            (sc) => sc.subcategory === subGroup.subcategory
          );
          return subcatObj ? subcatObj.id : subGroup.subcategory;
        }
      )
  );
  accordionGroups.value = Object.values(catMap);
  loading.value = false;
});


if (route.query.subcategories) {
  if (typeof route.query.subcategories === "string") {
    selectedSubcategories.value = route.query.subcategories.split(",");
  } else if (Array.isArray(route.query.subcategories)) {
    selectedSubcategories.value = route.query.subcategories as string[];
  }
}

function getSubcatDomId(subcatName: string) {
  const subcat = subcategories.value.find(
    (sc) => sc.subcategory === subcatName
  );
  return "subcat-" + (subcat ? subcat.id : subcatName);
}

function getMaterialDomId(subcatName: string) {
  const subcat = subcategories.value.find(
    (sc) => sc.subcategory === subcatName
  );
  return "mat-" + (subcat ? subcat.id : subcatName);
}

function addSubcategories() {
  // Add selected subcategories to main selection
  selectedSubcategories.value = Array.from(
    new Set([
      ...selectedSubcategories.value,
      ...selectedSubcategoriesModal.value,
    ])
  );
  showAddSubcategory.value = false;
  selectedSubcategoriesModal.value = [];
}

// Handler for AddSubcategoryModal @add event
function addSubcategoriesFromModal(newSubcategories: string[]) {
  // Only add new subcategories and their materials, preserving old state

  const actuallyNew = newSubcategories.filter(
    (id) => !selectedSubcategories.value.includes(id)
  );

  if (actuallyNew.length === 0) {
    showAddSubcategory.value = false;
    return;
  }
  // Preserve old material quantities
  const oldQuantities: Record<string, number> = {};
  accordionGroups.value.forEach((catGroup) => {
    catGroup.subcategories.forEach((subGroup: { materials: Material[] }) => {
      subGroup.materials.forEach((mat: Material) => {
        oldQuantities[mat.id] = mat.quantity;
      });
    });
  });

  // Start with current accordionGroups
  let newAccordionGroups = JSON.parse(JSON.stringify(accordionGroups.value));
  const oldAccordionGroups = JSON.parse(JSON.stringify(accordionGroups.value));
  actuallyNew.forEach((subcatId) => {
    const subcat = subcategories.value.find(
      (sc: Subcategory) => sc.id === subcatId
    );
    if (!subcat) return;
    const cat = categories.value.find(
      (c: Category) => c.id === subcat.category_id
    );
    const catName = cat ? cat.category : subcat.category_id;
    const subcatName = subcat.subcategory || subcat.id;

    // Fetch materials for this subcategory from materials collection
    const groupMats = materials.value
      .filter((mat: Material) => mat.subcategory_id === subcatId)
      .sort((a: Material, b: Material) => a.material.localeCompare(b.material))
      .map((mat: Material) => ({
        ...mat,
        quantity: oldQuantities[mat.id] ?? 0,
        uom: mat.uom ?? "",
      }));

    // Find category accordion
    let catGroup = newAccordionGroups.find((g: any) => g.category === catName);

    if (!catGroup) {
      catGroup = { category: catName, subcategories: [] };
      newAccordionGroups.push(catGroup);
    }

    // Check if subcategory already exists
    let subGroup = catGroup.subcategories.find(
      (s: any) => s.subcategory === subcatName
    );
    let newMaterialsApplicable = false;
    
    if (!subGroup) {
      // Subcategory doesn't exist, so add it with its materials
      const materialsForSubcat = materials.value
        .filter((mat: Material) => {
          if (route.query.actionType === 'Dispatch') {
            return mat.subcategory_id === subcatId && (mat.stock_at_ho ?? 0) > 0;
          }else if (route.query.actionType === 'Return' || route.query.actionType === 'Consume'){
            return mat.subcategory_id === subcatId && (mat.stock_available_at_site ?? 0) > 0;
          }else{
            return mat.subcategory_id === subcatId;
          }

          
        })
        .sort((a: Material, b: Material) =>
          a.material.localeCompare(b.material)
        )
        .map((mat: Material) => ({
          ...mat,
          quantity: oldQuantities[mat.id] ?? 0,
          uom: mat.uom ?? "",
        }));
    
      if(materialsForSubcat.length !== 0){
        subGroup = { subcategory: subcatName, materials: materialsForSubcat };
        catGroup.subcategories.push(subGroup);
      }
    }

    if (catGroup.subcategories.length === 0) {
      const catIdx = newAccordionGroups.findIndex((g: any) => g.category === catName);
      if (catIdx !== -1) {
        newAccordionGroups.splice(catIdx, 1);
      }
    }

   
  });


  if(oldAccordionGroups.length === newAccordionGroups.length){
    const oldSubcatNames = oldAccordionGroups.flatMap((catGroup: any) =>
      catGroup.subcategories.map((subGroup: any) => subGroup.subcategory)
    );
    const newSubcatNames = newAccordionGroups.flatMap((catGroup: any) =>
      catGroup.subcategories.map((subGroup: any) => subGroup.subcategory)
    );
    const intersection = actuallyNew.filter(subcatId => {
      const subcatObj = subcategories.value.find(sc => sc.id === subcatId);
      return subcatObj ? newSubcatNames.includes(subcatObj.subcategory) && oldSubcatNames.includes(subcatObj.subcategory) : false;
    });
    if(intersection.length === 0){
      messageStore.showMessage('No new materials to add from selected subcategories.', 'info');
      showAddSubcategory.value = false;
      return;
    }
  }

  const filteredNew = actuallyNew.filter(subcatId => {
    const subcat = subcategories.value.find((sc: Subcategory) => sc.id === subcatId);
    if (!subcat) return false;
    const subcatName = subcat.subcategory || subcat.id;
    const catName = categories.value.find((c: Category) => c.id === subcat.category_id)?.category || subcat.category_id;
    const catGroup = newAccordionGroups.find((g: any) => g.category === catName);
    if (!catGroup) return false;
    const subGroup = catGroup.subcategories.find((s: any) => s.subcategory === subcatName);
    return subGroup && Array.isArray(subGroup.materials) && subGroup.materials.length > 0;
  });

  // Remove subcategories with no materials from newAccordionGroups
  for (const catGroup of newAccordionGroups) {
    catGroup.subcategories = catGroup.subcategories.filter((subGroup: any) => Array.isArray(subGroup.materials) && subGroup.materials.length > 0);
  }
  accordionGroups.value = newAccordionGroups.filter((catGroup: any) => catGroup.subcategories.length > 0);

  // Update actuallyNew to only include subcategories with materials
  actuallyNew.length = 0;
  actuallyNew.push(...filteredNew);

  // Update selectedSubcategories
  selectedSubcategories.value = [
    ...selectedSubcategories.value,
    ...actuallyNew,
  ];
  accordionGroups.value = newAccordionGroups;
  showAddSubcategory.value = false;

  // Scroll to the first material in the newly added subcategory
  if (actuallyNew.length > 0) {
    nextTick(() => {
      const subcatId = actuallyNew[0];
      // Find the subcategory group
      const subcatGroup = accordionGroups.value
        .flatMap((catGroup: any) => catGroup.subcategories)
        .find((subGroup: any) => {
          const subcatObj = subcategories.value.find(
            (sc) => sc.id === subcatId
          );
          return (
            subGroup.subcategory ===
            (subcatObj ? subcatObj.subcategory : subcatId)
          );
        });
      if (subcatGroup && subcatGroup.materials.length > 0) {
        const firstMaterialId = subcatGroup.materials[0].id;
        const el = document.getElementById(`mat-${firstMaterialId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  }
}

function addMaterials() {
  showAddMaterial.value = false;
  selectedMaterialsModal.value = [];
  selectedSubcategoriesForMaterial.value = [];
}

// Handler for AddMaterialModal @add event
function addMaterialsFromModal(newMaterials: string[]) {
  // newMaterials is an object: { subcategories: string[], materials: string[] }
  const { subcategories, materials: materialIds } = newMaterials as any;
  // Ensure categories and subcategories arrays are sourced from Firestore if empty
  async function ensureLookupsLoaded() {
    if (!(Array.isArray(categories.value) && categories.value.length)) {
      const categoriesSnap = await getDocs(collection(db, "categories"));
      categories.value = categoriesSnap.docs.map((doc) => ({
        id: doc.id,
        category: doc.data().category || "",
      }));
    }
    if (!(Array.isArray(subcategories.value) && subcategories.value.length)) {
      const subcategoriesSnap = await getDocs(collection(db, "subcategories"));
      subcategories.value = subcategoriesSnap.docs.map((doc) => ({
        id: doc.id,
        subcategory: doc.data().subcategory || "",
        category_id: doc.data().category_id || "",
      }));
    }
  }
  // Run lookup check before proceeding
  ensureLookupsLoaded().then(() => {
    const newMaterialObjs = materialIds
      .map((id: string) => materials.value.find((m: Material) => m.id === id))
      .filter(Boolean);

    newMaterialObjs.forEach((mat: Material) => {
      // Check if material already exists
      let exists = false;
      accordionGroups.value.forEach((catGroup: any) => {
        catGroup.subcategories.forEach((subGroup: any) => {
          if (subGroup.materials.some((m: Material) => m.id === mat.id)) {
            exists = true;
          }
        });
      });
      if (exists) return; // Skip if already exists

      // Find category and subcategory info
      const subcatArr = Array.isArray(subcategories.value)
        ? subcategories.value
        : [];
      const catArr = Array.isArray(categories.value) ? categories.value : [];
      const subcat = subcatArr.find(
        (s: Subcategory) => s.id === mat.subcategory_id
      );
      const subcatName = subcat ? subcat.subcategory : "";
      const cat = subcat
        ? catArr.find((c: Category) => c.id === subcat.category_id)
        : undefined;
      const catName = cat ? cat.category : "";

      // Find or create category group
      let catGroup = accordionGroups.value.find(
        (g: any) => g.category === catName
      );
      if (!catGroup) {
        catGroup = { category: catName, subcategories: [] };
        accordionGroups.value.push(catGroup);
      }
      // Find or create subcategory group
      let subGroup = catGroup.subcategories.find(
        (s: any) => s.subcategory === subcatName
      );
      if (!subGroup) {
        subGroup = { subcategory: subcatName, materials: [] };
        catGroup.subcategories.push(subGroup);
      }
      // Add material with highlight
      const newMaterial = { ...mat, highlighted: true, _deleting: false };
      subGroup.materials.unshift(newMaterial);
      // Scroll to the newly added material row
      nextTick(() => {
        const el = document.getElementById(`mat-${newMaterial.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      // Remove highlight after 1s
      setTimeout(() => {
        // Find by id in case array order changes
        const found = subGroup.materials.find((m: Material) => m.id === mat.id);
        if (found) {
          found.highlighted = false;
          subGroup.materials = [...subGroup.materials]; // Force reactivity
          // Force parent array to update as well
          const parentCatGroup = accordionGroups.value.find(
            (g: any) => g.category === catName
          );
          if (parentCatGroup) {
            const subIdx = parentCatGroup.subcategories.findIndex(
              (s: any) => s.subcategory === subcatName
            );
            if (subIdx !== -1) {
              parentCatGroup.subcategories[subIdx] = { ...subGroup };
              accordionGroups.value = [...accordionGroups.value];
            }
          }
        }
      }, 500);

      // Update selectedSubcategories to include this subcategory (lock in modal)
      if (!selectedSubcategories.value.includes(mat.subcategory_id)) {
        selectedSubcategories.value.push(mat.subcategory_id);
      }
    });
    showAddMaterial.value = false;
  });
}




function deleteMaterialAccordion(
  catIdx: number,
  subIdx: number,
  matIdx: number
) {
  const subGroup = accordionGroups.value[catIdx].subcategories[subIdx];
  const materialsArr = subGroup.materials;
  const mat = materialsArr[matIdx];
  if (mat) {
    mat.highlighted = false;
    mat._deleting = true;
    setTimeout(() => {
      materialsArr.splice(matIdx, 1);
      // If all materials are deleted, remove the subcategory accordion
      if (materialsArr.length === 0) {
        // Get subcategory id
        const subcatName = subGroup.subcategory;
        const subcatId = subcategories.value.find(
          (sc) => sc.subcategory === subcatName
        )?.id;
        // Remove subcategory accordion
        accordionGroups.value[catIdx].subcategories.splice(subIdx, 1);
        // Remove from selectedSubcategories as well
        if (subcatId) {
          selectedSubcategories.value = selectedSubcategories.value.filter(
            (id) => id !== subcatId
          );
        }
        // If all subcategories are deleted, remove the category accordion
        if (accordionGroups.value[catIdx].subcategories.length === 0) {
          accordionGroups.value.splice(catIdx, 1);
        }
      }
    }, 200);
  }
}

async function submitOrder() {
  const order: any[] = [];
  if (accordionGroups.value.length == 0) {
    alert("Please select few materials to get started!");
    return;
  }

  for (const catGroup of accordionGroups.value) {
    for (const subGroup of catGroup.subcategories) {
      for (const mat of subGroup.materials) {
        const qty = Number(mat.quantity);
        if (!mat.id || !qty || qty < 1 || isNaN(qty)) {
          alert("Please enter quantity for all materials (minimum 1).");
          return;
        }
        if (route.query.actionType === "Dispatch") {
          const stockAvailable = Number(mat?.stock_at_ho) || 0;
          if (!isNaN(stockAvailable) && qty > stockAvailable) {
            alert(
              `Quantity for material "${mat.material}" exceeds available stock at HO (${stockAvailable}). Please adjust.`
            );
            return;
          }
        } else if (route.query.actionType === "Return" || route.query.actionType === "Consume") {
          const stockAvailable = Number(mat?.stock_available_at_site) || 0;
          if (!isNaN(stockAvailable) && qty > stockAvailable) {
            alert(
              `Quantity for material "${mat.material}" exceeds available stock at Site (${stockAvailable}). Please adjust.`
            );
            return;
          }
        }
        order.push({
          materialId: mat.id,
          quantity: qty,
        });
      }
    }
  }
  // Prepare additional order metadata
  interface OrderMeta {
    actionType: string;
    siteId: string;
    comments: string;
    root_page: string;
    dispatchDate?: string;
    requestDate?: string;
    returnDate?: string;
    deliveryDate?: string;
  }

  let orderMeta: OrderMeta = {
    actionType: typeof route.query.actionType === "string"
      ? route.query.actionType
      : "",
    siteId: siteId.value,
    comments: comments.value,
    root_page: typeof route.query.root_page === "string"
      ? route.query.root_page : "Home",
  };

  if (!comments.value || comments.value.trim().length < 2) {
      alert("Please enter comments (minimum 2 characters).");
      return;
    }

  if (route.query.actionType === "Dispatch") {
    if (!dispatchDate.value) {
      alert("Please select a dispatch date.");
      return;
    }

    orderMeta = {
      ...orderMeta,
      dispatchDate: dispatchDate.value,
    };

    const response = await inventoryStore.submitStockDispatchBulk({ order: order, ...orderMeta });
    if (response && response.route) {
      // Use global message handler
      messageStore.showMessage(response.message, "success");
      router.push(response.route);
    }
  }

  if (route.query.actionType === "Request") {
    if (!requestDate.value) {
      alert("Please select the request date.");
      return;
    }

    orderMeta = {
      ...orderMeta,
      requestDate: requestDate.value,
      deliveryDate: deliveryDate.value,
    };
    const response = await inventoryStore.submitStockRequestBulk({ order: order, ...orderMeta });
    if (response && response.route) {
      // Use global message handler
      messageStore.showMessage(response.message, "success");
      router.push(response.route);
    }
  }

  if (route.query.actionType === "Return") {
    if (!returnDate.value) {
      alert("Please select the return date.");
      return;
    }

    orderMeta = {
      ...orderMeta,
      returnDate: returnDate.value,
    };
    const response = await inventoryStore.submitStockReturnBulk({ order: order, ...orderMeta });
    if (response && response.route) {
      // Use global message handler
      messageStore.showMessage(response.message, "success");
      router.push(response.route);
    }
  }

  if (route.query.actionType === "Consume") {

    orderMeta = {
      ...orderMeta,
    };
    const response = await inventoryStore.submitStockConsumeBulk({ order: order, ...orderMeta });
    if (response && response.route) {
      // Use global message handler
      messageStore.showMessage(response.message, "success");
      router.push(response.route);
    }
  }
}
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

table {
  border-collapse: collapse;
}
th,
td {
  border-bottom: 1px solid #e0e0e0;
}
.shadow-2xl {
  box-shadow: 0 8px 32px 0 rgba(13, 148, 136, 0.12),
    0 1.5px 4px 0 rgba(13, 148, 136, 0.08);
}
.rounded-2xl {
  border-radius: 1rem;
}
.rounded-xl {
  border-radius: 0.75rem;
}
.rounded-lg {
  border-radius: 0.5rem;
}
.rounded-full {
  border-radius: 9999px;
}
.bg-gradient-to-br {
  background: linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 50%, #ccfbf1 100%);
}
.bg-gradient-to-r {
  background: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%);
}
.animate-pulse {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
