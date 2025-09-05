import { defineStore } from "pinia";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  where,
  query,
  setDoc,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useAuthStore } from "./authStore";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as any[],
    loading: false,
    lastFetched: null as number | null,
  }),
  actions: {
    async getUserById(id: string) {
      this.loading = true;
      try {
        const snap = await getDocs(collection(db, "users"));
        const doc = snap.docs.find((d) => d.id === id);
        return doc ? { id: doc.id, ...doc.data() } : null;
      } finally {
        this.loading = false;
      }
    },
    async fetchUsers() {
      this.loading = true;
      const usersQuery = query(collection(db, "users"));
      const snap = await getDocs(usersQuery);
      this.users = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async addUser(payload: {
      name: string;
      email: string;
      password: string;
      role: string;
      sites: string[];
    }) {
      this.loading = true;
      try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          payload.email,
          payload.password
        );
        const uid = userCredential.user.uid;
        // Use uid as the Firestore document ID
        await setDoc(doc(db, "users", uid), {
          user: payload.name,
          email: payload.email,
          role: payload.role,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          created_by: useAuthStore().user?.uid,
          updated_by: useAuthStore().user?.uid,
          is_deleted: false,
        });

        for (const siteId of payload.sites) {
          await addDoc(collection(db, "user_sites"), {
            user_id: uid,
            site_id: siteId,
            is_active: true,
            start_date: serverTimestamp(),
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            created_by: useAuthStore().user?.uid,
            updated_by: useAuthStore().user?.uid,
          });
        }
        // Optionally, refresh users list
        await this.fetchUsers();
      } catch (err) {
        console.error("Error adding user:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id: string, payload: Partial<(typeof this.users)[0]>) {
      this.loading = true;
      try {
        const userRef = doc(db, "users", id);
        await updateDoc(userRef, payload);
        // Optionally, refresh users list
        await this.fetchUsers();
      } catch (err) {
        console.error("Error updating user:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(id: string) {
      this.loading = true;
      try {
        const userRef = doc(db, "users", id);
        await updateDoc(userRef, { is_deleted: true });
        // Optionally, refresh users list
        await this.fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
