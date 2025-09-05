<template>
  <transition name="fade">
  <div v-if="visible" :class="['fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-xl font-semibold border flex items-center gap-3', bgClass, borderClass]" style="min-width: 220px; max-width: 90vw; text-align: left;">
      <span class="flex-1 text-sm">{{ message }}</span>
      <button @click="close" class="ml-2 text-brand-muted hover:text-brand-error transition text-lg px-2 py-1 rounded-full focus:outline-none" title="Close notification">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useMessageStore } from '@/stores/messageStore';
const messageStore = useMessageStore();
const visible = computed(() => messageStore.visible);
const message = computed(() => messageStore.message);
const type = computed(() => messageStore.type);
const bgClass = computed(() => {
  if (type.value === 'success') return 'bg-green-100 text-green-800';
  if (type.value === 'error') return 'bg-red-100 text-red-800';
  if (type.value === 'info') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
});
const borderClass = computed(() => {
  if (type.value === 'success') return 'border-green-300';
  if (type.value === 'error') return 'border-red-300';
  if (type.value === 'info') return 'border-red-300';
  return 'border-gray-300';
});
function close() {
  messageStore.hideMessage();
}
</script>

<style scoped>
/* Fade animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
