<template>
  <div class="mb-4">
    <h3 class="text-red-700 font-bold text-sm mb-2 flex items-center">
      <span class="inline-block bg-red-100 text-red-700 rounded-full p-2 mr-2">
        <i class="fas fa-tasks"></i>
      </span>
      Workflow
    </h3>
    <div class="bg-white rounded-lg shadow p-4 border border-red-100">
      <div class="flex items-center justify-center gap-4 w-full mx-auto"
        :class="getFullWorkflow(request.status, request.workflows).length == 1   ? 'max-w-sm' : getFullWorkflow(request.status, request.workflows).length == 2 ? 'max-w-md' : getFullWorkflow(request.status, request.workflows).length == 3 ? 'max-w-xl' : ''">
        <template v-if="request.workflows && request.workflows.length">
          <template v-for="(step, idx) in getFullWorkflow(request.status, request.workflows)" :key="idx">
            <StepCard
              :active="step.enabled"
              :icon="getIcon(step.transaction_type)"
              :label="step.transaction_type"
              :date="step.created_at"
              :by="step.created_by_user_name"
              :workflow_tracker_id="step.workflow_tracker_id"
              :disabled="!step.enabled"
              @click="$emit('step-click', step.transaction_type)"
            />
            <Arrow v-if="idx < getFullWorkflow(request.status, request.workflows).length - 1" />
          </template>
        </template>
        <template v-else>
          <div class="text-center text-gray-400 py-8 w-full">No workflow steps available for this request.</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StepCard from './StepCard.vue';
import Arrow from './Arrow.vue';

const props = defineProps({
  request: { type: Object, required: true }
});

function getIcon(type: string) {
  switch (type) {
    case "Requested": return "fas fa-file-alt";
    case "Dispatched": return "fas fa-truck";
    case "Received": return "fas fa-building";
    case "Return Cancelled": return "fas fa-times-circle";
    case "Restock Request": return "fas fa-truck-loading";
    case "Restocked": return "fas fa-box";
    case "Consumed": return "fas fa-burn";
    case "Returned": return "fas fa-undo-alt";
    case "Return Accepted": return "fas fa-check-circle";
    default: return "fas fa-question-circle";
  }
}

// Returns the full workflow steps for a given status, marking enabled/disabled
function getFullWorkflow(status: string, workflowArr: any[]) {

  const statusOrder = (status: string) => {
          if (status === "Requested") return 1;
          if (status === "Dispatched") return 2;
          if (status === "Received") return 3;

          if (status === "Request Cancelled") return 2;
          if (status === "Request Declined") return 2;

          if (status === "Consumed") return 1;
          if (status === "Returned") return 1;
          if (status === "Return Accepted") return 2;
          if (status === "Return Cancelled") return 2;
          if (status === "Return Declined") return 2;

          if(status === "Restock Request") return 1;
          if(status === "Restocked") return 2;
          if(status === "Restock Cancelled") return 2;
          if(status === "Restock Declined") return 2;

          return 4;
        };

        if (!workflowArr || !workflowArr.length) return [];

        const sorted = [...workflowArr].sort((a, b) => statusOrder(a.transaction_type) - statusOrder(b.transaction_type));

        const workflows: { [key: string]: string[] } = {
          "Restocked": ["Restock Request", "Restocked"],
          "Restock Cancelled": ["Restock Request", "Restock Cancelled"],
          "Restock Request": ["Restock Request", "Restocked"],
          
          "Requested": ["Requested", "Dispatched", "Received"],
          "Request Cancelled": ["Requested", "Request Cancelled"],
          "Request Declined": ["Requested", "Request Declined"],
          "Dispatched": ["Requested", "Dispatched", "Received"],
          "Received": ["Requested", "Dispatched", "Received"], // "Requested" is optional, but included for completeness
          
          "Consumed": ["Consumed"],
          "Returned": ["Returned"],
          "Return Accepted": ["Returned", "Return Accepted"],
          "Return Cancelled": ["Returned", "Return Cancelled"],
          "Return Declined": ["Returned", "Return Declined"],
        };

        const steps: string[] = workflows[status] ?? [];

        // Find the last enabled step index
        let lastEnabledIdx = -1;
        for (let i = 0; i < steps.length; i++) {
          if (workflowArr.find((w: any) => w.transaction_type === steps[i])) {
            lastEnabledIdx = i;
          }
        }

        // Build the full workflow with enabled/disabled
        return steps.map((type: string, idx: number) => {
          const found = workflowArr.find((w: any) => w.transaction_type === type);
          return {
            transaction_type: type,
            created_by_user_id: found ? found.created_by_user_id : "",
            created_by_user_name: found ? found.created_by_user_name : "",
            created_at: found ? found.created_at : "",
            workflow_tracker_id: found ? found.workflow_tracker_id : "",
            enabled: idx <= lastEnabledIdx && !!found
          };
        });
      

    
  // Map of status to full workflow steps
  // const workflows = {
  //   "Requested": ["Requested", "Dispatched", "Received"],
  //   "Return Cancelled": ["Requested", "Return Cancelled"],
  //   "Dispatched": ["Requested", "Dispatched", "Received"],
  //   "Received": ["Requested", "Dispatched", "Received"],
  //   "Restock Request": ["Restock Request", "Restocked"],
  //   "Restocked": ["Restock Request", "Restocked"],
  //   "Consumed": ["Consumed"],
  //   "Returned": ["Returned"],
  //   "Return Accepted": ["Returned", "Return Accepted"]
  // };
  // const steps = workflows[status] || [];
  // // Find the last enabled step index
  // let lastEnabledIdx = 0;
  // if (workflowArr && workflowArr.length) {
  //   // Find the index of the last step in workflowArr that matches steps
  //   for (let i = 0; i < steps.length; i++) {
  //     if (workflowArr.find(w => w.transaction_type === steps[i])) {
  //       lastEnabledIdx = i;
  //     }
  //   }
  // }
  // // Build the full workflow with enabled/disabled
  // return steps.map((type, idx) => {
  //   const found = workflowArr.find(w => w.transaction_type === type);
  //   return {
  //     transaction_type: type,
  //     created_by_user_id: found ? found.created_by_user_id : "",
  //     created_by_user_name: found ? found.created_by_user_name : "",
  //     created_at: found ? found.created_at : "",
  //     workflow_tracker_id: found ? found.workflow_tracker_id : "",
  //     enabled: idx <= lastEnabledIdx
  //   };
  // });
}
</script>