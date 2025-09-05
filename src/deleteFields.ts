import { getFirestore, collection, getDocs, updateDoc, doc, deleteField } from "firebase/firestore";
import { db } from "@/firebase"; // Import Firestore instance

const deleteFields = async () => {
  const colRef = collection(db, "inventory");
  const snapshot = await getDocs(colRef);

  for (const d of snapshot.docs) {
    const ref = doc(db, "inventory", d.id);
    await updateDoc(ref, {
      MIN_STOCK_LEVEL: deleteField(),
      MAX_STOCK_LEVEL: deleteField(),
      SUPPLIER_ID:  deleteField(),
      REORDER_STATUS:  deleteField(),
      QUALITY_STATUS:	 deleteField(),
      UNIT_COST_INR: deleteField()
      // add more fields if needed
    });
    console.log(`Updated: ${d.id}`);
  }
};

deleteFields();
