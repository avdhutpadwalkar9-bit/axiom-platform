import { create } from "zustand";
import { api } from "@/lib/api";

interface AuthState {
  user: { id: string; email: string; name: string | null } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await api.getMe();
      set({ user, isLoading: false, isAuthenticated: true });
    } catch {
      set({ user: null, isLoading: false, isAuthenticated: false });
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false });
    window.location.href = "/login";
  },
}));
