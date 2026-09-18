import { TopographicHeader } from "@/components/layout/TopographicHeader";
import { BrandEmblem } from "@/components/ui/BrandEmblem";
import { Lock } from "lucide-react";
import { ErrorToast } from "@/components/ui/ErrorToast";

export function OtpPage() {
	const is_error = false;
	
  return (
    <div className="min-h-screen bg-background flex flex-col">
	    {is_error && (
	       <ErrorToast message="An error occurred. Please try again" />
	     )}
    
      <TopographicHeader height={300} />

      <main className="relative px-6 pb-6 flex-1 flex flex-col items-center z-20">
        <div className="mb-4 -mt-7">
          <BrandEmblem is_error={is_error} />
        </div>

        <h1 className="text-lg font-bold text-foreground tracking-tight text-center mb-6">
        	I've emailed you a code
        </h1>

        <form
          className="w-full flex flex-col gap-3.5 max-w-sm"
          onSubmit={(e) => e.preventDefault()}
        >
	        <div className="relative w-full bg-background rounded-2xl border border-border/50 px-4 py-2.5 transition duration-200">
	          <label htmlFor="email" className="block text-[10px] font-medium text-muted">
	            Email
	          </label>
	          <input
	            id="email"
	            name="email"
	            type="email"
	            autoComplete="email"
	            readOnly
	            disabled
	            value="example@google.com"
	            className="w-full bg-transparent p-0 pt-0.5 pr-6 border-none text-muted text-xs font-normal focus:ring-0 focus:outline-none cursor-not-allowed"
	          />
	          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/60 pointer-events-none" />
	        </div>

          <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200">
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={7}
              autoComplete="one-time-code"
              placeholder="XXX XXX"
              className="w-full bg-transparent p-0 pt-0.5 border-none text-foreground placeholder:text-muted/70 font-normal focus:ring-0 focus:outline-none tracking-widest text-center text-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary-hover active:scale-[0.99] text-foreground font-bold text-xs rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition duration-150 ease-in-out cursor-pointer"
          >
            Verify
          </button>

          <p className="text-[10px] text-center text-muted leading-relaxed mt-1">
            Didn't get the code? Try again in{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium cursor-pointer bg-transparent border-none p-0 inline"
            >
              43 seconds
            </button>{" "}
            or{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium cursor-pointer bg-transparent border-none p-0 inline"
            >
              change the email
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}