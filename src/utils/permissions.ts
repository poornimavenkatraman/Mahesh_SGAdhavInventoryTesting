// Centralized permissions map and utility for RBAC

export enum Role {
  Management = "Management",
  HOStaff = "HO Staff",
  SiteStaff = "Site Staff",
}

// export type Role = "Management" | "HO Staff" | "Site Staff";

export const countsEditable = true;

export type Action =
  | "addUser"
  | "deleteUser"
  | "editUser"
  | "addCategory"
  | "editCategory"
  | "deleteCategory"
  | "addSubcategory"
  | "editSubcategory"
  | "deleteSubcategory"
  | "addMaterial"
  | "editMaterial"
  | "deleteMaterial"
  | "addSupplier"
  | "editSupplier"
  | "deleteSupplier"
  | "addSite"
  | "editSite"
  | "deleteSite"
  | "closeSite"
  | "requestInventory"
  | "restockInventory"
  | "cancelInventoryRequest"
  | "requestStock"
  | "cancelStockRequest"
  | "declineStockRequest"
  | "dispatchStock"
  | "receiveStock"
  | "consumeStock"
  | "returnStock"
  | "cancelStockReturn"
  | "declineStockReturn"
  | "acceptReturnedStock";

export type Page =
  | "Home"
  | "Inventory"
  | "Sites"
  | "StockPresets"
  | "Reports"
  | "Users"
  | "Database"
  | "Suppliers"
  | "SupplierWorkflow"
  | "SiteWorkflow"
  | "SiteStatus"
  | "Site";

export const permissions: Record<Role, Action[]> = {
  Management: [
    "addUser",
    "deleteUser",
    "editUser",
    "addCategory",
    "editCategory",
    "deleteCategory",
    "addSubcategory",
    "editSubcategory",
    "deleteSubcategory",
    "addMaterial",
    "editMaterial",
    "deleteMaterial",
    "addSupplier",
    "editSupplier",
    "deleteSupplier",
    "addSite",
    "editSite",
    "deleteSite",
    "closeSite",
    "requestInventory",
    "restockInventory",
    "cancelInventoryRequest",
    "declineStockRequest",
    "dispatchStock",
    "declineStockReturn",
    "acceptReturnedStock",
  ],
  "HO Staff": [
    "addUser",
    "deleteUser",
    "editUser",
    "addCategory",
    "editCategory",
    "deleteCategory",
    "addSubcategory",
    "editSubcategory",
    "deleteSubcategory",
    "addMaterial",
    "editMaterial",
    "deleteMaterial",
    "addSupplier",
    "editSupplier",
    "deleteSupplier",
    "addSite",
    "editSite",
    "deleteSite",
    "closeSite",
    "requestInventory",
    "restockInventory",
    "cancelInventoryRequest",
    "declineStockRequest",
    "dispatchStock",
    "declineStockReturn",
    "acceptReturnedStock",
  ],
  "Site Staff": [
    "requestStock",
    "cancelStockRequest",
    "receiveStock",
    "consumeStock",
    "returnStock",
    "cancelStockReturn",
  ],
};

export const pagePermissions: Record<Role, Page[]> = {
  Management: [
    "Home",
    "Inventory",
    "Sites",
    "Site",
    "StockPresets",
    "Reports",
    "Users",
    "Database",
    "Suppliers",
    "SupplierWorkflow",
    "SiteWorkflow",
    "SiteStatus",
  ],
  "HO Staff": [
    "Home",
    "Inventory",
    "Sites",
    "Site",
    "StockPresets",
    "Suppliers",
    "SupplierWorkflow",
    "SiteWorkflow",
    "SiteStatus",
  ],
  "Site Staff": ["Home", "Sites", "SiteWorkflow", "SiteStatus", "Site"],
};

export function hasAccess(role: Role, action: Action): boolean {
  return permissions[role]?.includes(action);
}

export function hasPageAccess(role: Role, page: Page): boolean {
  return pagePermissions[role]?.includes(page);
}

// Usage example:
// import { hasAccess, hasPageAccess } from '@/utils/permissions';
// if (hasAccess(currentUser.role, 'addUser')) { /* show button */ }
// if (hasPageAccess(currentUser.role, 'AddUser')) { /* show page or route */ }
