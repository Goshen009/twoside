import { TopographicHeader } from "@/components/layout/TopographicHeader";
import { BrandEmblem } from "@/components/ui/BrandEmblem";
import { ChevronDown } from "lucide-react";
import { ErrorToast } from "@/components/ui/ErrorToast";

function getGmtOffset(timeZone: string): string {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());

  const offsetPart = formatted.find((part) => part.type === "timeZoneName");
  return offsetPart?.value.replace("GMT", "GMT") ?? "";
}

const timezones = [
  { value: "Africa/Lagos", label: "Africa/Lagos" },
  { value: "Africa/Accra", label: "Africa/Accra" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
  { value: "America/New_York", label: "America/New York" },
];

export function OnboardPage() {
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
          Just a few questions...
        </h1>

        <form
          className="w-full flex flex-col gap-3.5 max-w-sm"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Field 1: Name */}
          <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200">
            <label htmlFor="name" className="block text-[10px] font-medium text-muted">
              What shalt thou be called?
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="e.g Goshen"
              className="w-full bg-transparent p-0 pt-0.5 border-none text-foreground placeholder:text-muted/70 font-normal focus:ring-0 focus:outline-none text-xs"
            />
          </div>

          {/* Field 2: Currency */}
          <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200 cursor-pointer">
            <label htmlFor="currency" className="block text-[10px] font-medium text-muted">
              What currency dost thou use?
            </label>
            <div className="flex items-center justify-between pt-0.5">
	            <select
	               id="currency"
	               name="currency"
	               defaultValue="₦"
	               className="w-full bg-transparent p-0 border-none text-foreground font-medium text-xs focus:ring-0 focus:outline-none appearance-none cursor-pointer"
	             >
	                <option value="₦">₦123,456.78</option>
	                <option value="₵">₵123,456.78</option>
	                <option value="£">£123,456.78</option>
	                <option value="$">$123,456.78</option>
              </select>
              <ChevronDown className="w-4 h-4 text-muted -mt-3" />
            </div>
          </div>

          {/* Field 3: Timezone */}
          <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200 cursor-pointer">
            <label htmlFor="timezone" className="block text-[10px] font-medium text-muted">
              By what hour dost thou live?
            </label>
            <div className="flex items-center justify-between pt-0.5">
	           	<select
	              id="timezone"
	              name="timezone"
	              defaultValue="Africa/Lagos"
	              className="w-full bg-transparent p-0 border-none text-foreground font-medium text-xs focus:ring-0 focus:outline-none appearance-none cursor-pointer"
	            >
              {timezones.map((tz) => (
              	<option key={tz.value} value={tz.value}>
               		{tz.label} ({getGmtOffset(tz.value)})
               	</option>
              ))}
	            </select>
              <ChevronDown className="w-4 h-4 text-muted -mt-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-xs rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition duration-150 ease-in-out cursor-pointer mt-1"
          >
            Continue
          </button>
        </form>
      </main>
    </div>
  );
}