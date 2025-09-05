<template>
  <div class="p-4">
    <!-- <div class="bg-white shadow-sm py-6 px-6"> -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="bg-red-200 rounded-full p-2">
          <i class="fas fa-users text-lg text-red-700"></i>
        </div>
        <h2 class="text-lg font-bold text-red-700">Users</h2>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="showAddUser = true"
          class="text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 shadow transition"
          title="Add New User"
        >
          <i class="fas fa-user-plus"></i>
        </button>
      </div>
    </div>

    <div v-if="userStore.loading" class="flex items-center gap-2 text-red-600">
      <i class="fas fa-spinner fa-spin"></i>
      Loading users...
    </div>

    <div v-else-if="userStore.users && userStore.users.length > 0">
      <table
        class="min-w-full bg-white border border-red-200 rounded-lg text-xs shadow"
      >
        <!-- Table Header: Only show "sites" column for Site Staff -->
        <thead>
          <tr class="bg-red-100">
            <th
              class="border-b border-red-200 px-4 py-2 text-red-700 font-semibold text-start"
            >
              Name
            </th>
            <th
              class="border-b border-red-200 px-4 py-2 text-red-700 font-semibold text-start"
            >
              Email
            </th>
            <th
              class="border-b border-red-200 px-4 py-2 text-red-700 font-semibold text-start"
            >
              Role
            </th>
            <th
              v-if="
                (userStore.users || []).some((u) => u.role === Role.SiteStaff)
              "
              class="border-b border-red-200 px-4 py-2 text-red-700 font-semibold text-start"
            >
              Sites
            </th>
            <th
              class="border-b border-red-200 px-4 py-2 text-red-700 font-semibold text-start"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, index) in orderedUsers"
            :key="index"
            class="hover:bg-red-50 transition-colors"
          >
            <td class="border-b border-red-100 px-4 py-2 font-medium">
              {{ user.user }}
            </td>
            <td class="border-b border-red-100 px-4 py-2">{{ user.email }}</td>
            <td class="border-b border-red-100 px-4 py-2 capitalize">
              <template v-if="editingUserId === user.id">
                <Dropdown
                  v-model="editRole"
                  :options="roleOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select role"
                  class="w-full"
                  :disabled="
                    loggedInRole === Role.Management &&
                    loggedInUser?.uid === user.id
                  "
                />
              </template>
              <template v-else>
                {{ user.role }}
              </template>
            </td>
            <!-- Always show the Sites column, but only fill for Site Staff -->
            <td class="border-b border-red-100 px-4 py-2">
              <template v-if="user.role === Role.SiteStaff">
                <template
                  v-if="editingUserId === user.id && editRole === Role.SiteStaff"
                >
                  <MultiSelect
                    v-model="editSites"
                    :options="activeSites"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select sites"
                    display="chip"
                    class="w-full"
                  />
                </template>
                <template v-else>
                  <ul class="flex flex-wrap gap-1">
                    <li
                      v-for="(siteId, i) in userSitesMap[user.id] || []"
                      :key="i"
                      class="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-red-200 transition"
                      @click="() => $emit && $emit('site-click', siteId)"
                    >
                      {{ getSiteNameById(siteId) }}
                    </li>
                  </ul>
                </template>
              </template>
              <template v-else>
                <!-- Empty cell for non Site Staff -->
              </template>
            </td>
            <td class="border-b border-red-100 py-2 space-x-2 text-start">
              <template v-if="editingUserId === user.id">
                <button
                  @click="saveEdit(user.id)"
                  class="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow transition"
                  title="Save"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button
                  @click="cancelEdit"
                  class="bg-gray-400 hover:bg-gray-500 text-white rounded-full p-2 shadow transition"
                  title="Cancel"
                >
                  <i class="fas fa-times"></i>
                </button>
              </template>
              <template v-else>
                <button
                  @click="startEdit(user)"
                  class="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow transition"
                  title="Edit"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="confirmDelete(user.id)"
                  class="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow transition"
                  title="Delete"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-gray-500 text-center mt-8">
      <i class="fas fa-user-slash text-2xl mb-2"></i>
      <div>No users found in the system.</div>
    </div>
    <!-- </div> -->

    <!-- Add User Modal -->
    <div
      v-if="showAddUser"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    >
      <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl relative">
        <button
          @click="showAddUser = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-xl"
          title="Close"
        >
          <i class="fas fa-times"></i>
        </button>
        <div
          v-if="showAddUser"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        >
          <AddUser @close="showAddUser = false" @user-added="onUserAdded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useSiteStore } from "@/stores/siteStore";
import { useAuth } from "@/composables/useAuth";

import { doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
const userStore = useUserStore();
const siteStore = useSiteStore();
const { user: loggedInUser, role: loggedInRole } = useAuth();
import AddUser from "@/components/AddUser.vue";
import MultiSelect from "primevue/multiselect";
import Dropdown from "primevue/dropdown";
import { Role } from "@/utils/permissions";

// Pinia stores used in this page:
// - useUserStore (userStore): manages users, fetches user list, updates/deletes users
// - useSiteStore (siteStore): manages sites, fetches site list for site access
// - useAuth: provides logged-in user and role for access control

const roleOptions = [
  { label: Role.Management, value: Role.Management },
  { label: Role.HOStaff, value: Role.HOStaff },
  { label: Role.SiteStaff, value: Role.SiteStaff },
];

// Use userStore.users and userStore.loading instead
const successMessage = ref("");

const editingUserId = ref<string | null>(null);
const editRole = ref("");
const editSites = ref<string[]>([]);

const showAddUser = ref(false);

const activeSites = ref<{ label: string; value: string }[]>([]);

const userSitesMap = ref<Record<string, string[]>>({});

onMounted(async () => {
  await userStore.fetchUsers();
  await siteStore.fetchSites();
  await siteStore.fetchActiveSites();
  activeSites.value = siteStore.activeSites.map((site) => ({
    label: site.site,
    value: site.id,
  }));
  await fetchUserSites();
});

const orderedUsers = computed(() => {
  const roleOrder = {
    [Role.SiteStaff]: 1,
    [Role.HOStaff]: 2,
    [Role.Management]: 3,
  };
  return [...(userStore.users || [])].sort((a, b) => {
    return (roleOrder[a.role as string] || 99) - (roleOrder[b.role] || 99);
  });
});

// Helper to get site_id from site name
function getSiteIdsFromNames(siteNames: string[]): string[] {
  return siteNames
    .map((name) => {
      const site = siteStore.sites.find((s) => s.site === name);
      return site ? site.id : null;
    })
    .filter(Boolean);
}

const startEdit = (user: any) => {
  editingUserId.value = user.id;
  editRole.value = user.role;
  // Preselect active site IDs from userSitesMap for Site Staff
  if (user.role === Role.SiteStaff) {
    const ids = userSitesMap.value[user.id];
    editSites.value = Array.isArray(ids) ? [...ids] : [];
  }
  // else {
  //   editSites.value = Array.isArray(user.sites) ? [...user.sites] : [];
  // }
};

const cancelEdit = () => {
  editingUserId.value = null;
  editRole.value = "";
  editSites.value = [];
};

const saveEdit = async (id: string) => {
  const userRef = doc(db, "users", id);
  await updateDoc(userRef, {
    role: editRole.value,
  });

  if (editSites.value.length > 0) {
    const userSitesRef = collection(db, "user_sites");
    const batch = writeBatch(db);

    for (const siteId of editSites.value) {
      const docRef = doc(userSitesRef);

      const existingSnap = await getDocs(
        query(
          collection(db, "user_sites"),
          where("user_id", "==", id),
          where("site_id", "==", siteId),
          where("is_active", "==", true)
        )
      );

      if (!existingSnap.empty) {
        // If exists, skip adding or update as needed
        continue;
      }
      batch.set(docRef, {
        user_id: id,
        site_id: siteId,
        is_active: true,
        start_date: new Date(),
      });
    }

    const existingUserSites = await getDocs(
      query(
        collection(db, "user_sites"),
        where("user_id", "==", id),
        where("is_active", "==", true)
      )
    );

    // Deactivate existing sites not in editSites
    for (const site of existingUserSites.docs) {
      const siteData = site.data();
      if (!editSites.value.includes(siteData.site_id)) {
        batch.update(site.ref, { is_active: false });
      }
    }
    await batch.commit();
  }

  successMessage.value = "User updated successfully.";
  cancelEdit();
  await userStore.fetchUsers();
  await fetchUserSites();
};

// Delete with confirmation
const confirmDelete = async (id: string) => {
  const confirmed = window.confirm(
    "Once deleted, the information can't be retrieved. Are you sure to proceed?"
  );
  if (!confirmed) return;

  await updateDoc(doc(db, "users", id), { is_deleted: true });
  successMessage.value = "User deleted successfully.";
  await userStore.fetchUsers();
};

// Handle user added from modal
const onUserAdded = async () => {
  showAddUser.value = false;
  await userStore.fetchUsers();
  successMessage.value = "User added successfully.";
};

async function fetchUserSites() {
  const snap = await getDocs(
    query(collection(db, "user_sites"), where("is_active", "==", true))
  );
  const map: Record<string, string[]> = {};
  snap.forEach((doc) => {
    const data = doc.data();
    if (data.user_id && data.site_id) {
      if (!map[data.user_id]) map[data.user_id] = [];
      map[data.user_id].push(data.site_id);
    }
  });
  userSitesMap.value = map;
}

function getSiteNameById(siteId: string): string {
  const site = siteStore.sites.find((s) => s.id === siteId);
  return site ? site.site : siteId;
}
</script>
<style scoped>
::v-global(.p-select-label) {
  font-size: 0.8rem !important;
  /* Example: adjust as needed */
}

::v-global(.p-select-option) {
  font-size: 0.7rem !important;
  /* Example: adjust as needed */
}

::v-global(.p-multiselect-option) {
  font-size: 0.7rem !important;
  /* Example: adjust as needed */
}

::v-global(.p-multiselect-option-group) {
  font-size: 0.8rem !important;
  /* Example: adjust as needed */
}
</style>
