import { createContext, useContext } from "react";

export type AuthContextValue = {
  is_authenticated: boolean;
  markAsAuthenticated: () => void;
  signOut: () => Promise<void>;
};

export const auth_context = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(auth_context);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}