<template>
  <div class="flex flex-col">
        <nav
      class="flex items-center mb-0 pl-2 py-2"
      aria-label="Breadcrumb"
      style="background: linear-gradient(90deg, #81e6d9 0%, #f0fdfa 100%)"
    >
      <ol class="flex items-center space-x-1">
        <li>
          <router-link
            to="/home"
            class="inline-flex items-center px-2 py-1 rounded-full bg-white text-teal-700 font-semibold text-[9px] hover:bg-teal-200 transition"
            aria-current="page"
          >
            <i class="fas fa-building mr-1"></i>Home
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
            Stock
          </span>
        </li>
      </ol>
    </nav>
    <div class="p-4">
      <div class="w-full bg-white rounded">
        <div class="flex items-center gap-3">
          <div class="bg-teal-200 rounded-full p-2">
            <i class="fas fa-box-open text-xl text-teal-700"></i>
          </div>
          <h2 class="text-lg font-bold text-teal-700">
            {{ route.query.actionType }} Supplier for Bulk Stock
          </h2>
        </div>

        <div class="px-4">
          <div class="flex flex-col md:flex-row items-center gap-6 mt-8 mb-10">
            <div class="flex flex-col gap-2">
              <label class="font-medium text-teal-700">Supplier Name <span class="text-red-500">*</span></label>
              <select
                v-model="supplier"
                required
                class="w-60 p-1.5 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400 text-xs"
              >
                <option disabled value="">Select Supplier</option>
                <option
                  v-for="sup in suppliers"
                  :key="sup.id"
                  :value="sup.id"
                >
                  {{ sup.name }}
                </option>
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium text-teal-700">Ordered Date <span class="text-red-500">*</span></label>
              <input
                v-model="orderedDate"
                type="date"
                class="w-60 p-1.5 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400 text-xs"
                required
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium text-teal-700">{{ route.query.actionType == "Request" ? "Expected Delivery" : "Received" }} Date</label>
              <input
                v-model="deliveryDate"
                type="date"
                class="w-60 p-1.5 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400 text-xs"
              />
            </div>
          </div>
          <div class="flex items-center justify-center mb-8">
            <div class="w-full border-t border-dashed border-teal-300"></div>
          </div>
          <!-- Bulk Stock Entry Form -->
          <form @submit.prevent="submitBulkStock">
            <div
              v-for="(stock, idx) in stocks"
              :key="idx"
              class="mb-8"
            >
              <!-- Line 1: Category, Subcategory, Material, Quantity -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 mb-4">
                
                <div>
                  <label class="block font-medium mb-1 text-teal-700">Category & Subcategory <span class="text-red-500">*</span></label>
                  <select
                    v-model="stock.subcategory"
                    required
                    class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
                  >
                    <option disabled value="">Select Category & Subcategory</option>
                    <optgroup
                      v-for="cat in categories"
                      :key="cat.id"
                      :label="cat.name"
                    >
                      <option
                        v-for="sub in filteredSubcategories(cat.id)"
                        :key="sub.id"
                        :value="sub.id"
                      >
                        {{ sub.name }}
                      </option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label class="block font-medium mb-1 text-teal-700">Material <span class="text-red-500">*</span></label>
                  <select
                    v-model="stock.material"
                    required
                    class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
                    :disabled="!stock.subcategory"
                  >
                    <option disabled value="">Select Material</option>
                    <option
                      v-for="mat in filteredMaterials(stock.subcategory)"
                      :key="mat.id"
                      :value="mat.id"
                    >
                      {{ mat.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block font-medium mb-1 text-teal-700">Quantity <span class="text-red-500">*</span></label>
                  <div class="relative w-full flex items-center gap-2">
                    <input
                      v-model.number="stock.quantity"
                      type="number"
                      min="1"
                      class="w-full p-2 pr-12 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
                      required
                    />
                    <span
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none"
                    >
                      {{ getUom(stock.material) || "PCS" }}
                    </span>
                  </div>
                </div>
                <div class="flex items-end justify-start mb-2">
                  <button
                    type="button"
                    @click="removeStock(idx)"
                    class="text-red-500 hover:text-red-700 text-sm flex items-center"
                    v-if="stocks.length > 1"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
                
              </div>

              <!-- Remove Button -->
              <!-- <div class="flex justify-end md:items-end mt-4 md:mt-0"> -->
                
              <!-- </div> -->
            </div>
            <div class="flex justify-between items-center mb-6">
              <button
                type="button"
                @click="addStockRow"
                class="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded shadow flex items-center gap-2"
              >
                <i class="fas fa-plus"></i> Add Another Stock
              </button>
            </div>
            <div class="w-96 mt-4">
                <label class="block font-medium mb-1 text-teal-700"
                >Comments <span class="text-red-500">*</span></label>
                <textarea
                v-model="comments"
                rows="2"
                class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400"
                required
                ></textarea>
            </div>
            <div class="text-center mt-4">
              <button
                type="submit"
                class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded shadow transition flex items-center justify-center mx-auto"
              >
                <i class="fas fa-layer-group mr-2"></i> {{ route.query.actionType }} Stock
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
        <!-- Supplier Dropdown (Common for all, centered and smaller) -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, query } from "firebase/firestore";
import { useRoute, useRouter } from "vue-router";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useMessageStore } from "@/stores/messageStore";

const emit = defineEmits(["close"]);

const router = useRouter();
const messageStore = useMessageStore();

// State for suppliers, categories, subcategories, materials
const supplier = ref("");
const comments = ref(""); // Added description ref
const suppliers = ref<{ id: string; name: string }[]>([]);
const categories = ref<{ id: string; name: string }[]>([]);
const subcategories = ref<{ id: string; name: string; category_id: string }[]>([]);
const materials = ref<{ id: string; name: string; subcategory_id: string; uom: string }[]>([]);
const route = useRoute();
const orderedDate = ref("");
const deliveryDate = ref("");

const inventoryStore = useInventoryStore();


const stocks = ref([
  {
    category: "",
    subcategory: "",
    material: "",
    quantity: 1,
  },
]);

const successMessage = ref("");
const subcategoriesByCategory = computed(() => {
  const groups: Record<string, { id: string; name: string }[]> = {};
  for (const sub of subcategories.value) {
    if (!groups[sub.category_id]) {
      groups[sub.category_id] = [];
    }
    groups[sub.category_id].push({ id: sub.id, name: sub.name });
  }
  return groups;
});
// Fetch all dropdown data from Firestore
onMounted(async () => {
  // Pre-fill ordered date with today's date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  orderedDate.value = `${yyyy}-${mm}-${dd}`;

  // Suppliers
  const supplierSnap = await getDocs(collection(db, "suppliers"));
  suppliers.value = supplierSnap.docs
    .map((doc) => ({
      id: doc.id,
      name: doc.data().suppliers_name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Categories
  const catSnap = await getDocs(collection(db, "categories"));
  categories.value = catSnap.docs
    .map((doc) => ({
      id: doc.id,
      name: doc.data().category,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Subcategories
  const subcatSnap = await getDocs(collection(db, "subcategories"));
  subcategories.value = subcatSnap.docs
    .map((doc) => ({
      id: doc.id,
      name: doc.data().subcategory,
      category_id: doc.data().category_id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Materials
  const matSnap = await getDocs(collection(db, "materials"));
  materials.value = matSnap.docs
    .map((doc) => ({
      id: doc.id,
      name: doc.data().material,
      subcategory_id: doc.data().subcategory_id,
      uom: doc.data().uom,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

// Filter subcategories based on selected category
const filteredSubcategories = (categoryId: string) =>
  subcategories.value.filter((sc) => sc.category_id === categoryId);

// Filter materials based on selected subcategory
const filteredMaterials = (subcategoryId: string) =>
  materials.value.filter((m) => m.subcategory_id === subcategoryId);

// Get UOM for selected material
const getUom = (materialId: string) => {
  const mat = materials.value.find((m) => m.id === materialId);
  return mat ? mat.uom : "";
};

const addStockRow = () => {
  stocks.value.push({
    category: "",
    subcategory: "",
    material: "",
    quantity: 1,
  });
};

const removeStock = (idx: number) => {
  if (stocks.value.length > 1) stocks.value.splice(idx, 1);
};

const submitBulkStock = async () => {

try{


  if (!supplier.value || !orderedDate.value || stocks.value.some(stock => !stock.material || !stock.quantity)) {
    successMessage.value = "Please fill all mandatory fields.";
    return;
  }

  const bulkStockData = {
    supplierId: supplier.value,
    requestDate: orderedDate.value,
    deliveryDate: deliveryDate.value,
    comments: comments.value,
    order: stocks.value.map(stock => ({
      materialId: stock.material,
      quantity: stock.quantity
    }))
  };

  const response = await inventoryStore.submitSupplierRestockRequestBulk(bulkStockData);

  if (response && response.route) {
    // Use global message handler
    messageStore.showMessage(response.message, "success");
    router.push(response.route);
  }
  emit("close");

  } catch (err: any) {
    successMessage.value = "❌ Error: " + err.message;
  }
};
</script>
