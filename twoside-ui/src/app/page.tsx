import { AccountCarousel } from "@/components/home/AccountCarousel";
import { QuickLogWidget } from "@/components/home/QuickLogWidget";

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <section>
        <AccountCarousel />
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
          Log a Transaction
        </h2>
        <QuickLogWidget />
      </section>
    </main>
  );
}