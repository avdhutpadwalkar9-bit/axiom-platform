import { create } from "zustand";
import { api } from "@/lib/api";

type CachedUser = { id: string; email: string; name: string | null };

interface AuthState {
  user: CachedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /**
   * Synchronously pull the cached user out of localStorage. Call this from a
   * client-only effect (useLayoutEffect) so the store matches the SSR guest
   * state on the initial render pass, then hydrates before paint. This is
   * what makes a returning user see their profile chip on the landing page
   * without waiting for the /auth/me round-trip.
   */
  hydrate: () => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

// Keys used to survive a full page reload.
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_CACHE_KEY = "cortexcfo:user";

function readCachedUser(): CachedUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.id !== "string" || typeof parsed.email !== "string") {
      return null;
    }
    return { id: parsed.id, email: parsed.email, name: parsed.name ?? null };
  } catch {
    return null;
  }
}

function readHasToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return false;
  }
}

// Initial state matches SSR — no localStorage reads at module load. Hydration
// happens in hydrate() which the SiteNav triggers before first paint.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const cached = readCachedUser();
    const hasToken = readHasToken();
    if (hasToken && cached) {
      set({ user: cached, isAuthenticated: true, isLoading: false });
    } else if (hasToken) {
      // Token present but no cached user — we still flag authenticated
      // optimistically so the nav doesn't flash guest CTAs; checkAuth() will
      // fill in the user object a beat later.
      set({ user: null, isAuthenticated: true, isLoading: true });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    if (!token) {
      if (typeof window !== "undefined") localStorage.removeItem(USER_CACHE_KEY);
      set({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await api.getMe();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        } catch {
          // quota / disabled storage — non-fatal.
        }
      }
      set({ user, isLoading: false, isAuthenticated: true });
    } catch {
      // Token is bad or server is unreachable — clear the optimistic state.
      if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_CACHE_KEY);
      }
      set({ user: null, isLoading: false, isAuthenticated: false });
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_CACHE_KEY);
    }
    set({ user: null, isAuthenticated: false });
    if (typeof window !== "undefined") window.location.href = "/login";
  },
}));
