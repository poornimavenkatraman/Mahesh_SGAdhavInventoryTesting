<template>
  <div class="flex min-h-screen pt-[5.5rem]">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md border-r">
      <nav class="p-4 space-y-2">
        <router-link
          v-for="item in menu"
          :key="item.name"
          :to="item.path"
          class="block px-4 py-2 rounded hover:bg-red-50"
          :class="{ 'bg-red-100': $route.path === item.path }"
        >
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuth } from "@/composables/useAuth";
import GlobalMessage from '@/components/GlobalMessage.vue';

const { user } = useAuth();

const menu = computed(() => {
  switch (user?.role) {
    case "Management":
      return [
        { name: "Inventory", path: "/app/inventory" },
        { name: "Users", path: "/app/users" },
        { name: "Reports", path: "/app/reports" },
      ];
    case "HO Staff":
      return [
        { name: "Inventory", path: "/app/inventory" },
        { name: "Reports", path: "/app/reports" },
      ];
    case "Site Staff":
      return [
        { name: "Inventory", path: "/app/inventory" },
      ];
    default:
      return [];
  }
});
</script>
