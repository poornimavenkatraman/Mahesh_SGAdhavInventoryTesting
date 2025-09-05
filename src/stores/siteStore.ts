import { defineStore } from "pinia";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { useAuthStore } from "./authStore";
import { Role } from "@/utils/permissions";

export const useSiteStore = defineStore("site", {
  state: () => ({
    sites: [] as any[],
    sitesByIds: [] as any[],
    accessibleSites: [] as any[],
    activeSites: [] as any[],
    siteMaterials: [] as any[],
    siteMaterialsByMaterial: [] as any[],
    site: null as any,
    userSites: [] as any[],
    loading: false,
    lastFetched: null as number | null,
  }),
  getters: {
    allLocations(state) {
      return [
        ...new Set(state.sites.map((site) => site.location).filter(Boolean)),
      ];
    },
  },
  actions: {
    /**
     * Fetch and return stats for a site: requests, dispatches, returns
     */
    async fetchAccessibleSites() {
      this.loading = true;
      const authStore = useAuthStore();
      this.accessibleSites = [];
      try {
        if (
          authStore.user?.role === Role.Management ||
          authStore.user?.role === Role.HOStaff
        ) {
          await this.fetchSites();
          this.accessibleSites = this.sites;
        } else if (authStore.user?.role === Role.SiteStaff) {
          const userSitesQuery = query(
            collection(db, "user_sites"),
            where("user_id", "==", authStore.user.uid),
            where("is_active", "==", true)
          );
          const snap = await getDocs(userSitesQuery);
          const siteIds = snap.docs.map((doc) => doc.data().site_id);
          if (siteIds.length > 0) {
            await this.fetchSitesById(siteIds);
            this.accessibleSites = this.sitesByIds;
          }
        } else {
          this.accessibleSites = [];
        }
        this.lastFetched = Date.now();
      } catch (err) {
        console.error("Error fetching accessible sites:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchSiteStats(siteId: string) {
      const txQ = query(
        collection(db, "workflows"),
        where("site_id", "==", siteId)
      );
      const txSnap = await getDocs(txQ);
      const txs = txSnap.docs.map((doc) => doc.data());
      return {
        requests: txs.filter((t) => t.current_status === "Requested").length,
        dispatches: txs.filter((t) => t.current_status === "Dispatched").length,
        returns: txs.filter((t) => t.current_status === "Returned").length,
      };
    },
    async fetchActiveSites() {
      this.loading = true;
      const activeSitesQuery = query(
        collection(db, "sites"),
        where("status", "==", "Active")
      );
      const snap = await getDocs(activeSitesQuery);
      this.activeSites = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSites() {
      this.loading = true;
      const snap = await getDocs(collection(db, "sites"));
      this.sites = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSiteById(siteId: string) {
      this.loading = true;
      const siteDocRef = doc(db, "sites", siteId);
      const siteDocSnap = await getDoc(siteDocRef);
      const site = siteDocSnap.data();
      this.site = site
        ? { id: siteDocSnap.id, ...site }
        : {
            id: siteDocSnap.id,
            site: "",
            location: "",
            city: "",
            status: "",
            startDate: "",
            closedDate: "",
          };
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSitesById(siteIds: string[]) {
      this.loading = true;
      const sitesQuery = query(
        collection(db, "sites"),
        where("__name__", "in", siteIds)
      );
      const snap = await getDocs(sitesQuery);
      this.sitesByIds = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSiteMaterials(siteId: string) {
      this.loading = true;
      const siteMaterialsQuery = query(
        collection(db, "site_materials"),
        where("site_id", "==", siteId)
      );
      const snap = await getDocs(siteMaterialsQuery);
      this.siteMaterials = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchUserSites() {
      this.loading = true;
      const snap = await getDocs(collection(db, "user_sites"));
      this.userSites = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async fetchSiteMaterialsByMaterial(materialId: string) {
      this.loading = true;
      const materialQuery = query(
        collection(db, "site_materials"),
        where("material_id", "==", materialId)
      );
      const snap = await getDocs(materialQuery);
      this.siteMaterialsByMaterial = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.loading = false;
      this.lastFetched = Date.now();
    },
    async addSite(payload: {
      site: string;
      location: string;
      city: string;
      start_date: string;
      status: string;
    }) {
      this.loading = true;
      try {
        await addDoc(collection(db, "sites"), payload);
        // Optionally, refresh sites list
        await this.fetchActiveSites();
      } catch (err) {
        console.error("Error adding site:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchSiteByUserId(userId: string) {
      this.loading = true;
      try {
        const siteQuery = query(
          collection(db, "user_sites"),
          where("user_id", "==", userId)
        );
        const snap = await getDocs(siteQuery);
        this.sites = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Error fetching sites by user ID:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateSite(siteId: string, payload: any) {
      // Use Firestore updateDoc or your preferred update logic
      const { updateDoc, doc } = await import("firebase/firestore");
      await updateDoc(doc(db, "sites", siteId), payload);
      await this.fetchSites(); // Refresh sites list if needed
    },
  },
});
