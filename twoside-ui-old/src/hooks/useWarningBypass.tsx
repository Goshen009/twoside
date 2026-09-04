import { useState } from "react";
import { ApiError } from "../libs/api/cilent";

export type PendingWarning = {
  code: string;
  message: string;
};

export function useWarningBypass() {
  const [pending_warning, set_pending_warning] = useState<PendingWarning | null>(null);
  const [bypassed_codes, set_bypassed_codes] = useState<string[]>([]);

  /** Returns true when the error is a bypassable 409 WARNING; records it as the pending warning. */
  function handleError(err: unknown): boolean {
    if (
      err instanceof ApiError &&
      err.status === 409 &&
      err.extensions?.type === "WARNING" &&
      typeof err.extensions.code === "string"
    ) {
      set_pending_warning({ code: err.extensions.code, message: err.message });
      return true;
    }
    return false;
  }

  /** Confirm the pending warning: adds its code to the bypass list and returns the full list to send. */
  function confirm(): string[] {
    if (!pending_warning) return bypassed_codes;
    const codes = [...bypassed_codes, pending_warning.code];
    set_bypassed_codes(codes);
    set_pending_warning(null);
    return codes;
  }

  /** Clear the pending warning without bypassing it (X / click-to-dismiss / field edit). */
  function dismiss() {
    set_pending_warning(null);
  }

  /** Reset all warning state after a successful submit. */
  function reset() {
    set_pending_warning(null);
    set_bypassed_codes([]);
  }

  return { pending_warning, bypassed_codes, handleError, confirm, dismiss, reset };
}
