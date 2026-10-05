import { useState } from "react";
import { ApiError } from "@/api/client";
import type { PendingWarning } from "@/types/types";

/**
 * Shared 409-warning → bypass flow for write forms (expense, loans, repayments).
 * handleError records a bypassable warning; confirmWarning returns the full
 * `bypass_warnings` list to send on the next submit.
 */
export function useWarningBypass() {
  const [pending_warning, setPendingWarning] = useState<PendingWarning | null>(
    null,
  );
  const [bypassed_codes, setBypassedCodes] = useState<string[]>([]);

  function handleError(err: unknown): boolean {
    if (
      err instanceof ApiError &&
      err.status === 409 &&
      err.extensions?.type === "WARNING" &&
      typeof err.extensions.code === "string"
    ) {
      setPendingWarning({ code: err.extensions.code, message: err.message });
      return true;
    }
    return false;
  }

  function confirmWarning(): string[] {
    if (!pending_warning) return bypassed_codes;
    const codes = [...bypassed_codes, pending_warning.code];
    setBypassedCodes(codes);
    setPendingWarning(null);
    return codes;
  }

  function dismissWarning(): void {
    setPendingWarning(null);
  }

  function resetWarnings(): void {
    setPendingWarning(null);
    setBypassedCodes([]);
  }

  return {
    pending_warning,
    bypassed_codes,
    handleError,
    confirmWarning,
    dismissWarning,
    resetWarnings,
  };
}
