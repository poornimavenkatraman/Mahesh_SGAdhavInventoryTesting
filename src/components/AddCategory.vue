<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      
      <!-- Header -->
      <div class="flex items-center mb-4">
        <span :class="[theme.bg, theme.text, 'rounded-full p-2 mr-2']">
          <i class="fas fa-hard-hat"></i>
        </span>
        <h2 :class="['text-lg font-bold', theme.text]">
          {{ editCategory && editCategory.id ? 'Edit Category' : 'Add New Category' }}
        </h2>
        <button class="ml-auto text-gray-400" :class="hoverText" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit">
        <div class="mb-4">
          <label class="block text-xs font-semibold mb-1" :class="theme.text">Category Name</label>
          <input
            v-model="categoryName"
            type="text"
            class="w-full border rounded px-3 py-2 text-xs"
            :class="[theme.border]"
            required
          />
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="mb-4 text-xs" :class="themeError.text">
          {{ errorMessage }}
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-6">
          <button
            type="button"
            class="px-4 py-2 rounded font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded font-semibold text-white"
            :class="[themeAccent.bg, hoverAccent]"
          >
            {{ editCategory && editCategory.id ? 'Update Category' : 'Add Category' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useInventoryStore } from '@/stores/inventoryStore';
import { useMessageStore } from '@/stores/messageStore';
import { useThemeColors } from '@/composables/useThemeColors';

// Use red-style theme for "danger" like modal
const theme = useThemeColors('error');
const themeAccent = useThemeColors('error'); // For buttons
const themeError = useThemeColors('error');

const hoverAccent = 'hover:bg-red-700'; // Optional: still hardcoded unless added to tokens
const hoverText = 'hover:text-red-700';

const inventoryStore = useInventoryStore();
const messageStore = useMessageStore();

const props = defineProps({
  open: { type: Boolean, default: false },
  editCategory: { type: Object, default: null }
});
const emits = defineEmits(["close", "added", "edited"]);

const categoryName = ref("");
const errorMessage = ref("");
const editCategory = ref(null);

// Watch props to reset modal
watch([() => props.open, () => props.editCategory], ([open, editCat]) => {
  if (open) {
    if (editCat && editCat.id) {
      editCategory.value = editCat;
      categoryName.value = editCat.category;
    } else {
      editCategory.value = null;
      categoryName.value = "";
    }
    errorMessage.value = "";
  }
});

function close() {
  emits("close");
  categoryName.value = "";
  errorMessage.value = "";
}

async function submit() {
  errorMessage.value = "";
  try {
    if (editCategory.value && editCategory.value.id) {
      await inventoryStore.updateCategory(editCategory.value.id, categoryName.value);
      messageStore.showMessage('Category successfully updated.', 'success');
      emits("edited");
    } else {
      await inventoryStore.addCategory(categoryName.value);
      messageStore.showMessage('Category successfully added.', 'success');
      emits("added");
    }
    close();
  } catch (err) {
    errorMessage.value = err.message || "Failed to save category.";
    messageStore.showMessage(errorMessage.value, 'error');
  }
}
</script>
