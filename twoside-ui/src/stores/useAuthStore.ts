import { create } from "zustand";
import { APIClient, ApiError } from "@/api/client";
import { Endpoints } from "@/api/endpoints";

const CALLBACK_PATH = "/auth/google/callback";

interface AuthState {
  checking_session: boolean;
  is_authenticated: boolean;
  auth_error: string | null;

  initialize: () => Promise<void>;
  clearError: () => void;
  logout: () => Promise<void>;
}

// Cached so a double-fired effect can never post the single-use code twice.
let init_promise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  checking_session: true,
  is_authenticated: false,
  auth_error: null,

  initialize: () => {
    if (!init_promise) {
      init_promise = (async () => {
        // Returning from Google: exchange the code for a session.
        if (window.location.pathname === CALLBACK_PATH) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get("code");
          const state = params.get("state");
          const google_error = params.get("error");

          // Clean the URL first so a reload can't resubmit a used code.
          window.history.replaceState({}, "", "/");

          if (google_error || !code || !state) {
            set({
              auth_error: "Google sign-in was cancelled. Please try again.",
              checking_session: false,
            });
            return;
          }

          try {
            await Endpoints.googleCallback(code, state);
            set({ is_authenticated: true, checking_session: false });
          } catch (err) {
            set({ auth_error: ApiError.getErrorMessage(err), checking_session: false });
          }
          return;
        }

        // Normal load or reload: try to resume from the refresh cookie.
        const ok = await APIClient.refresh();
        set({ is_authenticated: ok, checking_session: false });
      })();
    }
    return init_promise;
  },

  clearError: () => set({ auth_error: null }),

  logout: async () => {
    try {
      await Endpoints.logout();
    } catch {
      // clear locally regardless
    }
    APIClient.setAccessToken(null);
    set({ is_authenticated: false });
  },
}));

// If a refresh fails mid-session, drop back to the login screen.
APIClient.onUnauthorized = () => {
  useAuthStore.setState({ is_authenticated: false });
};