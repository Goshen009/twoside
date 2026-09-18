import { create } from "zustand";
import { APIClient } from "@/api/client";
import { Endpoints } from "@/api/endpoints";

interface AuthState {
  email: string | null;
  is_authenticated: boolean;
  checking_session: boolean;
  requires_onboarding: boolean;
    
  initialize: () => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get ) => ({
  email: null,
  is_authenticated: false,
  checking_session: true,
  requires_onboarding: false,

  initialize: async () => {
  	const minimumDelay = new Promise((resolve) => setTimeout(resolve, 2000));
    const [success] = await Promise.all([
      APIClient.refresh(),
      minimumDelay,
    ]);
    set({ is_authenticated: success, checking_session: false });
  },

  requestOtp: async (email) => {
      await Endpoints.requestOtp(email);
      set({ email });
    },
  
    verifyOtp: async (otp) => {
      const email = get().email;
      if (!email) throw new Error("No email on record — request an OTP first");
  
      const { requires_onboarding } = await Endpoints.verifyOtp(email, otp);
      set({ is_authenticated: true, requires_onboarding });
    },

  logout: async () => {
    await Endpoints.logout();
    set({ is_authenticated: false });
  }
}));

APIClient.onUnauthorized = () => {
  useAuthStore.setState({ is_authenticated: false });
};