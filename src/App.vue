<script setup lang="ts">
import GlobalMessage from '@/components/GlobalMessage.vue';
import { useAuth } from "@/composables/useAuth";
import { watch } from "vue";
import { useRouter } from "vue-router";

const { isAuthenticated, loading } = useAuth();
const router = useRouter();

// watch(
//   () => loading.value,
//   (val) => {
//     if (!val && !isAuthenticated.value) {
//       router.push("/login");
//     }
//   }
// );
</script>

<template>
  <GlobalMessage />
  <!-- <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <span class="text-teal-600 text-lg font-semibold">Checking session...</span>
  </div>
  <div v-else> -->
    <router-view />
  <!-- </div> -->
</template>