import { BarChart3, PieChart, TrendingUp, type LucideIcon } from "lucide-react";

// Placeholder copy, swap in your own.
const POINTS: { icon: LucideIcon; text: string }[] = [
  { icon: PieChart, text: "See where your money actually goes" },
  { icon: TrendingUp, text: "Spot habits and trends over time" },
  { icon: BarChart3, text: "Compare tags, days and months" },
];

function Tile({ icon: Icon, className = "" }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-2xl border border-primary/20 bg-surface text-primary shadow-lg shadow-primary/10 ${className}`}
    >
      <Icon className="h-1/2 w-1/2" />
    </span>
  );
}

export default function InsightsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 pb-28">
      <div className="flex w-full max-w-xs flex-col items-center gap-6 text-center">
        {/* illustration */}
        <div className="relative flex h-28 w-48 items-center justify-center">
          <span className="absolute inset-x-4 inset-y-2 rounded-full bg-primary/10 blur-2xl" />
          <Tile icon={PieChart} className="absolute left-2 top-6 h-14 w-14 -rotate-12 opacity-80" />
          <Tile icon={TrendingUp} className="absolute right-2 top-6 h-14 w-14 rotate-12 opacity-80" />
          <Tile icon={BarChart3} className="relative h-20 w-20" />
        </div>

        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-2xs font-semibold uppercase tracking-wider text-primary">
          Coming soon
        </span>

        <div className="space-y-1.5">
          <h1 className="text-md font-semibold tracking-tight text-foreground">
            Insights will help you…
          </h1>
          <p className="text-xs leading-relaxed text-muted">
            Your spending, turned into something you can actually read.
          </p>
        </div>

        <ul className="w-full space-y-2">
          {POINTS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-2xl border border-picker-border bg-picker-background px-3 py-2.5 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-foreground">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}