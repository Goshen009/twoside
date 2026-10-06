import { useState } from "react";
import { ApiError } from "@/api/client";
import { Endpoints } from "@/api/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const auth_error = useAuthStore((s) => s.auth_error);
  const clearError = useAuthStore((s) => s.clearError);

  const [is_loading, setLoading] = useState(false);
  const [local_error, setLocalError] = useState<string | null>(null);

  const start = async () => {
    setLoading(true);
    setLocalError(null);
    clearError();
    try {
      window.location.href = await Endpoints.getGoogleAuthUrl();
    } catch (err) {
      setLocalError(ApiError.getErrorMessage(err));
      setLoading(false);
    }
  };

  const error = local_error ?? auth_error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="text-xl font-semibold">Welcome</h1>
      <button
        type="button"
        onClick={start}
        disabled={is_loading}
        className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-background disabled:opacity-60 cursor-pointer"
      >
        {is_loading ? "Redirecting…" : "Continue with Google"}
      </button>
      {error && <p className="text-sm text-muted">{error}</p>}
    </div>
  );
}