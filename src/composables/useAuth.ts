import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { auth, db } from "@/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// const user = ref(null as any);
// const role = ref<string | null>(null);
// const site = ref<string | null>(null);
// const isAuthenticated = ref(false);
const loading = ref(true);

export const useAuth = () => {
  const authStore = useAuthStore();

  const login = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;
    const userDoc = await getDoc(doc(db, "users", uid));
    const data = userDoc.data();
    authStore.setUser(
      {
        uid,
        email: result.user.email ?? "",
        displayName: result.user.displayName ?? undefined,
        role: data?.role || null,
      },
      (result.user as any).stsTokenManager?.accessToken ?? ""
    );
  };

  const logout = async () => {
    await signOut(auth);
    authStore.clearUser();
  };

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const data = userDoc.data();
      authStore.setUser(
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? undefined,
          role: data?.role || null,
        },
        (firebaseUser as any).stsTokenManager?.accessToken ?? ""
      );
    } else {
      authStore.clearUser();
    }
    loading.value = false;
  });

  return {
    user: authStore.user,
    role: authStore.user?.role,
    isAuthenticated: authStore.isLoggedIn,
    loading,
    login,
    logout,
  };
};
