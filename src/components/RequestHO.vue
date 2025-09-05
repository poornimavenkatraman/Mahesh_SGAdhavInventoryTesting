<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useSiteStore } from "@/stores/siteStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useRouter } from "vue-router";
import { useMessageStore } from "@/stores/messageStore";
import { useThemeColors } from "@/composables/useThemeColors";

const theme = useThemeColors('error');
const themeAccent = useThemeColors('error');

const siteStore = useSiteStore();
const inventoryStore = useInventoryStore();
const router = useRouter();
const messageStore = useMessageStore();

const emit = defineEmits(["close"]);
const props = defineProps({
  siteId: String,
  siteLocked: Boolean,
  root_page: { type: String, default: "Home" }
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

watch(
  () => props.siteId,
  (newSite) => {
    if (newSite?.id) {
      form.value.site = newSite.id;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await siteStore.fetchAccessibleSites();
  await inventoryStore.fetchCategories();
});

const sites = computed(() =>
  siteStore.accessibleSites.map((s) => ({ id: s.id, name: s.site })).sort((a, b) => a.name.localeCompare(b.name))
);
const categories = computed(() =>
  inventoryStore.categories.map((c) => ({ id: c.id, name: c.category })).sort((a, b) => a.name.localeCompare(b.name))
);
const subcategories = computed(() => {
  const catObj = inventoryStore.categories.find((c) => c.id === form.value.category);
  if (!catObj) return [];
  return inventoryStore.subcategoriesByCategoryList
    .filter((sc) => sc.category_id === catObj.id)
    .map((sc) => ({ id: sc.id, name: sc.subcategory }))
    .sort((a, b) => a.name.localeCompare(b.name));
});
const materials = computed(() => {
  const subcatObj = inventoryStore.subcategoriesByCategoryList.find((sc) => sc.id === form.value.subcategory);
  if (!subcatObj) return [];
  return inventoryStore.materialsBySubcategoryList
    .filter((msc) => msc.subcategory_id === subcatObj.id)
    .map((msc) => ({ id: msc.id, name: msc.material, uom: msc.uom }))
    .sort((a, b) => a.name.localeCompare(b.name));
});
const selectedUom = computed(() => {
  const mat = materials.value.find((m) => m.id === form.value.material);
  return mat ? mat.uom : "";
});

watch(() => form.value.category, async (categoryId) => {
  form.value.subcategory = "";
  form.value.material = "";
  const catObj = inventoryStore.categories.find((c) => c.id === categoryId);
  if (catObj?.id) await inventoryStore.fetchSubcategoriesByCategory(catObj.id);
});

watch(() => form.value.subcategory, async (subcategoryId) => {
  form.value.material = "";
  const subcatObj = inventoryStore.subcategoriesByCategoryList.find((sc) => sc.id === subcategoryId);
  if (subcatObj?.id) await inventoryStore.fetchMaterialsBySubcategory(subcatObj.id);
});

async function submitRequest() {
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
  if (response?.route) {
    messageStore.showMessage(response.message, "success");
    router.push(response.route);
  }
  emit("close");
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    :style="{ background: colorTokens.backdropGradient.error, backdropFilter: 'blur(2px)' }"
  >
    <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400"
        :class="theme.hoverText"
        title="Close"
      >
        <i class="fas fa-times"></i>
      </button>

      <!-- Title -->
      <div class="flex flex-col items-center mb-6">
        <div class="w-12 h-12 rounded-full flex items-center justify-center mb-2" :class="theme.bg">
          <i class="fas fa-boxes-stacked text-xl" :class="theme.text"></i>
        </div>
        <h2 class="text-xl font-bold mb-1" :class="theme.text">Request HO for Stock</h2>
        <span class="text-xs text-gray-500">Enter details to request HO for stock towards site</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitRequest">
        <!-- Site -->
        <div class="mb-4">
          <label class="block font-semibold mb-1" :class="theme.text">Site <span class="text-red-500">*</span></label>
          <select v-model="form.site" required :disabled="siteLocked" class="w-full p-2 border rounded"
            :class="[theme.border, theme.ring, { 'bg-gray-200': siteLocked }]">
            <option value="">Select Site</option>
            <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <!-- Category & Subcategory -->
        <div class="mb-4 flex gap-4">
          <div class="flex-1">
            <label class="block font-semibold mb-1" :class="theme.text">Category <span class="text-red-500">*</span></label>
            <select v-model="form.category" required class="w-full p-2 border rounded" :class="[theme.border, theme.ring]">
              <option value="">Select Category</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block font-semibold mb-1" :class="theme.text">SubCategory <span class="text-red-500">*</span></label>
            <select v-model="form.subcategory" required class="w-full p-2 border rounded" :class="[theme.border, theme.ring]">
              <option value="">Select SubCategory</option>
              <option v-for="sc in subcategories" :key="sc.id" :value="sc.id">{{ sc.name }}</option>
            </select>
          </div>
        </div>

        <!-- Material & Quantity -->
        <div class="mb-4 flex gap-4">
          <div class="flex-1">
            <label class="block font-semibold mb-1" :class="theme.text">Material <span class="text-red-500">*</span></label>
            <select v-model="form.material" required class="w-full p-2 border rounded" :class="[theme.border, theme.ring]">
              <option value="">Select Material</option>
              <option v-for="p in materials" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block font-semibold mb-1" :class="theme.text">Quantity <span class="text-red-500">*</span></label>
            <div class="relative">
              <input v-model="form.quantity" type="number" min="1" required class="w-full p-2 border rounded pr-12"
                :class="[theme.border, theme.ring]" />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 font-semibold" :class="theme.text">
                {{ selectedUom || "PCS" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="mb-4 flex gap-4">
          <div class="flex-1">
            <label class="block font-semibold mb-1" :class="theme.text">Request Date <span class="text-red-500">*</span></label>
            <input v-model="form.requestDate" type="date" required class="w-full p-2 border rounded"
              :class="[theme.border, theme.ring]" />
          </div>
          <div class="flex-1">
            <label class="block font-semibold mb-1" :class="theme.text">Expected Delivery Date</label>
            <input v-model="form.deliveryDate" type="date" class="w-full p-2 border rounded" :class="[theme.border, theme.ring]" />
          </div>
        </div>

        <!-- Comments -->
        <div class="mb-4">
          <label class="block font-semibold mb-1" :class="theme.text">Comments <span class="text-red-500">*</span></label>
          <textarea v-model="form.comments" required rows="2" class="w-full p-2 border rounded"
            :class="[theme.border, theme.ring]"></textarea>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit"
            class="px-4 py-2 rounded text-white font-semibold"
            :class="[themeAccent.bg, themeAccent.hoverBg]">
            Request
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
