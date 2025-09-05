// Firestore workflow_tracker collection utility
// Each document: { name: string, current_count: number }

import { collection, setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";

export async function initializeWorkflowTracker() {
  const trackerData = [
    { name: "SUP_REQ", counter: 0 },
    { name: "SITE_REQ", counter: 0 },
    { name: "SITE_CON", counter: 0 },
    { name: "SITE_RET", counter: 0 },
    { name: "SUP_WORKFLOW", counter: 0 },
    { name: "SITE_WORKFLOW", counter: 0 },
  ];

  for (const entry of trackerData) {
    await setDoc(doc(collection(db, "workflow_trackers"), entry.name), entry);
  }
}

// Usage:
// await initializeWorkflowTracker();
// To update a counter, use Firestore updateDoc on the document with the name you want.
