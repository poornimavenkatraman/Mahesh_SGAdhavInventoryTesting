<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-gray-400 hover:text-teal-600 text-lg"
        title="Close"
      >
        <i class="fas fa-times"></i>
      </button>
      <div class="flex flex-col items-center mb-6">
        <div class="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center mb-2">
          <i class="fas fa-map-marker-alt text-lg text-teal-600"></i>
        </div>
        <h2 class="text-xl font-bold text-teal-700 mb-1">{{ props.editMode == false ? "Add New Site" : "Edit Site" }}</h2>
        <span class="text-gray-500 text-xs">{{ props.editMode == false ? "Enter details to add a new site" : "Edit site details" }}</span>
      </div>
      <form @submit.prevent="submitSite" class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label class="block text-xs font-medium text-teal-700 mb-1">Site Name</label>
          <input v-model="form.site" type="text" required
            class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400 text-xs" />
        </div>
        <div>
          <label class="block text-xs font-medium text-teal-700 mb-1">Location</label>
          <input v-model="form.location" type="text" required
            class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400 text-xs" />
        </div>
        <div>
          <label class="block text-xs font-medium text-teal-700 mb-1">City</label>
          <input v-model="form.city" type="text" required
            class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400 text-xs" />
        </div>
        <div>
          <label class="block text-xs font-medium text-teal-700 mb-1">Start Date</label>
          <input v-model="form.startDate" type="date" required
            class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400 text-xs" />
        </div>
        <div class="md:col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            class="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded px-4 py-2 text-xs transition"
          >
            {{  props.editMode == false ? "Add" : "Save" }} Site
          </button>
        </div>
      </form>
      <div v-if="successMessage" class="mt-3 text-green-700 text-xs text-center">{{ successMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useSiteStore } from "@/stores/siteStore";
const siteStore = useSiteStore();

const emit = defineEmits(["close", "site-added"]);

const props = defineProps({
  editMode: { type: Boolean, default: false },
  siteData: { type: Object, default: null }
});

const form = ref({
  site: "",
  location: "",
  city: "",
  startDate: ""
});

watch(
  () => props.siteData,
  (newVal) => {
    if (props.editMode && newVal) {
      form.value.site = newVal.site || "";
      form.value.location = newVal.location || "";
      form.value.city = newVal.city || "";
      form.value.startDate = newVal.start_date || "";
    } else {
      form.value.site = "";
      form.value.location = "";
      form.value.city = "";
      form.value.startDate = "";
    }
  },
  { immediate: true }
);

const successMessage = ref("");

async function submitSite() {
  if (props.editMode && props.siteData && typeof siteStore.updateSite === 'function') {
    // Edit mode: update existing site
    await siteStore.updateSite(props.siteData.id, {
      site: form.value.site,
      location: form.value.location,
      city: form.value.city,
      start_date: form.value.startDate,
      status: props.siteData.status || "Active"
    });
    successMessage.value = "Site updated!";
  } else if (typeof siteStore.addSite === 'function') {
    // Add mode: create new site
    await siteStore.addSite({
      site: form.value.site,
      location: form.value.location,
      city: form.value.city,
      start_date: form.value.startDate,
      status: "Active"
    });
    successMessage.value = "Site added!";
  } else {
    throw new Error('addSite or updateSite action not implemented in siteStore');
  }
  emit("site-added");
  setTimeout(() => {
    emit("close");
    successMessage.value = "";
  }, 1200);
}
</script>