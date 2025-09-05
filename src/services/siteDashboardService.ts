// src/services/siteDashboardService.ts
import { computed } from "vue";
import { useSiteStore } from "@/stores/siteStore";
import { useInventoryStore } from "@/stores/inventoryStore";

export function useSiteDashboardData(
  search: any,
  filterStatus: any,
  sortBy: any,
  filterType: any,
  locationFilter: any,
  viewAll: any
) {
  const siteStore = useSiteStore();
  const inventoryStore = useInventoryStore();

  // Sites with counts
  const sitesWithCounts = computed(() => {
    return siteStore.accessibleSites.map((site: any) => ({
      ...site,
      requests: inventoryStore.workflows.filter(
        (t: any) => t.site_id === site.id && t.current_status === "Requested"
      ).length,
      dispatches: inventoryStore.workflows.filter(
        (t: any) => t.site_id === site.id && t.current_status === "Dispatched"
      ).length,
      returns: inventoryStore.workflows.filter(
        (t: any) => t.site_id === site.id && t.current_status === "Returned"
      ).length,
    }));
  });

  // Filtering logic
  const filteredSitesAll = computed(() => {
    let filtered = sitesWithCounts.value
      .filter((p: any) => {
        if (filterStatus.value === "All") return true;
        if (filterStatus.value === "Active") return p.status === "Active";
        if (filterStatus.value === "Closed") return p.status === "Closed";
        if (filterStatus.value === "Archived") return p.status === "Archived";
        return true;
      })
      .filter(
        (p: any) =>
          (p.site &&
            p.site.toLowerCase().includes(search.value.toLowerCase())) ||
          (p.location &&
            p.location.toLowerCase().includes(search.value.toLowerCase())) ||
          (p.city && p.city.toLowerCase().includes(search.value.toLowerCase()))
      );
    if (locationFilter.value.trim() !== "") {
      filtered = filtered.filter(
        (p: any) =>
          p.location &&
          p.location.toLowerCase().includes(locationFilter.value.toLowerCase())
      );
    }
    if (filterType.value === "requests") {
      filtered = filtered.filter((p: any) => p.requests && p.requests !== 0);
    } else if (filterType.value === "dispatches") {
      filtered = filtered.filter(
        (p: any) => p.dispatches && p.dispatches !== 0
      );
    } else if (filterType.value === "returns") {
      filtered = filtered.filter((p: any) => p.returns && p.returns !== 0);
    }
    if (sortBy.value === "name") {
      filtered = filtered.sort((a: any, b: any) => {
        if (!a.name && !b.name) return 0;
        if (!a.name) return 1;
        if (!b.name) return -1;
        return a.name.localeCompare(b.name);
      });
    } else if (sortBy.value === "requests") {
      filtered = filtered.sort((a: any, b: any) => b.requests - a.requests);
    } else if (sortBy.value === "dispatches") {
      filtered = filtered.sort((a: any, b: any) => b.dispatches - a.dispatches);
    }
    filtered = [
      ...filtered.filter((p: any) => p.pinned),
      ...filtered.filter((p: any) => !p.pinned),
    ];
    return filtered;
  });

  const filteredSites = computed(() => {
    const all = filteredSitesAll.value;
    return viewAll.value ? all : all.slice(0, 4);
  });

  return {
    sitesWithCounts,
    filteredSitesAll,
    filteredSites,
  };
}
