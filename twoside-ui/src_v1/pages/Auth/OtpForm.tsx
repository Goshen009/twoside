import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useAuthStore, MissingEmailError } from "@/stores/useAuthStore";
import { ApiError } from "@/api/client";
import type { Mode } from "./AuthFlow";
import { AuthMismatchSheet } from "./AuthMismatchSheet";
import { isVerifyOTPSuccess } from "@/api/endpoints";

interface OtpFormProps {
  onBack: () => void;
  onError: (message: string) => void;
  onClearError: () => void;
  onExpired: (message: string) => void;
  mode: Mode;
}

const RESEND_COOLDOWN_SECONDS = 90;

const MISMATCH_COPY = {
  NOT_FOUND: {
    title: "We don't recognize this one",
    message: "No account found for this email. Want to create one?",
    confirm_label: "Create my account",
    cancel_label: "Try another email",
  },
  ALREADY_EXISTING: {
    title: "You're already one of us",
    message: "There's already an account with this email. Want to sign in instead?",
    confirm_label: "Log me in",
    cancel_label: "Use a different email",
  },
} as const;

export function OtpForm({ onBack, onError, onClearError, onExpired, mode }: OtpFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [mismatch, setMismatch] = useState<"NOT_FOUND" | "ALREADY_EXISTING" | null>(null);
  const [seconds_left, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);

  const pending_email = useAuthStore((state) => state.pending_email);
  const requestOtp = useAuthStore((state) => state.requestOtp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const confirmPending = useAuthStore((state) => state.confirmPending);

  useEffect(() => {
    if (seconds_left <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds_left]);

  const handleResend = async () => {
    if (!pending_email || seconds_left > 0) return;
    setResending(true);
    try {
      await requestOtp(pending_email);
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      onError(ApiError.getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyOtp(code, mode);
      if (isVerifyOTPSuccess(result)) return; // store update triggers redirect via route guards
      setMismatch(result.status); // mismatched — result.status is "NOT_FOUND" or "ALREADY_EXISTING"
    } catch (error) {
    	if (error instanceof MissingEmailError) {
        onBack();
        return;
      }
      onError(ApiError.getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const handleConfirmMismatch = async () => {
      setConfirming(true);
      try {
        await confirmPending();
      } catch (error) {
      	setMismatch(null);
      
        if (error instanceof ApiError && error.extensions?.code === "EXPIRED_PENDING_TOKEN") {
          onExpired(error.message);
          return;
        }
      
        onError(ApiError.getErrorMessage(error));
      } finally {
        setConfirming(false);
      }
    }

  return (
  	<>
	    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5 max-w-sm">
	      <div className="relative w-full bg-background rounded-2xl border border-border/50 px-4 py-2.5 transition duration-200">
	        <label htmlFor="email" className="block text-[10px] font-medium text-muted">
	          Email
	        </label>
	        <input
	          id="email"
	          name="email"
	          type="email"
	          readOnly
	          disabled
	          value={pending_email ?? ""}
	          className="w-full bg-transparent p-0 pt-0.5 pr-6 border-none text-muted text-xs font-normal focus:ring-0 focus:outline-none cursor-not-allowed"
	        />
	        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/60 pointer-events-none" />
	      </div>
	
	      <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200">
	        <input
	          id="otp"
	          name="otp"
	          type="text"
	          required
	          inputMode="numeric"
	          maxLength={6}
	          autoComplete="one-time-code"
	          placeholder="XXXXXX"
	          value={code}
	          onChange={(e) => setCode(e.target.value)}
	          onFocus={onClearError}
	          className="w-full bg-transparent p-0 pt-0.5 border-none text-foreground placeholder:text-muted/70 font-normal focus:ring-0 focus:outline-none tracking-widest text-center text-lg"
	        />
	      </div>
	
	      <button
	        type="submit"
	        disabled={loading}
	        onFocus={onClearError}
	        className="w-full h-11 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-xs rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
	      >
	        {loading ? "Verifying..." : "Verify"}
	      </button>
	
	      <p className="text-[10px] text-center text-muted leading-relaxed mt-1">
          {seconds_left > 0 ? (
            <>Didn't get it? Try again in {seconds_left} second{seconds_left === 1 ? "" : "s"}</>
          ) : (
            <>
              Didn't get it?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                onFocus={onClearError}
                className="text-primary hover:underline font-medium cursor-pointer bg-transparent border-none p-0 inline disabled:opacity-50"
              >
                {resending ? "Resending..." : "Send it again"}
              </button>
            </>
          )}
          {" "}or{" "}
          <button
            type="button"
            onClick={onBack}
            className="text-primary hover:underline font-medium cursor-pointer bg-transparent border-none p-0 inline"
          >
            change the email
          </button>
          .
        </p>
	    </form>

			<AuthMismatchSheet
			  is_open={mismatch !== null}
			  {...(mismatch ? MISMATCH_COPY[mismatch] : { title: "", message: "", confirm_label: "", cancel_label: "" })}
			  loading={confirming}
			  onConfirm={handleConfirmMismatch}
			  onCancel={() => {
			    setMismatch(null);
			    onBack();
			  }}
			/>
   </>
  );
}