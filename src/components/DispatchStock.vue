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
      class="bg-white rounded-xl shadow-2xl px-8 py-4 w-full max-w-lg relative overflow-y-auto max-h-[90vh]"
    >
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-base"
        title="Close"
      >
        <i class="fas fa-times"></i>
      </button>
      <div class="flex flex-col items-center mb-3 mt-1">
        <div
          class="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center mb-1"
        >
          <i class="fas fa-truck text-lg text-teal-600"></i>
        </div>
        <h2 class="text-xl font-bold text-teal-700 mb-1">Dispatch Stock</h2>
        <span class="text-gray-500 text-xs"
          >Enter details to dispatch stock to site</span
        >
      </div>
      <form @submit.prevent="dispatchStock" class="grid grid-cols-1 gap-y-4">
        <!-- Site (First Line) -->
        <div>
          <label class="block font-medium mb-1 text-teal-700"
            >Site <span class="text-red-500">*</span></label
          >
          <select
            v-model="form.site"
            required
            :disabled="siteLocked"
            class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
            :class="{'bg-gray-200': siteLocked}"
            >
            <option :disabled="siteLocked" value="">Select Site</option>
            <option v-for="site in sites" :key="site.id" :value="site.id">
              {{ site.name }}
            </option>
          </select>
        </div>
        <!-- Category & Subcategory (Second Line, side by side) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label class="block font-medium mb-1 text-teal-700"
              >Category <span class="text-red-500">*</span></label
            >
            <select
              v-model="form.category"
              required
              class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
            >
              <option disabled value="">Select Category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block font-medium mb-1 text-teal-700"
              >Subcategory <span class="text-red-500">*</span></label
            >
            <select
              v-model="form.subcategory"
              required
              class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
            >
              <option disabled value="">Select Subcategory</option>
              <option
                v-for="sub in subcategories"
                :key="sub.id"
                :value="sub.id"
              >
                {{ sub.name }}
              </option>
            </select>
          </div>
        </div>
        <!-- Material (Next Line) -->
        <div>
          <label class="block font-medium mb-2 text-teal-700"
            >Material

            <span class="text-red-500">*</span>
            <span
              v-if="form.material != ''"
              class="ml-2 text-[10px] px-2 py-1 rounded bg-teal-100 text-teal-700 font-semibold"
              >Available at HO: {{ stockAtHo }}</span
            >
          </label>
          <select
            v-model="form.material"
            required
            class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
          >
            <option disabled value="">Select Material</option>
            <option v-for="mat in materials" :key="mat.id" :value="mat.id">
              {{ mat.material }}
            </option>
          </select>
        </div>

        <!-- Quantity & Date of Dispatch (Same Line, UOM as extension in input) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label class="block font-medium mb-1 text-teal-700"
              >Quantity <span class="text-red-500">*</span></label
            >
            <div class="flex items-center gap-2">
              <div class="relative w-full">
                <input
                  v-model.number="form.quantity"
                  type="number"
                  min="1"
                  class="w-full p-2 pr-12 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
                  required
                />
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none"
                >
                  {{ uom || "PCS" }}
                </span>
              </div>
            </div>
          </div>
          <div>
            <label class="block font-medium mb-1 text-teal-700"
              >Date of Dispatch <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.dispatchDate"
              type="date"
              class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>
        </div>
        <!-- Comments (Last Line) -->
        <div>
          <label class="block font-medium mb-1 text-teal-700"
            >Comments <span class="text-red-500">*</span></label
          >
          <textarea
            v-model="form.comments"
            required
            rows="2"
            class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
          ></textarea>
        </div>
        <div class="text-center mt-0">
          <button
            type="submit"
            class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded shadow transition flex items-center justify-center mx-auto"
          >
            <i class="fas fa-truck mr-2"></i> Dispatch
          </button>
        </div>
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
import { ref, computed, watch, onMounted } from "vue";
import { useSiteStore } from "@/stores/siteStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useMessageStore } from "@/stores/messageStore";
import { useRouter } from "vue-router";

const router = useRouter();
const siteStore = useSiteStore();
const inventoryStore = useInventoryStore();
const messageStore = useMessageStore();
const emit = defineEmits(["close"]);

const props = defineProps({
  siteId: {
    type: String,
    required: false,
  },
  siteLocked: Boolean,
  root_page: {
    type: String,
    default: "Home",
  },
});

onMounted(async () => {
  await siteStore.fetchActiveSites();
  await inventoryStore.fetchCategories();
});

const form = ref({
  category: "",
  material: "",
  subcategory: "",
  quantity: 1,
  site: props.siteId || "",
  dispatchDate: new Date().toISOString().slice(0, 10),
  comments: "",
  uom: "",
});

const successMessage = ref("");
const uom = ref("");
const stockAtHo = ref(0);

const sites = computed(() =>
  siteStore.activeSites
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
  const subcatArr = inventoryStore.subcategoriesByCategoryList.filter(
    (sc) => sc.category_id === catObj.id
  );
  return subcatArr
    .map((sc) => ({ id: sc.id, name: sc.subcategory }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const materials = computed(() => {
  // Find subcategory object by subcategory name
  const subcatObj = inventoryStore.subcategoriesByCategoryList.find(
    (sc) => sc.id === form.value.subcategory
  );
  if (!subcatObj) return [];
  // Find all materials with matching subcategory_id
  return inventoryStore.materialsBySubcategoryList
    .filter((msc) => msc.subcategory_id === subcatObj.id)
    .map((msc) => ({
      id: msc.id,
      material: msc.material,
      uom: msc.uom,
      stock_at_ho: msc.stock_at_ho,
    }))
    .sort((a: { material: string }, b: { material: string }) =>
      a.material.localeCompare(b.material)
    );
});

watch(
  () => form.value.category,
  async (categoryId) => {
    form.value.material = "";
    form.value.subcategory = "";
    uom.value = "";
    if (categoryId) {
      await inventoryStore.fetchSubcategoriesByCategory(categoryId);
    }
  }
);

watch(
  () => form.value.subcategory,
  async (subcategoryId) => {
    form.value.material = "";
    uom.value = "";
    // Defensive: get subcategory id from subcategoriesByCategoryList
    const subcatObj = inventoryStore.subcategoriesByCategoryList.find(
      (sc) => sc.id === subcategoryId
    );
    if (subcatObj && subcatObj.id) {
      await inventoryStore.fetchMaterialsBySubcategory(subcatObj.id);
    }
  }
);

watch(
  () => form.value.material,
  (materialId) => {
    const found = materials.value.find(
      (m: {
        id: string;
        material: string;
        uom?: string;
        stock_at_ho?: number;
      }) => m.id === materialId
    );
    uom.value = found?.uom || "";
    stockAtHo.value = found?.stock_at_ho || 0;
  }
);

const dispatchStock = async () => {
  // Validate mandatory fields
  if (
    !form.value.site ||
    !form.value.category ||
    !form.value.subcategory ||
    !form.value.material ||
    !form.value.quantity ||
    !form.value.dispatchDate ||
    !form.value.comments
  ) {
    alert("Please fill all mandatory fields.");
    return;
  }

  if (form.value.quantity <= 0) {
    alert("Quantity must be greater than zero.");
    return;
  }

  if (form.value.quantity > stockAtHo.value) {
    alert("Adjust the quantity to be less than or equal to stock at hand.");
    return;
  }

  try {
    const requestPayload = {
      materialId: form.value.material,
      quantity: form.value.quantity,
      siteId: form.value.site,
      dispatchDate: form.value.dispatchDate,
      comments: form.value.comments,
      root_page: props.root_page,
    };

    const response = await inventoryStore.dispatchStock(requestPayload);

    // Show global message and route if response exists
    if (response && response.route) {
      // Use global message handler
      messageStore.showMessage(response.message, "success");
      router.push(response.route);
    }
    emit("close");
  } catch (err: any) {
    console.log("❌ Error: " + err.message);
  }
};
</script>
