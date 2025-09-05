export enum TransactionState {
  RestockRequest = "Restock Request",
  RestockCancelled = "Restock Cancelled",
  Restocked = "Restocked",
  Requested = "Requested",
  RequestCancelled = "Request Cancelled",
  RequestDeclined = "Request Declined",
  Dispatched = "Dispatched",
  Received = "Received",
  Consumed = "Consumed",
  Returned = "Returned",
  ReturnCancelled = "Return Cancelled",
  ReturnDeclined = "Return Declined",
  ReturnAccepted = "Return Accepted",
}

// Transaction states for supplier and site workflows

export const supplierTransactionStates = [
  "Restock Request",
  "Restock Cancelled",
  "Restocked",
  // Alternatives: Restock Voided, Restock Rejected, Restock Aborted
];

export const siteTransactionStates = [
  "Requested",
  "Request Cancelled",
  "Request Declined",
  "Dispatched",
  "Received",
  "Consumed",
  "Returned",
  "Return Cancelled",
  "Return Declined",
  "Return Accepted",
];

export const allTransactions = [
  {
    type: "Supplier",
    states: supplierTransactionStates,
  },
  {
    type: "Site",
    states: siteTransactionStates,
  },
];

export const workflowCombinations = [
  ["Requested"],
  ["Requested", "Request Cancelled"],
  ["Requested", "Request Declined"],
  ["Requested", "Dispatched"],
  ["Requested", "Dispatched", "Received"],
  ["Dispatched"],
  ["Dispatched", "Received"],
  ["Consumed"],
  ["Returned"],
  ["Returned", "Return Cancelled"],
  ["Returned", "Return Declined"],
  ["Returned", "Return Accepted"],
];

export const terminalStatuses = [
  "Request Cancelled",
  "Request Declined",
  "Received",
  "Consumed",
  "Return Cancelled",
  "Return Declined",
  "Return Accepted",
];

export const initialStatuses = ["Restock Request", "Requested", ""];
// Usage:
// import { supplierTransactionStates, siteTransactionStates } from '@/utils/states';
