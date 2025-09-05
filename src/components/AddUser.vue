<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center"
       style="background: linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(255,255,255,0.7) 50%, rgba(13,148,136,0.25) 100%); backdrop-filter: blur(2px);">
    <div class="w-full max-w-xl bg-white shadow-2xl rounded-xl p-8 relative">
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-xl"
        title="Close"
      >
        <i class="fas fa-times"></i>
      </button>
      <div class="flex flex-col items-center mb-6">
        <div class="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center mb-2">
          <i class="fas fa-user-plus text-3xl text-teal-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-teal-700 mb-1">Add New User</h2>
        <span class="text-gray-500 text-sm">Fill in the details to register a new user</span>
      </div>

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label class="block font-medium mb-1 text-teal-700">Name</label>
          <input v-model="name" type="text" required class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" />
        </div>
        <div>
          <label class="block font-medium mb-1 text-teal-700">Email</label>
          <input v-model="email" type="email" required class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" />
        </div>
        <div>
          <label class="block font-medium mb-1 text-teal-700">Password</label>
          <input v-model="password" type="password" required class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" />
        </div>
        <div>
          <label class="block font-medium mb-1 text-teal-700">Role</label>
          <select v-model="role" required class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400">
            <option disabled value="">Select Role</option>
            <option :value="Role.Management">Role.Management</option>
            <option :value="Role.HOStaff">Role.HOStaff</option>
            <option :value="Role.SiteStaff">Role.SiteStaff</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block font-medium mb-1 text-teal-700">Sites</label>
          <MultiSelect
            v-model="selectedSites"
            :options="siteOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Sites"
            class="w-full p-inputtext-sm"
            display="chip"
            :disabled="role !== Role.SiteStaff"
          />
          <!-- <div v-if="selectedSites.length" class="mt-2 flex flex-wrap gap-2">
            <span v-for="site in selectedSites" :key="site" class="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs font-semibold">
              {{ site }}
            </span>
          </div> -->
        </div>
        <div class="md:col-span-2 text-center mt-4">
          <button
            type="submit"
            class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded shadow transition flex items-center justify-center mx-auto"
          >
            <i class="fas fa-user-plus mr-2"></i> Save User
          </button>
        </div>
        <div class="md:col-span-2 text-center">
          <p v-if="successMessage" class="text-green-600 text-sm mt-2 font-semibold">{{ successMessage }}</p>
          <p v-if="errorMessage" class="text-red-600 text-sm mt-2 font-semibold">{{ errorMessage }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useSiteStore } from "@/stores/siteStore";
import MultiSelect from 'primevue/multiselect';
import { Role } from "@/utils/permissions";

const userStore = useUserStore();
const siteStore = useSiteStore();

const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("");
const selectedSites = ref<string[]>([]);

const successMessage = ref("");
const errorMessage = ref("");

const siteOptions = computed(() => siteStore.activeSites.map(s => ({ label: s.site, value: s.id })));

const handleSubmit = async () => {
  successMessage.value = "";
  errorMessage.value = "";

  try {
    // Replace direct Firebase calls with store action (define addUser in userStore if missing)
    if (typeof userStore.addUser === 'function') {
      await userStore.addUser({
        name: name.value,
        email: email.value,
        password: password.value,
        role: role.value,
        sites: selectedSites.value
      });
    } else {
      throw new Error('addUser action not implemented in userStore');
    }
    successMessage.value = "User added and registered successfully!";
    name.value = "";
    email.value = "";
    password.value = "";
    role.value = "";
    selectedSites.value = [];
  } catch (error: any) {
    console.error("Error creating user:", error);
    errorMessage.value = error.message || "Failed to add user. Please try again.";
  }
};

onMounted(async () => {
  await siteStore.fetchActiveSites();
});
</script>