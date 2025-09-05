<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    :style="{ background: theme.backdrop, backdropFilter: 'blur(2px)' }"
  >
    <div class="max-w-sm w-full bg-white p-6 rounded-xl shadow-2xl relative">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-xl"
        :class="[theme.iconText, theme.hoverText]"
        title="Close"
      >
        <i class="fas fa-times"></i>
      </button>

      <!-- Header -->
      <div class="flex flex-col items-center mb-6">
        <div :class="[theme.iconBg, 'w-16 h-16 rounded-full flex items-center justify-center mb-2']">
          <i class="fas fa-key text-3xl" :class="theme.iconText"></i>
        </div>
        <h2 class="text-2xl font-bold mb-1" :class="theme.headingText">Change Password</h2>
        <span class="text-sm" :class="theme.sectionText">Update your account password</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block font-medium mb-1" :class="theme.text">Current Password</label>
          <input
            v-model="currentPassword"
            type="password"
            class="w-full p-2 border rounded focus:ring-2"
            :class="[theme.border, theme.ring]"
            required
          />
        </div>
        <div>
          <label class="block font-medium mb-1" :class="theme.text">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full p-2 border rounded focus:ring-2"
            :class="[theme.border, theme.ring]"
            required
          />
        </div>
        <div>
          <label class="block font-medium mb-1" :class="theme.text">Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full p-2 border rounded focus:ring-2"
            :class="[theme.border, theme.ring]"
            required
          />
        </div>

        <!-- Submit Button -->
        <div class="text-center">
          <button
            type="submit"
            class="px-6 py-2 text-white rounded shadow"
            :class="[themeAccent.bg, themeAccent.hoverBg]"
          >
            Change Password
          </button>
        </div>

        <!-- Message -->
        <div v-if="message" class="mt-2 text-center text-sm text-red-600 font-semibold">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useThemeColors } from '@/composables/useThemeColors'

// Theme setup
const theme = useThemeColors('error')
const themeAccent = useThemeColors('primary')

const currentPassword = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const message = ref("")

const changePassword = () => {
  if (newPassword.value !== confirmPassword.value) {
    message.value = "New passwords do not match."
    return
  }

  // Password change logic here
  message.value = "Password changed successfully!"
}
</script>
