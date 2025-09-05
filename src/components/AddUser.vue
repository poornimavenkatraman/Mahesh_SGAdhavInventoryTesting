<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    :style="{ background: theme.backdrop, backdropFilter: 'blur(2px)' }"
  >
    <div class="w-full max-w-xl bg-white shadow-2xl rounded-xl p-8 relative">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400"
        :class="theme.hoverText"
        title="Close"
      >
        <i class="fas fa-times text-xl"></i>
      </button>

      <!-- Header Icon and Title -->
      <div class="flex flex-col items-center mb-6">
        <div :class="[theme.bg, 'w-16 h-16 rounded-full flex items-center justify-center mb-2']">
          <i class="fas fa-user-plus text-3xl" :class="theme.text"></i>
        </div>
        <h2 class="text-2xl font-bold mb-1" :class="theme.text">Add New User</h2>
        <span class="text-gray-500 text-sm">Fill in the details to register a new user</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label class="block font-medium mb-1" :class="theme.text">Name</label>
          <input v-model="name" type="text" required
            class="w-full p-2 border rounded focus:ring-2"
            :class="[theme.border, theme.ring]"
          />
        </div>
        <div>
          <label class="block font-medium mb-1" :class="theme.text">Email</label>
          <input v-model="email" type="email" required
            class="w-full p-2 border rounded focus:ring-2"
            :class="[theme.border, theme.ring]"
          />
        </div>
        <div>
          <label class="block font-medium mb-1" :class="theme.text">Password</label>
          <input v-model="password" type="password" required
            class="w-full p-2 border rounded focus:ring-2"
            :class="[theme.border, theme.ring]"
          />
        </div>
        <div>
          <label class="block font-medium mb-1" :class="theme.text">Role</label>
          <select v-model="role" required
            class="w-full p-2 border rounded focus:ring-2"
            :class="[theme.border, theme.ring]"
          >
            <option disabled value="">Select Role</option>
            <option :value="Role.Management">Management</option>
            <option :value="Role.HOStaff">HO Staff</option>
            <option :value="Role.SiteStaff">Site Staff</option>
          </select>
        </div>

        <!-- Sites -->
        <div class="md:col-span-2">
          <label class="block font-medium mb-1" :class="theme.text">Sites</label>
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
        </div>

        <!-- Submit -->
        <div class="md:col-span-2 text-center mt-4">
          <button
            type="submit"
            class="text-white rounded shadow transition px-6 py-2 font-semibold flex items-center justify-center mx-auto"
            :class="[themeAccent.bg, themeAccent.hoverBg]"
          >
            <i class="fas fa-user-plus mr-2"></i> Save User
          </button>
        </div>

        <!-- Message -->
        <div class="md:col-span-2 text-center">
          <p v-if="successMessage" class="text-green-600 text-sm mt-2 font-semibold">{{ successMessage }}</p>
          <p v-if="errorMessage" class="text-red-600 text-sm mt-2 font-semibold">{{ errorMessage }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useSiteStore } from '@/stores/siteStore'
import MultiSelect from 'primevue/multiselect'
import { Role } from '@/utils/permissions'
import { useThemeColors } from '@/composables/useThemeColors'

const userStore = useUserStore()
const siteStore = useSiteStore()

const name = ref("")
const email = ref("")
const password = ref("")
const role = ref("")
const selectedSites = ref<string[]>([])

const successMessage = ref("")
const errorMessage = ref("")

const theme = useThemeColors('error')         // For text, bg, border, ring, hoverText, backdrop
const themeAccent = useThemeColors('primary') // For primary action buttons

const siteOptions = computed(() =>
  siteStore.activeSites.map(s => ({ label: s.site, value: s.id }))
)

const handleSubmit = async () => {
  successMessage.value = ""
  errorMessage.value = ""

  try {
    if (typeof userStore.addUser === 'function') {
      await userStore.addUser({
        name: name.value,
        email: email.value,
        password: password.value,
        role: role.value,
        sites: selectedSites.value
      })
      successMessage.value = "User added and registered successfully!"
      name.value = ""
      email.value = ""
      password.value = ""
      role.value = ""
      selectedSites.value = []
    } else {
      throw new Error('addUser action not implemented in userStore')
    }
  } catch (error: any) {
    console.error("Error creating user:", error)
    errorMessage.value = error.message || "Failed to add user. Please try again."
  }
}

onMounted(async () => {
  await siteStore.fetchActiveSites()
})
</script>
