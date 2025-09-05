<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <header
      class="bg-gradient-to-r from-teal-700 via-teal-500 to-teal-300 shadow-md py-3 px-4 flex items-center justify-between fixed top-0 left-0 w-full z-30">
      <div class="flex flex-col items-start">
        <div class="flex items-center gap-2">
          <i class="far fa-building text-white text-xl drop-shadow"></i>
          <span class="text-sm font-bold text-white font-montserrat drop-shadow uppercase">SG ADHAV BUILDERS |
            Inventory Manager</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- Profile Dropdown -->
        <div id="profile-menu" class="relative" @click="profileMenuOpen = !profileMenuOpen">
          <button class="bg-white text-teal-700 rounded-full p-2 shadow hover:bg-teal-100 transition flex items-center">
            <i class="fas fa-user-circle text-xl"></i>
          </button>
          <div v-if="profileMenuOpen" class="absolute right-0 mt-2 w-60 bg-white rounded shadow-lg z-10">
            <ul>
              <li class="flex items-center px-3 py-2 gap-2 border-b border-teal-100">
                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-lg">
                  <i class="fas fa-user text-[10px]"></i>
                </span>
                <div class="flex flex-col justify-center h-full">
                  <span class="font-semibold text-teal-700 text-sm leading-tight ml-2">{{ user?.displayName || user?.email || 'User' }}</span>
                  <span class="text-xs text-gray-500 font-medium mt-0.5"><span class="inline-block px-2 py-0.5 rounded bg-teal-50 text-teal-700">{{ role || 'User' }}</span></span>
                </div>
              </li>
              <!-- <li>
                <button class="text-sm w-full text-left px-4 py-2 hover:bg-teal-50 text-teal-700"
                  @click="handleChangePassword">
                  <i class="fas fa-user mr-2 "></i> Change Password
                </button>
              </li> -->
              <li>
                <button class="text-sm w-full text-left px-4 py-2 hover:bg-teal-50 text-red-600" @click="handleLogout">
                  <i class="fas fa-sign-out-alt mr-2"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 pt-[55px] text-xs md:text-xs">
      <!-- Sidebar -->
      <aside :class="[
        'fixed top-[55px] left-0 h-screen bg-white shadow-lg py-6 px-2 flex flex-col transition-all duration-300 z-20',
        menuOpen ? 'w-48 min-w-48 max-w-48' : 'w-16 min-w-16 max-w-16 items-center'
      ]">

        <!-- <div class="flex flex-row items-center justify-start"> -->
        <div class=" hover:bg-teal-100 text-teal-600 px-3 py-3 justify-between cursor-pointer"
          @click="menuOpen = !menuOpen" :title="menuOpen ? 'Collapse menu' : 'Expand menu'">
          <!-- <i :class="menuOpen ? 'fas fa-angle-left' : 'fas fa-angle-right'"></i> -->
          <i class="fas fa-bars mr-2"></i>
          <span class="font-medium text-teal-800" v-if="menuOpen">Menu</span>
        </div>


        <!-- </div> -->
        <hr class="border-t border-teal-500 my-1" />

        <nav class="flex-1">

          <div class="flex flex-col" v-if="hasPageAccess(role as Role, 'Home')">
            <router-link to="/home"
              :class="[ 'flex items-center py-2 px-3 rounded hover:bg-teal-100 font-medium mb-1', route.path === '/home' ? 'bg-teal-100 text-teal-900 font-bold' : 'text-teal-700' ]">
              <i class="fas fa-chart-pie mr-2"></i>
              <span v-if="menuOpen">Home</span>
            </router-link>
          </div>
          <div class="flex flex-col" v-if="hasPageAccess(role as Role, 'Inventory')">
            <router-link to="/inventory"
              :class="[ 'flex items-center py-2 px-3 rounded hover:bg-teal-100 font-medium mb-1', route.path === '/inventory' ? 'bg-teal-100 text-teal-900 font-bold' : 'text-teal-700' ]">
              <i class="fas fa-boxes-stacked mr-2"></i>
              <span v-if="menuOpen">Inventory</span>
            </router-link>
          </div>
          <div class="flex flex-col" v-if="hasPageAccess(role as Role, 'Sites')">
            <router-link to="/sites"
              :class="[ 'flex items-center py-2 px-3 rounded hover:bg-teal-100 font-medium mb-1', route.path === '/sites' ? 'bg-teal-100 text-teal-900 font-bold' : 'text-teal-700' ]">
              <i class="fas fa-building mr-2"></i>
              <span v-if="menuOpen">Sites</span>
            </router-link>
          </div>
          
          <div class="flex flex-col" v-if="hasPageAccess(role as Role, 'Reports')">
            <router-link to="/reports"
              :class="[ 'flex items-center py-2 px-3 rounded hover:bg-teal-100 font-medium mb-1', route.path === '/reports' ? 'bg-teal-100 text-teal-900 font-bold' : 'text-teal-700' ]">
              <i class="fas fa-chart-bar mr-2"></i>
              <span v-if="menuOpen">Reports</span>
            </router-link>
          </div>
          <div class="flex flex-col" v-if="hasPageAccess(role as Role, 'Users')">
            <router-link to="/users"
              :class="[ 'flex items-center py-2 px-3 rounded hover:bg-teal-100 font-medium mb-1', route.path === '/users' ? 'bg-teal-100 text-teal-900 font-bold' : 'text-teal-700' ]">
              <i class="fas fa-users mr-2"></i>
              <span v-if="menuOpen">Users</span>
            </router-link>
          </div>
          <div class="flex flex-col" v-if="hasPageAccess(role as Role, 'StockPresets')">
            <button
              :class="[ 'flex items-center py-2 px-3 rounded hover:bg-teal-100 font-medium mb-1 w-full text-left', route.path === '/stock-presets' ? 'bg-teal-100 text-teal-900 font-bold' : 'text-teal-700' ]"
              @click="router.push('/stock-presets')">
              <i class="fas fa-th-list mr-2"></i>
              <span v-if="menuOpen">Stock Presets</span>
            </button>
          </div>
          <div class="flex flex-col" v-if="hasPageAccess(role as Role, 'Database')">
            <router-link to="/data"
              :class="[ 'flex items-center py-2 px-3 rounded hover:bg-teal-100 font-medium mb-1', route.path === '/data' ? 'bg-teal-100 text-teal-900 font-bold' : 'text-teal-700' ]">
              <i class="fas fa-database mr-2"></i>
              <span v-if="menuOpen">Database</span>
            </router-link>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 pl-2 py-2 ml-16" :class="menuOpen ? 'md:ml-48' : 'ml-16'">
        <div class="bg-white">
          <router-view />
        </div>
      </main>
    </div>
    <div v-if="showChangePassword">
      <ChangePassword @close="showChangePassword = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ChangePassword from "@/components/ChangePassword.vue"; // Import your modal component
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { hasPageAccess, Role } from "@/utils/permissions"; // <-- Import the function

const profileMenuOpen = ref(false);
const menuOpen = ref(true);
const showChangePassword = ref(false); // Modal state

function closeProfileMenu(e: MouseEvent) {
  const menu = document.getElementById('profile-menu');
  if (profileMenuOpen.value && menu && !menu.contains(e.target as Node)) {
    profileMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', closeProfileMenu);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', closeProfileMenu);
});

function handleChangePassword() {
  showChangePassword.value = true;
  profileMenuOpen.value = false;
}

const router = useRouter();
const route = useRoute();
const { logout, user, role } = useAuth();

const handleLogout = async () => {
  await logout();
  router.push("/login");
};
</script>