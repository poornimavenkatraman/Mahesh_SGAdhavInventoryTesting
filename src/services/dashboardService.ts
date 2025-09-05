// src/services/dashboardService.ts
import { computed } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useSiteStore } from "@/stores/siteStore";

export function useDashboardData() {
  const inventoryStore = useInventoryStore();
  const siteStore = useSiteStore();

  // Dashboard counts
  const supplierRequests = computed(
    () =>
      inventoryStore.supplierWorkflows.filter(
        (t) => t.current_status.trim() === "Restock Request"
      ).length
  );
  const siteRequests = computed(
    () =>
      inventoryStore.activeSitesWorkflows.filter(
        (t) => t.current_status === "Requested"
      ).length
  );
  const siteDeliveries = computed(
    () =>
      inventoryStore.activeSitesWorkflows.filter(
        (t) => t.current_status === "Dispatched"
      ).length
  );
  const siteReturns = computed(
    () =>
      inventoryStore.activeSitesWorkflows.filter(
        (t) => t.current_status === "Returned"
      ).length
  );

  // Active sites with counts
  const activeSites = computed(() => {
    return siteStore.accessibleSites.map((site) => ({
      ...site,
      requests: inventoryStore.activeSitesWorkflows.filter(
        (t) => t.site_id === site.id && t.current_status === "Requested"
      ).length,
      dispatches: inventoryStore.activeSitesWorkflows.filter(
        (t) => t.site_id === site.id && t.current_status === "Dispatched"
      ).length,
      returns: inventoryStore.activeSitesWorkflows.filter(
        (t) => t.site_id === site.id && t.current_status === "Returned"
      ).length,
    }));
  });

  return {
    supplierRequests,
    siteRequests,
    siteDeliveries,
    siteReturns,
    activeSites,
  };
}
