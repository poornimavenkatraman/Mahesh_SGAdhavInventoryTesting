<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center"
       style="background: linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(255,255,255,0.7) 50%, rgba(13,148,136,0.25) 100%); backdrop-filter: blur(2px);">
    <div class="max-w-sm w-full bg-white p-6 rounded-xl shadow-2xl relative">
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-xl"
        title="Close"
      >
        <i class="fas fa-times"></i>
      </button>
      <div class="flex flex-col items-center mb-6">
        <div class="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center mb-2">
          <i class="fas fa-key text-3xl text-teal-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-teal-700 mb-1">Change Password</h2>
        <span class="text-gray-500 text-sm">Update your account password</span>
      </div>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block font-medium mb-1 text-teal-700">Current Password</label>
          <input v-model="currentPassword" type="password" class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" required />
        </div>
        <div>
          <label class="block font-medium mb-1 text-teal-700">New Password</label>
          <input v-model="newPassword" type="password" class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" required />
        </div>
        <div>
          <label class="block font-medium mb-1 text-teal-700">Confirm New Password</label>
          <input v-model="confirmPassword" type="password" class="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-400" required />
        </div>
        <div class="text-center">
          <button type="submit" class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded shadow">Change Password</button>
        </div>
        <div v-if="message" class="mt-2 text-center text-sm text-red-600">{{ message }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const message = ref("");

const changePassword = () => {
  if (newPassword.value !== confirmPassword.value) {
    message.value = "New passwords do not match.";
    return;
  }
  // Add your password change logic here
  message.value = "Password changed successfully!";
};
</script>