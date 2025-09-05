<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-t from-teal-300 via-teal-150 to-teal-100">
    <div class="max-w-sm w-full mx-auto p-8 bg-white shadow-xl rounded-lg">
      <!-- Logo Placeholder -->
      <div class="flex flex-col items-center mb-6">
        <div class="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center mb-2">
          <!-- Replace with actual logo -->
          <i class="fas fa-box-open text-3xl text-teal-600"></i>
        </div>
        <h2 class="text-xl font-bold text-teal-700 mb-1">SG Adhav Builders</h2>
        
        <h2 class="text-sm font-bold text-teal-700 mb-1 uppercase">Inventory Manager</h2>
        <span class="text-gray-500 text-xs">Login to continue</span>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-5 text-xs">
        <div v-if="loading" class="flex justify-center items-center mb-4">
          <!-- <span class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-600 mr-2"></span> -->
          <span class="animate-spin text-3xl text-teal-400 mb-2">
                <i class="fas fa-spinner"></i>
            </span>
          <span class="text-teal-600">Logging in...</span>
        </div>
        <div>
          <label for="email" class="block mb-1 font-medium text-teal-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full p-2 border border-teal-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label for="password" class="block mb-1 font-medium text-teal-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full p-2 border border-teal-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Enter your password"
          />
          <div class="flex justify-end mt-1">
            <a href="#" class="text-xs text-teal-600 hover:underline">Forgot password?</a>
          </div>
        </div>
        <div class="text-center">
          <button type="submit" class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded shadow transition">
            Login
          </button>
        </div>
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { Role } from "@/utils/permissions";
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const { login} = useAuth();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (authStore.user) {
    if (authStore.user.role === Role.Management || authStore.user.role === Role.HOStaff || authStore.user.role === Role.SiteStaff) {
      router.push("/home");
    } else {
      router.push("/home");
    }
  }
});

const handleLogin = async () => {
  loading.value = true;
  try {
    error.value = "";
    await login(email.value, password.value);

    const redirect = route.query.redirect as string | undefined;
    if (redirect) {
      router.push(redirect);
    } else if (authStore.user?.role === Role.Management) {
      router.push("/home");
    } else if (authStore.user?.role === Role.HOStaff) {
      router.push("/home");
    } else if (authStore.user?.role === Role.SiteStaff) {
      router.push("/sites");
    } else {
      console.log(authStore.user);
      error.value = "Role not recognized. Please contact admin.";
    }
  } catch (err: any) {
    error.value = err.message || "Login failed";
  } finally {
    loading.value = false;
  }
};


</script>
