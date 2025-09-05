<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
      <span class="bg-red-100 text-red-600 rounded-full p-4 mb-4">
        <i class="fas fa-exclamation-triangle text-3xl"></i>
      </span>
      <h1 class="text-2xl font-bold text-red-700 mb-2">Page Not Found or Unauthorized</h1>
      <p class="text-gray-600 mb-6 text-center">
        The page you are looking for does not exist or you do not have permission to view it.
      </p>
      <router-link to="/home" class="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700">
        Go to Home
      </router-link>
    </div>
  </div>
</template>