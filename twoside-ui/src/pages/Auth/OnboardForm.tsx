import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface OnboardFormProps {
  onComplete: () => void;
}

function getGmtOffset(timeZone: string): string {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());

  const offsetPart = formatted.find((part) => part.type === "timeZoneName");
  return offsetPart?.value ?? "";
}

const timezones = [
  { value: "Africa/Lagos", label: "Lagos" },
  { value: "Africa/Accra", label: "Accra" },
  { value: "Europe/London", label: "London" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "America/New_York", label: "New York" },
];

export function OnboardForm({ onComplete }: OnboardFormProps) {
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5 max-w-sm">
      <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200">
        <label htmlFor="name" className="block text-[10px] font-medium text-muted">
          What shalt thou be called?
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Adebayo, Sarah..."
          className="w-full bg-transparent p-0 pt-0.5 border-none text-foreground placeholder:text-muted/70 font-normal focus:ring-0 focus:outline-none text-xs"
        />
      </div>

      <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200 cursor-pointer">
        <label htmlFor="currency" className="block text-[10px] font-medium text-muted">
          What currency dost thou use
        </label>
        <div className="relative flex items-center justify-between pt-0.5">
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
          <ChevronDown className="w-4 h-4 text-muted -mt-2 pointer-events-none" />
        </div>
      </div>

      <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200 cursor-pointer">
        <label htmlFor="timezone" className="block text-[10px] font-medium text-muted">
          What hour dost thou keep?
        </label>
        <div className="relative flex items-center justify-between pt-0.5">
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
          <ChevronDown className="w-4 h-4 text-muted -mt-2 pointer-events-none" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-xs rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition duration-150 ease-in-out cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Continuing..." : "Continue"}
      </button>
    </form>
  );
}