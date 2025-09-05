<template>
  <div
    class="flex-1 flex flex-col items-center cursor-pointer py-4 px-2 rounded-xl border transition min-h-[120px] max-w-[120px] min-w-[120px]"
    :class="[
      label === 'Return Cancelled' || label == 'Return Declined' || label == 'Request Cancelled' || label == 'Request Declined' ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-200 text-red-700' :
      active ? 'border-teal-400 bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-lg' : 'border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100',
      disabled ? 'opacity-50' : ''
    ]"
    @click="$emit('click')"
  >
    <span :class="[
      'rounded-full p-2 mb-2 shadow',
      label === 'Return Cancelled' || label == 'Return Declined' || label == 'Request Cancelled' || label == 'Request Declined' ? 'bg-red-200 text-red-700' : (active ? 'bg-teal-200 text-teal-700' : 'bg-gray-200 text-gray-400')
    ]">
      <i v-if="icon" :class="icon + ' text-sm'" />
    </span>
    <span :class="[
      'font-semibold text-xs mb-1',
      label === 'Return Cancelled' || label == 'Return Declined' || label == 'Request Cancelled' || label == 'Request Declined' ? 'text-red-700' : (active ? 'text-teal-700' : 'text-gray-400')
    ]">{{ label }}</span>
    <span class="text-[10px] text-gray-500">{{ active? '' : 'Pending' }}</span>
    
    <span class="text-[11px] text-gray-500">{{ by || '' }}</span>
    <span class="text-[10px] text-gray-500">{{ workflow_tracker_id || '' }}</span>
    <span v-if="date" class="text-[9px] text-gray-400 block w-full text-center">
      {{ date.split(',')[0] }}<br />
      <span class="text-[9px] text-gray-400 block w-full text-center">{{ date.split(',').slice(1).join(',').trim() }}</span>
    </span>
    <span v-else class="text-[10px] text-gray-500">{{ '' }}</span>
  </div>
</template>

<script setup>
defineProps({
  active: Boolean,
  icon: String,
  label: String,
  date: String,
  by: String,
  workflow_tracker_id: String,
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>
