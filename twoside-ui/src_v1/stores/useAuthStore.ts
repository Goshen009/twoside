import { create } from "zustand";
import { APIClient } from "@/api/client";
import { Endpoints, isVerifyOTPSuccess, type VerifyOtpResponse, type VerifyOtpSuccess } from "@/api/endpoints";

interface AuthState {
  is_authenticated: boolean;
  checking_session: boolean;
  requires_onboarding: boolean;
  pending_email: string | null;   // set during OTP flow, cleared once resolved
  logged_in_email: string | null; // the confirmed, logged-in user's email
    
  initialize: () => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (otp: string, mode: "login" | "register") => Promise<VerifyOtpResponse>;
  confirmPending: () => Promise<VerifyOtpSuccess>;
  logout: () => Promise<void>;
  setProfile: (username: string, iana_timezone: string, currency_symbol: string) => Promise<void>;
}

export class MissingEmailError extends Error {
  constructor() {
    super("No email on record");
    this.name = "MissingEmailError";
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  is_authenticated: false,
  checking_session: true,
  requires_onboarding: false,
  pending_email: null,
  logged_in_email: null,

  initialize: async () => {
  	const minimumDelay = new Promise((resolve) => setTimeout(resolve, 2000));
    const [result] = await Promise.all([
      APIClient.refresh(),
      minimumDelay,
    ]);
    set({
      is_authenticated: result !== null,
      requires_onboarding: result?.status === "REQUIRES_ONBOARDING",
      logged_in_email: result?.email ?? null,
      checking_session: false,
    });
  },

  requestOtp: async (email: string) => {
    await Endpoints.requestOtp(email);
    set({ pending_email: email });
  },
  
  verifyOtp: async (otp: string, mode: "login" | "register") => {
  	const pending_email = get().pending_email;
    if (!pending_email) throw new MissingEmailError();

    const result = mode === "login"
        ? await Endpoints.login(pending_email, otp)
        : await Endpoints.register(pending_email, otp);

    if (isVerifyOTPSuccess(result)) {
      set({
      	pending_email: null,
      	is_authenticated: true,
       	requires_onboarding: result.status === "REQUIRES_ONBOARDING",
        logged_in_email: result.email,
      });
    }
    
    return result;
  },

  confirmPending: async () => {
    const result = await Endpoints.confirmPending();
    set({
    	pending_email: null,
      is_authenticated: true,
      requires_onboarding: result.status === "REQUIRES_ONBOARDING",
      logged_in_email: result.email,
    });
    return result;
  },

  logout: async () => {
    await Endpoints.logout();
    set({ is_authenticated: false, requires_onboarding: false, logged_in_email: null });
  },

  setProfile: async (username: string, iana_timezone: string, currency_symbol: string) => {
    await Endpoints.setProfile(username, iana_timezone, currency_symbol);
    set({ requires_onboarding: false });
  },
}));

APIClient.onUnauthorized = () => {
  useAuthStore.setState({ is_authenticated: false, requires_onboarding: false, logged_in_email: null });
};