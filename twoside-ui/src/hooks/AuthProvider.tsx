import { useEffect, useState, type ReactNode } from "react";
import { auth_context } from "./auth-context";

import ApiClient from "@/lib/api/client";
import AuthApi from "@/lib/api/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [is_authenticated, set_is_authenticated] = useState(false);
  const [checking_session, set_checking_session] = useState(true);

  useEffect(() => {
    AuthApi.refreshSession().then((success) => {
      set_is_authenticated(success);
      set_checking_session(false);
    });
  }, []);

  useEffect(() => {
    ApiClient.on_unauthorized = () => set_is_authenticated(false);
    return () => {
      ApiClient.on_unauthorized = null;
    };
  }, []);

  function markAsAuthenticated() {
    set_is_authenticated(true);
  }

  async function signOut() {
    await AuthApi.logout();
    set_is_authenticated(false);
  }

  if (checking_session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <auth_context.Provider value={{ is_authenticated, markAsAuthenticated, signOut }}>
      {children}
    </auth_context.Provider>
  );
}