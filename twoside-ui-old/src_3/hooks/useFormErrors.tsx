import { useState } from "react";
import { ApiError } from "@/lib/api/client";

export function useFormErrors() {
  const [field_errors, set_field_errors] = useState<Record<string, string>>({});
  const [banner_error, set_banner_error] = useState<string | null>(null);

  function applyError(err: unknown) {
    set_field_errors({});
    set_banner_error(null);
    if (err instanceof ApiError && err.fields?.length) {
      const next: Record<string, string> = {};
      err.fields.forEach((f) => { next[f.field] = f.message; });
      set_field_errors(next);
      return;
    }
    if (err instanceof ApiError) {
      set_banner_error(err.message);
      return;
    }
    set_banner_error("Something went wrong. Please try again.");
  }

  function clear() {
    set_field_errors({});
    set_banner_error(null);
  }

  return { field_errors, banner_error, applyError, clear };
}