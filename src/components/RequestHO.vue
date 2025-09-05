<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useSiteStore } from "@/stores/siteStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useRouter } from "vue-router";
import { useMessageStore } from "@/stores/messageStore"

const siteStore = useSiteStore();
const inventoryStore = useInventoryStore();
const router = useRouter();
const messageStore = useMessageStore();

const emit = defineEmits(["close"]);
const props = defineProps({
  siteId: {
    type: String,
    required: false
  },
  siteLocked: Boolean,
  root_page: {
    type: String,
    default: "Home"
  }
});

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const form = ref({
  site: props.siteId,
  category: "",
  subcategory: "",
  material: "",
  quantity: "",
  requestDate: today.toISOString().slice(0, 10),
  deliveryDate: tomorrow.toISOString().slice(0, 10),
  comments: "",
});

// Watch for changes in props.site and update form.site accordingly
watch(
  () => props.siteId,
  (newSite) => {
    if (newSite && newSite.id) {
      form.value.site = newSite.id;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await siteStore.fetchAccessibleSites();
  await inventoryStore.fetchCategories();

  // Preselect requestDate as today and deliveryDate as tomorrow
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  form.value.requestDate = today.toISOString().slice(0, 10);
  form.value.deliveryDate = tomorrow.toISOString().slice(0, 10);
});

const sites = computed(() =>
  siteStore.accessibleSites
    .map((s) => ({ id: s.id, name: s.site }))
    .sort((a, b) => a.name.localeCompare(b.name))
);
const categories = computed(() =>
  inventoryStore.categories
    .map((c) => ({ id: c.id, name: c.category }))
    .sort((a, b) => a.name.localeCompare(b.name))
);
const subcategories = computed(() => {
  const catObj = inventoryStore.categories.find(
    (c) => c.id === form.value.category
  );
  if (!catObj) return [];
  return inventoryStore.subcategoriesByCategoryList
    .filter((sc) => sc.category_id === catObj.id)
    .map((sc) => ({ id: sc.id, name: sc.subcategory }))
    .sort((a, b) => a.name.localeCompare(b.name));
});
const materials = computed(() => {
  const subcatObj = inventoryStore.subcategoriesByCategoryList.find(
    (sc) => sc.id === form.value.subcategory
  );
  if (!subcatObj) return [];
  return inventoryStore.materialsBySubcategoryList
    .filter((msc) => msc.subcategory_id === subcatObj.id)
    .map((msc) => ({ id: msc.id, name: msc.material, uom: msc.uom }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

watch(
  () => form.value.category,
  async (categoryId) => {
    form.value.subcategory = "";
    form.value.material = "";
    // Defensive: get category id from categories
    const catObj = inventoryStore.categories.find(
      (c) => c.id === categoryId
    );
    if (catObj && catObj.id) {
      await inventoryStore.fetchSubcategoriesByCategory(catObj.id);
    }
  }
);

watch(
  () => form.value.subcategory,
  async (subcategoryId) => {
    form.value.material = "";
    // Defensive: get subcategory id from subcategoriesByCategoryList
    const subcatObj = inventoryStore.subcategoriesByCategoryList.find(
      (sc) => sc.id === subcategoryId
    );
    if (subcatObj && subcatObj.id) {
      await inventoryStore.fetchMaterialsBySubcategory(subcatObj.id);
    }
  }
);

const selectedUom = computed(() => {
  const mat = materials.value.find((m) => m.name === form.value.material);
  return mat ? mat.uom : "";
});

async function submitRequest() {
  // Validate mandatory fields except deliveryDate
  if (
    !form.value.site ||
    !form.value.category ||
    !form.value.subcategory ||
    !form.value.material ||
    !form.value.quantity ||
    !form.value.requestDate ||
    !form.value.comments
  ) {
    alert("Please fill all mandatory fields.");
    return;
  }

  const requestPayload = {
    siteId: form.value.site,
    materialId: form.value.material,
    quantity: form.value.quantity,
    requestDate: form.value.requestDate,
    deliveryDate: form.value.deliveryDate,
    comments: form.value.comments,
    root_page: props.root_page
  };

  const response = await inventoryStore.submitStockRequest(requestPayload);

  // Show global message and route if response exists
  if (response && response.route) {
    // Use global message handler
    messageStore.showMessage(response.message, "success");
    router.push(response.route);
  }
  emit("close");
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
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
    <div
      class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative overflow-y-auto max-h-[90vh]"
    >
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-base"
        title="Close"
      >
        <i class="fas fa-times"></i>
      </button>
      <div class="flex flex-col items-center mb-6">
        <div
          class="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center mb-2"
        >
          <i class="fas fa-boxes-stacked text-xl text-teal-600"></i>
        </div>
        <h2 class="text-xl font-bold text-teal-700 mb-1">
          Request HO for Stock
        </h2>
        <span class="text-gray-500 text-xs"
          >Enter details to request HO for stock towards site</span
        >
      </div>

      <form @submit.prevent="submitRequest">
        <div class="mb-4 flex gap-4">
          <div class="flex-1">
            <label class="block font-semibold text-teal-700 mb-1"
              >Site <span class="text-red-500">*</span></label
            >
            <select
              v-model="form.site"
              class="w-full border border-teal-200 rounded px-3 py-2"
              :disabled="siteLocked"
              required
            >
              <option value="">Select Site</option>
              <option v-for="s in sites" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>
        </div>
        <!-- Category & Subcategory (Second Line) -->
        <div class="mb-4 flex gap-4">
          <div class="flex-1">
            <label class="block font-semibold text-teal-700 mb-1"
              >Category <span class="text-red-500">*</span></label
            >
            <select
              v-model="form.category"
              class="w-full border border-teal-200 rounded px-3 py-2"
              required
            >
              <option value="">Select Category</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block font-semibold text-teal-700 mb-1"
              >SubCategory <span class="text-red-500">*</span></label
            >
            <select
              v-model="form.subcategory"
              class="w-full border border-teal-200 rounded px-3 py-2"
              required
            >
              <option value="">Select SubCategory</option>
              <option v-for="sc in subcategories" :key="sc.id" :value="sc.id">
                {{ sc.name }}
              </option>
            </select>
          </div>
        </div>
        <!-- Material & Quantity -->
        <div class="mb-4 flex gap-4 items-end">
          <div class="flex-1">
            <label class="block font-semibold text-teal-700 mb-1"
              >Material <span class="text-red-500">*</span></label
            >
            <select
              v-model="form.material"
              class="w-full border border-teal-200 rounded px-3 py-2"
              required
            >
              <option value="">Select Material</option>
              <option v-for="p in materials" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block font-semibold text-teal-700 mb-1"
              >Quantity <span class="text-red-500">*</span></label
            >
            <div class="relative">
              <input
                v-model="form.quantity"
                type="number"
                min="1"
                required
                class="w-full border border-teal-200 rounded px-3 py-2 pr-12"
              />
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 text-teal-700 font-semibold"
                >{{ selectedUom || "PCS" }}</span
              >
            </div>
          </div>
        </div>
        <!-- Dates -->
        <div class="mb-4 flex gap-4">
          <div class="flex-1">
            <label class="block font-semibold text-teal-700 mb-1"
              >Request Date <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.requestDate"
              type="date"
              class="w-full border border-teal-200 rounded px-3 py-2"
              required
            />
          </div>
          <div class="flex-1">
            <label class="block font-semibold text-teal-700 mb-1"
              >Expected Delivery Date</label
            >
            <input
              v-model="form.deliveryDate"
              type="date"
              class="w-full border border-teal-200 rounded px-3 py-2"
            />
          </div>
        </div>
        <!-- Description -->
        <div class="mb-4">
          <label class="block font-semibold text-teal-700 mb-1"
            >Comments <span class="text-red-500">*</span></label
          >
          <textarea
            v-model="form.comments"
            rows="2"
            required
            class="w-full border border-teal-200 rounded px-3 py-2"
          ></textarea>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700"
          >
            Request
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
