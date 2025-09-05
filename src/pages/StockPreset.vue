<template>
  <div class="p-4">
    <div class="flex items-center gap-3 mb-2">
      <div class="bg-red-200 rounded-full p-2">
        <i class="fas fa-th-list text-xl text-red-700"></i>
      </div>
      <h2 class="text-lg font-bold text-red-700">Stock Presets</h2>
      <div class="flex-1"></div>
      <!-- Add Category Icon Button -->
      <button class="ml-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
        title="Create a new Category" @click="addCategory">
        <i class="fas fa-hard-hat"></i>
      </button>
      <!-- Add Subcategory Icon Button -->
      <button class="ml-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
        title="Create a new Subcategory" @click="showAddSubcategory = true">
        <i class="fas fa-layer-group"></i>
      </button>
      <!-- Add New Material Icon Button -->
      <button class="ml-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
        title="Add New Material" @click="showAddMaterial = true">
        <i class="fas fa-box"></i>
      </button>
    </div>
    <div v-for="category in sortedCategories" :key="category.id" class="p-3">
      <div class="flex items-center mb-3">
        <div class="text-base font-semibold text-red-600">
          <i class="fas fa-hard-hat mr-2"></i>{{ category.category }}
        </div>
        <!-- <div class="flex-1"></div> -->
        <button class="ml-5 text-red-600 hover:text-red-900 p-2 bg-red-100 rounded-full border border-red-200  shadow-sm transition" @click="editCategory(category)" title="Edit Category">
          <i class="fas fa-edit"></i>
        </button>
        <!-- <button class="ml-1 text-red-600 hover:text-red-900 p-2 rounded-full border border-red-200 bg-red-100 shadow-sm transition" @click="deleteCategory(category)" title="Delete Category">
          <i class="fas fa-trash"></i>
        </button> -->
      </div>
      <div class="flex gap-4 overflow-x-auto pb-2">
        <div v-for="sub in sortedSubcategories(category.id)" :key="sub.id"
          class="border-t-4 border-red-200 min-w-[150px] bg-white rounded-xl shadow-md p-5 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer relative"
          @click="openSubcategoryPreset(sub, category)">
          <i class="fas fa-layer-group text-3xl text-red-500 mb-2"></i>
          <span class="font-semibold text-red-700 mb-1">{{ sub.subcategory }}</span>
          <span class="text-gray-500 text-sm mb-1">{{ sub.desc || '' }}</span>
          <span class="text-xs text-red-600 font-semibold">
            {{ materialCount(sub.id) }} material{{ materialCount(sub.id) === 1 ? '' : 's' }}
          </span>
          <!-- Options menu -->
          <div class="absolute top-2 right-2">
            <div class="relative group">
              <button class="p-1 rounded-full hover:bg-gray-200" @click.stop="sub.optionsOpen = !sub.optionsOpen">
                <i class="fas fa-ellipsis-v text-gray-400"></i>
              </button>
              <div v-if="sub.optionsOpen" class="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
                <button class="w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2" @click.stop="editSubcategory(sub, category)"><i class="fas fa-edit"></i> Edit</button>
                <!-- <button class="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2" @click.stop="deleteSubcategory(sub)"><i class="fas fa-trash"></i> Delete</button> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AddCategory :open="showAddCategory" @close="showAddCategory = false" @added="refreshCategories" :editCategory="editingCategory" @edited="refreshCategories" />
    <AddSubcategory :open="showAddSubcategory" @close="showAddSubcategory = false" @added="refreshCategories" />
    <AddInventory :open="showAddMaterial" @close="onCloseAddMaterial" @added="refreshCategories" />
    <SubcategoryPreset
      :open="showSubcategoryPreset"
      :subcategoryId="selectedSubcategory?.id"
      :categoryName="selectedCategory?.category"
      :subcategoryName="selectedSubcategory?.subcategory"
      :category="selectedCategory"
      :materials="inventoryStore.materials"
      @close="showSubcategoryPreset = false"
    />
    <EditSubcategoryModal
      :open="showEditSubcategory"
      :subcategory="editingSubcategory"
      @close="showEditSubcategory = false"
      @submit="(newName, errorCallback) => submitEditSubcategory(newName, errorCallback)"
    />
  </div>
</template>

<script setup>
import SubcategoryPreset from "@/components/SubcategoryPreset.vue";
import EditSubcategoryModal from "@/components/EditSubcategoryModal.vue";
import { ref, onMounted, computed, onBeforeUnmount, watch } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";
import AddCategory from "@/components/AddCategory.vue";
import AddSubcategory from "@/components/AddSubcategory.vue";
import AddInventory from "@/components/AddInventory.vue";
import { useMessageStore } from "@/stores/messageStore";

const inventoryStore = useInventoryStore();
const messageStore = useMessageStore();
const showAddCategory = ref(false);
const showAddSubcategory = ref(false);
const showSubcategoryPreset = ref(false);
const showAddMaterial = ref(false);
const selectedSubcategory = ref(null);
const selectedCategory = ref(null);
const editingCategory = ref(null);
const editingSubcategory = ref(null);
const showEditSubcategory = ref(false);
const subOptionsRefs = ref([]);
const editSubcategoryName = ref("");
const editSubcategoryCategory = ref("");
const editSubcategoryDesc = ref("");

function openSubcategoryPreset(sub, category) {
  selectedSubcategory.value = sub;
  selectedCategory.value = category;
  showSubcategoryPreset.value = true;
}

function refreshCategories() {
  inventoryStore.fetchCategories();
  inventoryStore.fetchSubcategories();
  inventoryStore.fetchMaterials();
}

onMounted(() => {
  inventoryStore.fetchCategories();
  inventoryStore.fetchSubcategories();
  inventoryStore.fetchMaterials();
  document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const sortedCategories = computed(() =>
  [...inventoryStore.categories].sort((a, b) => a.category.localeCompare(b.category))
);

function sortedSubcategories(category_id) {
  return inventoryStore.subcategories
    .filter(s => s.category_id === category_id)
    .sort((a, b) => a.subcategory.localeCompare(b.subcategory));
}

function materialCount(subcategory_id) {
  return inventoryStore.materials.filter(m => m.subcategory_id === subcategory_id).length;
}

function editCategory(category) {
  editingCategory.value = category;
  showAddCategory.value = true;
}

function addCategory() {
  editingCategory.value = null;
  showAddCategory.value = true;
}

function deleteCategory(category) {
  if (confirm(`Delete category '${category.category}'? This cannot be undone.`)) {
    inventoryStore.deleteCategory(category.id).then(refreshCategories);
  }
}
function editSubcategory(sub, category) {
  editingSubcategory.value = { ...sub, category_id: category.id };
  showEditSubcategory.value = true;
}
async function submitEditSubcategory(newName, errorCallback) {
  try {
    await inventoryStore.updateSubcategory(
      editingSubcategory.value.id,
      newName,
      editingSubcategory.value.category_id,
      editingSubcategory.value.desc || ""
    );
    showEditSubcategory.value = false;
    editingSubcategory.value = null;
    refreshCategories();
    messageStore.showMessage("Subcategory updated successfully.", "success");
    if (errorCallback) errorCallback("");
  } catch (err) {
    messageStore.showMessage(err.message || "Failed to update subcategory.", "error");
    if (errorCallback) errorCallback(err.message || "Failed to update subcategory.");
  }
}
function deleteSubcategory(sub) {
  if (confirm(`Delete subcategory '${sub.subcategory}'? This cannot be undone.`)) {
    inventoryStore.deleteSubcategory(sub.id).then(refreshCategories);
  }
}

function closeAllSubOptions() {
  sortedCategories.value.forEach(cat => {
    sortedSubcategories(cat.id).forEach(sub => {
      if (sub.optionsOpen) sub.optionsOpen = false;
    });
  });
}

function handleClickOutside(event) {
  closeAllSubOptions();
}

watch([showEditSubcategory, editingSubcategory], ([show, sub]) => {
  if (show && sub) {
    editSubcategoryName.value = sub.subcategory;
    editSubcategoryCategory.value = sub.category_id;
    editSubcategoryDesc.value = sub.desc || "";
  }
});

function handleAddMaterial({ subcategories, materials }) {
  // Validation: must select at least one subcategory and one material
  if (!subcategories.length || !materials.length) {
    messageStore.showMessage("Please select at least one subcategory and one material.", "error");
    return;
  }
  // Check for duplicates (already existing materials in selected subcategories)
  const existing = inventoryStore.materials.filter(m =>
    subcategories.includes(m.subcategory_id) && materials.includes(m.id)
  );
  if (existing.length) {
    messageStore.showMessage("Some selected materials already exist in the chosen subcategories.", "error");
    return;
  }
  // Add logic to actually add materials (call store action)
  inventoryStore.addMaterialsToSubcategories(subcategories, materials)
    .then(() => {
      messageStore.showMessage("Materials added successfully.", "success");
      refreshCategories();
    })
    .catch(err => {
      messageStore.showMessage(err.message || "Failed to add materials.", "error");
    });
}

function onCloseAddMaterial() {
  showAddMaterial.value = false;
}
</script>