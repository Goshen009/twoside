import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";

interface EmailFormProps {
  onComplete: () => void;
}

export function EmailForm({ onComplete }: EmailFormProps) {
	const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const requestOtp = useAuthStore((state) => state.requestOtp);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp(email);
      onComplete();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5 max-w-sm">
      <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200">
        <label htmlFor="email" className="block text-[10px] font-medium text-muted">
          Email
        </label>
        <input
        	id="email"
         	name="email"
         	type="email"
         	required
         	autoComplete="email"
         	placeholder="e.g somerandomthingy@email.com"
         	value={email}
         	onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent p-0 pt-0.5 border-none text-foreground placeholder:text-muted/70 text-xs font-normal focus:ring-0 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-xs rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending Verification Code..." : "Send Verification Code"}
      </button>

      <div className="w-full max-w-sm my-4 flex items-center justify-center">
        <span className="text-[10px] text-muted opacity-60 font-medium tracking-wide uppercase">
          Or
        </span>
      </div>

      <button
        type="button"
        className="w-full max-w-sm h-11 bg-surface hover:bg-surface-hover active:scale-[0.99] border border-border rounded-full flex items-center justify-center gap-3 text-foreground font-medium text-xs transition duration-150 ease-in-out cursor-pointer shadow-lg mb-6"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Continue with Google</span>
      </button>
    </form>
  );
}