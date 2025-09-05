import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { useSiteStore } from "@/stores/siteStore";
import { hasPageAccess, Role } from "@/utils/permissions";
import PageNotFound from "@/pages/PageNotFound.vue";

// Lazy load all page components for better performance
const Login = () => import("@/pages/Login.vue");
const Menu = () => import("@/pages/Menu.vue");

const Home = () => import("@/pages/Home.vue");
const Inventory = () => import("@/pages/Inventory.vue");
const AddBulkStock = () => import("@/pages/AddBulkStock.vue");
const Users = () => import("@/pages/Users.vue");
const StockPresets = () => import("@/pages/StockPreset.vue");
const Sites = () => import("@/pages/Sites.vue");
const Site = () => import("@/pages/Site.vue");
const Reports = () => import("@/pages/Reports.vue");
const SiteStatus = () => import("@/pages/SiteStatus.vue");
const Database = () => import("@/pages/Database.vue");
const ReportsIndex = () => import("@/pages/Reports/Index.vue");
const ReportStockSummary = () =>
  import("@/pages/Reports/StockSummaryByMaterial.vue");

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/",
    component: Menu,
    meta: { requiresAuth: true },
    children: [
      { path: "home", name: "Home", component: Home },
      { path: "home/site_status", name: "SiteStatus", component: SiteStatus },
      {
        path: "inventory",
        name: "Inventory",
        component: Inventory,
      },
      {
        path: "inventory/add-bulk-stock",
        name: "AdminInventoryAddBulk",
        component: AddBulkStock,
      },
      {
        path: "inventory/add-bulk-stock/:requestId",
        name: "AdminInventoryAddBulkWithRequest",
        component: AddBulkStock,
      },
      { path: "users", name: "Users", component: Users },
      {
        path: "stock-presets",
        name: "StockPresets",
        component: StockPresets,
      },
      { path: "sites", name: "Sites", component: Sites },
      { path: "sites/:siteId", name: "Site", component: Site },
      // { path: "reports", name: "Reports", component: Reports },

      { path: "reports", name: "ReportsIndex", component: ReportsIndex },
      {
        path: "reports/stock-summary",
        name: "ReportStockSummary",
        component: () => import("@/pages/Reports/StockSummaryByMaterial.vue"),
      },
      {
        path: "reports/aging-stock",
        name: "ReportAgingStock",
        component: () => import("@/pages/Reports/AgingStock.vue"),
      },
      {
        path: "reports/site-stock-availability",
        name: "ReportSiteStockAvailability",
        component: () => import("@/pages/Reports/SiteStockAvailability.vue"),
      },
      {
        path: "reports/ho-stock-availability",
        name: "ReportHOStockAvailability",
        component: () => import("@/pages/Reports/HOStockAvailability.vue"),
      },
      {
        path: "reports/pending-supplier-requests",
        name: "ReportPendingSupplierRequests",
        component: () => import("@/pages/Reports/PendingSupplierRequests.vue"),
      },
      {
        path: "reports/risk-dashboard",
        name: "ReportRiskDashboard",
        component: () => import("@/pages/Reports/RiskDashboard.vue"),
      },

      {
        path: "order_bulk",
        name: "OrderBulk",
        component: () => import("@/pages/OrderBulk.vue"),
      },
      {
        path: "order_bulk",
        name: "OrderBulk",
        component: () => import("@/pages/OrderBulk.vue"),
      },
      { path: "data", name: "Database", component: Database },
      {
        path: "home/supplier-stock-checkin",
        name: "SupplierWorkflow",
        component: () => import("@/pages/SupplierWorkflow.vue"),
      },
      {
        path: "home/site-stock-checkin",
        name: "SiteWorkflow",
        component: () => import("@/pages/SiteWorkflow.vue"),
      },
    ],
  },
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: PageNotFound,
  },
  {
    path: "/:catchAll(.*)",
    name: "GlobalNotFound",
    component: PageNotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top
    return { top: 0 };
  },
});

// Global auth guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const siteStore = useSiteStore();
  await siteStore.fetchAccessibleSites();
  const isAuthenticated = authStore.isLoggedIn;
  const role = authStore.user?.role;

  // Restrict Site Staff from accessing sites they don't have access to
  if (to.name === "Site" && role === Role.SiteStaff) {
    const siteId = to.params.siteId;
    const allowedSiteIds =
      siteStore.accessibleSites.map((site: any) => site.id) || [];
    if (!allowedSiteIds.includes(siteId)) {
      next({ path: "/unauthorized" });
      return;
    }
  }
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ path: "/login", query: { redirect: to.fullPath } });
    return;
  }
  // Restrict access based on role and page
  const pageName = to.name as string;
  // Map route names to permission page keys
  const pageMap: Record<string, string> = {
    Home: "Home",
    Sites: "Sites",
    Users: "Users",
    StockPresets: "StockPresets",
    Reports: "Reports",
    Database: "Database",
    Site: "Site",
    SiteStatus: "SiteStatus",
    SupplierWorkflow: "SupplierWorkflow",
    SiteWorkflow: "SiteWorkflow",
    Inventory: "Inventory",
    // Add more as needed
  };
  const permissionPage = pageMap[pageName];
  if (
    permissionPage &&
    !hasPageAccess((role ?? "user") as any, permissionPage as any)
  ) {
    next({ path: "/unauthorized" });
    return;
  }
  next();
});

export default router;
