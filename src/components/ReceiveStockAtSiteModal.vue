<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background: rgba(15,163,146,0.12); backdrop-filter: blur(3px)"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[92vh] border border-red-100"
    >
      <div
        class="flex items-center justify-between p-6 border-b border-red-50"
      >
        <div class="flex items-center gap-3">
          <div class="bg-red-100 rounded-full p-3">
            <i class="text-xl text-red-700" :class="props.request && props.request.requestType == 'Receive Stock' ? 'fas fa-truck-loading' : props.request && props.request.requestType == 'Return Stock' ? 'fas fa-undo-alt' : props.request && props.request.requestType == 'Dispatch Stock' ? 'fas fa-truck' :  ''"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-red-700">
              {{ props.request && props.request.requestType == 'Receive Stock' ? 'Receive Stock At Site' : props.request && props.request.requestType == 'Return Stock' ? 'Receive Returned Stock from Site' :  props.request && props.request.requestType == 'Dispatch Stock' ? 'Dispatch Stock to Site' :  '' }} 
            </h3>
            <p class="text-xs text-gray-500">
              {{ props.request && props.request.requestType == 'Receive Stock' ? 'Review and confirm stock to check-in at site' : props.request && props.request.requestType == 'Return Stock' ? 'Review and confirm stock to check-in returned stock from site' : props.request && props.request.requestType == 'Dispatch Stock' ? 'Review and confirm stock to be dispatched to site' :  '' }}
            </p>
          </div>
        </div>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-red-600"
          aria-label="Close modal"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="mx-6 p-2 rounded bg-red-500 text-white flex gap-8 items-center">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold">Request ID:</span>
          <span class="font-semibold">{{ requestId }}</span>
        </div>
       
      </div>
      <div class="px-8 py-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500">Site Name</div>
            <div class="font-semibold text-red-700">{{ siteName }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Site Location</div>
            <div class="font-semibold text-red-700">{{ siteLocation }}</div>
          </div>

          <div>
            <div class="text-xs text-gray-500">Requested Date</div>
            <div class="font-semibold text-red-700">{{ requestDate }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Expected Date</div>
            <div class="font-semibold text-red-700">{{ requestDate }}</div>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1"
            > Description</label
          >
          <div class="text-xs text-gray-700 mb-3">{{ description }}</div>
        </div>
        <div class="bg-red-50 rounded-xl p-4 border border-red-100">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500">Category</div>
              <div class="font-semibold text-red-700">
                {{ material.category }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Subcategory</div>
              <div class="font-semibold text-red-700">
                {{ material.subcategory }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Material</div>
              <div class="font-semibold text-red-700">{{ material.name }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Quantity</div>
              <div class="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  v-model.number="material.quantity"
                  min="1"
                  class="w-28 px-2 py-1 border border-red-200 rounded text-right font-semibold text-red-700"
                />
                <div class="text-red-700 font-semibold">
                  {{ material.uom }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1"
            > {{ props.request && props.request.requestType == 'Dispatch Stock' ? 'Check-Out Comments' :'Check-In Comments' }}</label
          >
          <textarea
            v-model="acceptanceNotes"
            rows="3"
            class="w-full border border-red-200 rounded px-3 py-2 text-xs"
            :placeholder="props.request && props.request.requestType == 'Dispatch Stock' ? 'Enter check-out comments...' : 'Enter check-in comments...'"
          ></textarea>
        </div>
        <div class="flex justify-end">
          <button
            @click="acceptRequest"
            class="bg-red-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-800"
          >
            {{ props.request && props.request.requestType == 'Dispatch Stock' ? 'Check-Out' :'Check-In' }} Stock
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
const emit = defineEmits(["accept", "close"]);

const route = useRoute();

// Dummy data for demo
const requestId = ref("REQ-20250819-001");
const requestDate = ref("2025-08-19");
const description = ref("Please supply as per request.");
const material = ref({
  name: "Cement",
  quantity: 100,
  uom: "Bags",
  category: "Building Materials",
  subcategory: "Cement & Concrete",
});
const acceptanceNotes = ref("");
const siteName = ref("");
const siteLocation = ref("");

function acceptRequest() {
  emit("accept", {
    requestId: requestId.value,
    requestDate: requestDate.value,
    material: material.value,
    description: description.value,
    acceptanceNotes: acceptanceNotes.value,
  });
}
function closeModal() {
  emit("close");
}
function setSiteInfoFromRequest(
  request: { site?: string; siteLocation?: string; requestType: string } | undefined
) {
  if (request && request.site) siteName.value = request.site;
  if (request && request.siteLocation)
    siteLocation.value = request.siteLocation;
}
// If using props, add:
const props = defineProps<{
  request?: { site?: string; siteLocation?: string; requestType: string };
}>();
onMounted(() => setSiteInfoFromRequest(props.request));
</script>

<style scoped>
.overlay {
  background: rgba(0, 0, 0, 0.3);
}
</style>
