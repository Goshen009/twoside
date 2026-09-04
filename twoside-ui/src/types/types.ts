import type { ReactNode } from "react";

export type AuthContextValue = {
  is_authenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export type AmbientToken = {
  symbol: string;
  top: string;
  left?: string;
  right?: string;
  duration: number;
  delay: number;
};

export type PageTransitionProps = {
  children: ReactNode;
};
