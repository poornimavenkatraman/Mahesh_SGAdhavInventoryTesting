import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as null | {
      uid: string;
      email: string;
      displayName?: string;
      role?: string;
    },
    token: null as null | string,
    isLoggedIn: false,
  }),
  actions: {
    setUser(
      user: { uid: string; email: string; displayName?: string; role?: string },
      token: string
    ) {
      this.user = user;
      this.token = token;
      this.isLoggedIn = true;
    },
    clearUser() {
      this.user = null;
      this.token = null;
      this.isLoggedIn = false;
    },
  },
  persist: true, // Persist entire auth state for login/session
});
