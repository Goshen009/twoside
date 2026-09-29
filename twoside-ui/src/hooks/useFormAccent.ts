import { createContext, useContext } from "react";

export const FormAccentContext = createContext<string>("var(--color-primary)");

export function useFormAccent(): string {
  return useContext(FormAccentContext);
}