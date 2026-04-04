import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type AuthResponse } from "../api/auth";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "student" | "instructor" | "admin";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response: AuthResponse = await authApi.login({ email, password });

          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", response.accessToken);
            if (response.refreshToken) {
              localStorage.setItem("refresh_token", response.refreshToken);
            }
          }

          set({
            user: response.user ?? null,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error && "response" in error
              ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Login failed"
              : "Login failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore
        } finally {
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      setUser: (user: User) => set({ user }),

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        try {
          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch {
          set({ isAuthenticated: false, user: null });
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
        }
      },

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: "coursue-admin-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

