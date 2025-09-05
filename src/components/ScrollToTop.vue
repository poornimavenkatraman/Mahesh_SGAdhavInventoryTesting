<template>
  <Teleport to="body">
    <button
      v-show="visible"
      @click="toTop"
      type="button"
      aria-label="Back to top"
      class="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-4 h-11
             rounded-full shadow-lg border bg-white hover:bg-gray-50
             transition-opacity duration-200"
    >
      <span class="text-sm font-medium">Top</span>
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" aria-hidden="true">
        <path fill-rule="evenodd"
          d="M3.293 10.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 6.414V17a1 1 0 11-2 0V6.414l-4.293 4.293a1 1 0 01-1.414 0z"
          clip-rule="evenodd" />
      </svg>
    </button>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{ offset?: number }>();
const visible = ref(false);

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const threshold = typeof props.offset === "number" ? props.offset : 400;
    visible.value = window.scrollY > threshold;
    ticking = false;
  });
};

function toTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>