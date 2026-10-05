import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "@/stores/useUserStore";

const timezones = [
  { value: "Africa/Lagos", label: "Lagos" },
  { value: "Africa/Accra", label: "Accra" },
  { value: "Europe/London", label: "London" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "America/New_York", label: "New York" },
];

export function ProfileSettingsPage() {
  const data = useUserStore((state) => state.data);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // TODO: wire to real profile-update endpoint once it exists
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-28 app-container">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200">
          <label htmlFor="username" className="block text-[10px] font-medium text-muted">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={1}
            maxLength={40}
            defaultValue={data?.username}
            className="w-full bg-transparent p-0 pt-0.5 border-none text-foreground text-xs font-normal focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200 cursor-pointer">
          <label htmlFor="currency" className="block text-[10px] font-medium text-muted">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={data?.currency_symbol}
            className="w-full bg-transparent p-0 pt-0.5 border-none text-foreground font-medium text-xs focus:ring-0 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="₦">₦123,456.78</option>
            <option value="₵">₵123,456.78</option>
            <option value="£">£123,456.78</option>
            <option value="$">$123,456.78</option>
          </select>
        </div>

        <div className="relative w-full bg-surface rounded-2xl border border-border px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-surface-hover transition duration-200 cursor-pointer">
          <label htmlFor="timezone" className="block text-[10px] font-medium text-muted">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={data?.iana_timezone}
            className="w-full bg-transparent p-0 pt-0.5 border-none text-foreground font-medium text-xs focus:ring-0 focus:outline-none appearance-none cursor-pointer"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-xs rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}