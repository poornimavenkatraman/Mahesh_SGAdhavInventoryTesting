<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
      
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-gray-400"
        :class="theme.hoverText"
        title="Close"
      >
        <i class="fas fa-times text-lg"></i>
      </button>

      <!-- Header -->
      <div class="flex flex-col items-center mb-6">
        <div :class="[theme.bg, 'w-12 h-12 rounded-full flex items-center justify-center mb-2']">
          <i class="fas fa-map-marker-alt text-lg" :class="theme.text"></i>
        </div>
        <h2 class="text-xl font-bold mb-1" :class="theme.text">
          {{ props.editMode == false ? "Add New Site" : "Edit Site" }}
        </h2>
        <span class="text-gray-500 text-xs">
          {{ props.editMode == false ? "Enter details to add a new site" : "Edit site details" }}
        </span>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitSite" class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label class="block text-xs font-medium mb-1" :class="theme.text">Site Name</label>
          <input v-model="form.site" type="text" required
            class="w-full p-2 border rounded focus:ring-2 text-xs"
            :class="[theme.border, theme.ring]"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1" :class="theme.text">Location</label>
          <input v-model="form.location" type="text" required
            class="w-full p-2 border rounded focus:ring-2 text-xs"
            :class="[theme.border, theme.ring]"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1" :class="theme.text">City</label>
          <input v-model="form.city" type="text" required
            class="w-full p-2 border rounded focus:ring-2 text-xs"
            :class="[theme.border, theme.ring]"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1" :class="theme.text">Start Date</label>
          <input v-model="form.startDate" type="date" required
            class="w-full p-2 border rounded focus:ring-2 text-xs"
            :class="[theme.border, theme.ring]"
          />
        </div>

        <!-- Submit Button -->
        <div class="md:col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            class="text-white font-semibold rounded px-4 py-2 text-xs transition"
            :class="[themeAccent.bg, themeAccent.hoverBg]"
          >
            {{ props.editMode == false ? "Add" : "Save" }} Site
          </button>
        </div>
      </form>

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-3 text-xs text-center text-green-700">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useSiteStore } from "@/stores/siteStore";
import { useThemeColors } from "@/composables/useThemeColors";

// Choose theme type for this modal
const theme = useThemeColors("error");
const themeAccent = useThemeColors("error");

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

const successMessage = ref("");

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

async function submitSite() {
  if (props.editMode && props.siteData && typeof siteStore.updateSite === 'function') {
    await siteStore.updateSite(props.siteData.id, {
      site: form.value.site,
      location: form.value.location,
      city: form.value.city,
      start_date: form.value.startDate,
      status: props.siteData.status || "Active"
    });
    successMessage.value = "Site updated!";
  } else if (typeof siteStore.addSite === 'function') {
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
