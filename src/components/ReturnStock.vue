<template>
  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    style="
      background: linear-gradient(
        135deg,
        rgba(13, 148, 136, 0.25) 0%,
        rgba(255, 255, 255, 0.7) 50%,
        rgba(13, 148, 136, 0.25) 100%
      );
      backdrop-filter: blur(2px);
    "
  >
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg relative p-2">
      <div
        class="relative w-full flex flex-col items-center justify-center py-4 px-2 rounded-t-xl"
      >
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-base"
          aria-label="Close"
        >
          <i class="fas fa-times"></i>
        </button>
        <div
          class="bg-teal-200 rounded-full p-3 flex items-center justify-center shadow mb-2 mx-auto"
        >
          <i class="fas text-lg text-teal-600"
          :class="{
            'fa-undo-alt': props.actionType === 'Return',
            'fa-arrow-down': props.actionType === 'Consume'
          }"
          ></i>
        </div>
        <div class="w-full text-center">
          <div class="text-xl font-bold text-teal-700">{{ props.actionType === 'Return' ? 'Return Stock to HO' : 'Mark Stock Consumption at Site' }}</div>
          <div class="text-xs text-gray-500">
            Select material to {{ props.actionType === 'Return' ? 'return from site' : 'mark consumption at site' }}
          </div>
        </div>
      </div>
      <div class="px-6 bg-white rounded-b-xl">
        <label class="block font-semibold mb-2 text-teal-700 text-xs"
          >Select Site<span class="text-red-500 ml-1">*</span></label
        >
        <Dropdown
          v-model="selectedSite"
          :options="sites"
          :disabled="siteLocked"
          optionLabel="name"
          optionValue="id"
          placeholder="Select a site..."
          class="w-full bg-white border border-teal-300 rounded-lg shadow focus:ring-2 focus:ring-teal-400"
          required
        />
        <div class="bg-white rounded-b-xl mt-5">
          <label class="block font-semibold mb-2 text-teal-700 text-xs"
            >Material<span class="text-red-500 ml-1">*</span></label
          >
          <div
            v-if="loadingMaterials"
            class="w-full flex flex-col items-center justify-center py-8"
          >
            <span class="animate-spin text-3xl text-teal-400 mb-2">
              <i class="fas fa-spinner"></i>
            </span>
            <span class="text-teal-600 text-sm font-semibold"
              >Loading Available Materials...</span
            >
          </div>
          <Dropdown
            v-else
            v-model="selectedMaterial"
            :options="materialOptions"
            optionLabel="label"
            optionValue="value"
            optionGroupLabel="label"
            optionGroupChildren="items"
            filter
            placeholder="Search material..."
            class="w-full mb-6 bg-white border border-teal-300 rounded-lg shadow focus:ring-2 focus:ring-teal-400"
            :itemTemplate="materialItemTemplate"
            :optionGroupTemplate="groupTemplate"
            required
          />
          <div v-if="selectedMaterialObj" class="mt-0">
            <div class="flex gap-4 mb-6" >
              <div class="flex flex-col flex-1 justify-center" v-if="props.actionType === 'Return'">
                <label class="font-semibold mb-1 text-teal-700 text-xs"
                  >Return Date<span class="text-red-500 ml-1">*</span></label
                >
                <input
                  v-model="returnDate"
                  type="date"
                  class="w-full border border-teal-200 rounded px-3 py-2"
                  required
                />
              </div>
              <div class="flex flex-col flex-1 justify-center">
                <label class="font-semibold mb-1 text-teal-700 text-xs"
                  >{{ props.actionType === 'Return' ? 'Return Quantity' : 'Consumption Quantity' }}<span class="text-red-500 ml-1">*</span>
                  <span
                    class="ml-1 inline-block bg-teal-100 text-teal-700 font-semibold rounded px-3 py-1 text-[10px]"
                  >
                    Available ({{
                      selectedMaterialObj.available_at_site
                    }})
                  </span>
                </label>
                <input
                  type="number"
                  v-model.number="returnQty"
                  min="1"
                  :max="selectedMaterialObj.available_at_site"
                  class="w-full p-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-xs"
                  required
                />
              </div>
            </div>

            <div class="bg-white rounded-b-xl">
              <label class="block font-semibold mb-2 text-teal-700 text-xs"
                >Comments<span class="text-red-500 ml-1">*</span></label
              >
              <textarea
                required
                v-model="comments"
                rows="3"
                class="w-full p-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 mb-4 text-xs"
              ></textarea>
              <button
                @click="submitReturn"
                :disabled="
                  !returnQty ||
                  returnQty < 1 ||
                  returnQty > selectedMaterialObj.available_at_site
                "
                class="cursor-pointer px-8 py-3 mb-6 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow transition flex items-center justify-center mx-auto text-xs font-semibold"
              >
                <i class="fas fa-undo-alt mr-2"></i> Return to HO
              </button>
              <div
                v-if="successMessage"
                class="mt-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-center text-base font-medium"
              >
                {{ successMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, watch } from "vue";
import Dropdown from "primevue/dropdown";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useSiteStore } from "@/stores/siteStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useRouter } from "vue-router";
import { useMessageStore } from "@/stores/messageStore";

const props = defineProps<{
  siteId?: string;
  siteLocked?: boolean;
  actionType?: string;
  root_page?: string;
  showModal: boolean;
}>();
const emit = defineEmits(["close"]);

const router = useRouter();
const messageStore = useMessageStore();
const siteStore = useSiteStore();
const selectedSite = ref<string | null>(props.siteId ?? null);
const selectedMaterial = ref<string | null>(null);
const returnQty = ref<number>(1);
const successMessage = ref("");
const siteMaterials = ref<any[]>([]);
const loadingMaterials = ref(false);
const comments = ref("");
const inventoryStore = useInventoryStore();
const today = new Date();
const returnDate = ref<string | null>(today.toISOString().slice(0, 10));

onMounted(async () => {
  await siteStore.fetchAccessibleSites();
  // If siteId is provided via props, load materials immediately
  if (props.siteId) {
    selectedSite.value = props.siteId;
    loadingMaterials.value = true;
    const q = query(
      collection(db, "site_materials"),
      where("site_id", "==", props.siteId)
    );
    const snap = await getDocs(q);
    const rawSiteMaterials = snap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
      .filter((m) => (m.available_at_site ?? 0) > 0);
    const materialIds = rawSiteMaterials
      .map((m) => m.material_id)
      .filter(Boolean);
    let materialsMap: Record<string, any> = {};
    if (materialIds.length > 0) {
      const batchSize = 30;
      for (let i = 0; i < materialIds.length; i += batchSize) {
        const batchIds = materialIds.slice(i, i + batchSize);
        const materialsSnap = await getDocs(
          query(collection(db, "materials"), where("__name__", "in", batchIds))
        );
        materialsSnap.forEach((doc) => {
          materialsMap[doc.id] = { ...doc.data(), id: doc.id };
        });
      }
    }
    const subcategoryIds = Array.from(
      new Set(
        Object.values(materialsMap)
          .map((m) => m.subcategory_id)
          .filter(Boolean)
      )
    );
    let subcategoriesMap: Record<string, any> = {};
    if (subcategoryIds.length > 0) {
      const batchSize = 30;
      for (let i = 0; i < subcategoryIds.length; i += batchSize) {
        const batchIds = subcategoryIds.slice(i, i + batchSize);
        const subcategoriesSnap = await getDocs(
          query(
            collection(db, "subcategories"),
            where("__name__", "in", batchIds)
          )
        );
        subcategoriesSnap.forEach((doc) => {
          subcategoriesMap[doc.id] = { ...doc.data(), id: doc.id };
        });
      }
    }
    const categoryIds = Array.from(
      new Set(
        Object.values(subcategoriesMap)
          .map((sc) => sc.category_id)
          .filter(Boolean)
      )
    );
    let categoriesMap: Record<string, any> = {};
    if (categoryIds.length > 0) {
      const batchSize = 30;
      for (let i = 0; i < categoryIds.length; i += batchSize) {
        const batchIds = categoryIds.slice(i, i + batchSize);
        const categoriesSnap = await getDocs(
          query(collection(db, "categories"), where("__name__", "in", batchIds))
        );
        categoriesSnap.forEach((doc) => {
          categoriesMap[doc.id] = { ...doc.data(), id: doc.id };
        });
      }
    }
    siteMaterials.value = rawSiteMaterials.map((sm) => {
      const material = materialsMap[sm.material_id] || {};
      const subcategory = subcategoriesMap[material.subcategory_id] || {};
      const category = categoriesMap[subcategory.category_id] || {};
      return {
        ...sm,
        material_name: material.material || material.id || "",
        category_name: category.category || category.id || "",
        subcategory_name: subcategory.subcategory || subcategory.id || "",
      };
    });
    loadingMaterials.value = false;
  }
});

watch(selectedSite, async (newSite, oldSite) => {
  if (newSite && newSite !== oldSite) {
    loadingMaterials.value = true;
    const q = query(
      collection(db, "site_materials"),
      where("site_id", "==", newSite)
    );
    const snap = await getDocs(q);
    const rawSiteMaterials = snap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
      .filter((m) => (m.available_at_site ?? 0) > 0);
    const materialIds = rawSiteMaterials
      .map((m) => m.material_id)
      .filter(Boolean);
    let materialsMap: Record<string, any> = {};
    if (materialIds.length > 0) {
      const batchSize = 30;
      for (let i = 0; i < materialIds.length; i += batchSize) {
        const batchIds = materialIds.slice(i, i + batchSize);
        const materialsSnap = await getDocs(
          query(collection(db, "materials"), where("__name__", "in", batchIds))
        );
        materialsSnap.forEach((doc) => {
          materialsMap[doc.id] = { ...doc.data(), id: doc.id };
        });
      }
    }
    const subcategoryIds = Array.from(
      new Set(
        Object.values(materialsMap)
          .map((m) => m.subcategory_id)
          .filter(Boolean)
      )
    );
    let subcategoriesMap: Record<string, any> = {};
    if (subcategoryIds.length > 0) {
      const batchSize = 30;
      for (let i = 0; i < subcategoryIds.length; i += batchSize) {
        const batchIds = subcategoryIds.slice(i, i + batchSize);
        const subcategoriesSnap = await getDocs(
          query(
            collection(db, "subcategories"),
            where("__name__", "in", batchIds)
          )
        );
        subcategoriesSnap.forEach((doc) => {
          subcategoriesMap[doc.id] = { ...doc.data(), id: doc.id };
        });
      }
    }
    const categoryIds = Array.from(
      new Set(
        Object.values(subcategoriesMap)
          .map((sc) => sc.category_id)
          .filter(Boolean)
      )
    );
    let categoriesMap: Record<string, any> = {};
    if (categoryIds.length > 0) {
      const batchSize = 30;
      for (let i = 0; i < categoryIds.length; i += batchSize) {
        const batchIds = categoryIds.slice(i, i + batchSize);
        const categoriesSnap = await getDocs(
          query(collection(db, "categories"), where("__name__", "in", batchIds))
        );
        categoriesSnap.forEach((doc) => {
          categoriesMap[doc.id] = { ...doc.data(), id: doc.id };
        });
      }
    }
    siteMaterials.value = rawSiteMaterials.map((sm) => {
      const material = materialsMap[sm.material_id] || {};
      const subcategory = subcategoriesMap[material.subcategory_id] || {};
      const category = categoriesMap[subcategory.category_id] || {};
      return {
        ...sm,
        material_name: material.material || material.id || "",
        category_name: category.category || category.id || "",
        subcategory_name: subcategory.subcategory || subcategory.id || "",
      };
    });
    loadingMaterials.value = false;
  }
});

const sites = computed(() =>
  siteStore.accessibleSites
    .map((s) => ({ id: s.id, name: s.site }))
    .sort((a, b) => a.name.localeCompare(b.name))
);

const materialOptions = computed(() => {
  const grouped: Record<string, any[]> = {};
  for (const m of siteMaterials.value) {
    const groupLabel = `${m.category_name ?? "Uncategorized"} / ${
      m.subcategory_name ?? "Unsubcategorized"
    }`;
    if (!grouped[groupLabel]) grouped[groupLabel] = [];
    grouped[groupLabel].push({
      label:
        (m.material_name ?? m.material_id ?? "") + ` (${m.available_at_site})`,
      value: m.id,
      available_at_site: m.available_at_site ?? 0,
    });
  }
  Object.values(grouped).forEach((items) =>
    items.sort((a, b) => a.label.localeCompare(b.label))
  );
  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, items]) => ({ label, items }));
});

const selectedMaterialObj = computed(
  () => siteMaterials.value.find((m) => m.id === selectedMaterial.value) ?? null
);

async function submitReturn() {
  if (
    !selectedSite.value ||
    !selectedMaterialObj.value ||
    !returnQty.value ||
    !comments.value ||
    (props.actionType === 'Return' && !returnDate.value)
  ) {
    alert("Please fill all required fields.");
    return;
  }

  if (
    returnQty.value < 1 ||
    returnQty.value > selectedMaterialObj.value.available_at_site
  ) {
    alert("Please enter a valid return quantity.");
    return;
  }

  const returnPayload = {
    siteId: selectedSite.value,
    materialId: selectedMaterialObj.value.material_id,
    quantity: returnQty.value,
    comments: comments.value,
    root_page: props.root_page || "Home",
    returnDate: returnDate.value ?? undefined,
  };

  let response;
  if (props.actionType === 'Consume') {
    returnPayload.returnDate = undefined; // No return date needed for consumption
    response = await inventoryStore.submitConsumeStock(returnPayload);
  }else if (props.actionType === 'Return') {
    response = await inventoryStore.submitReturnStock(returnPayload);
  }else{
    messageStore.showMessage("Invalid action type", "error");
    return;
  }
  
  if (response && response.route) {
    // Use global message handler
    messageStore.showMessage(response.message, "success");
    router.push(response.route);
  }
  emit("close");
}

function materialItemTemplate(option: any) {
  return h("div", { class: "flex items-center gap-2 w-full py-1 px-2" }, [
    h(
      "span",
      { class: "font-medium text-gray-700" },
      `${option.label} (${option.available_at_site})`
    ),
  ]);
}

function groupTemplate(option: any) {
  const [category, subcategory] = option.label.split(" / ");
  return h(
    "div",
    { class: "flex gap-2 items-center py-1 px-2 bg-teal-50 rounded" },
    [
      h(
        "span",
        {
          class:
            "inline-block text-xs font-bold text-white bg-teal-600 rounded-full px-2 py-1",
        },
        category
      ),
      h(
        "span",
        {
          class:
            "inline-block text-xs font-bold text-white bg-orange-500 rounded-full px-2 py-1",
        },
        subcategory
      ),
    ]
  );
}
</script>
<style scoped>
::v-global(.p-select-label) {
  font-size: 0.7rem !important;
  /* Example: adjust as needed */
}

::v-global(.p-select-option) {
  font-size: 0.7rem !important;
  /* Example: adjust as needed */
}

::v-global(.p-select-option-group) {
  font-size: 0.8rem !important;
  /* Example: adjust as needed */
}
</style>
