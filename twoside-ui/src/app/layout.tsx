import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "Twoside",
  description: "Financial tracking made simple.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-zinc-100 flex justify-center min-h-screen">
        {/* Mobile App Frame */}
        <div className="w-full max-w-md bg-background min-h-screen flex flex-col relative border-x border-border shadow-2xl pb-20">
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          <BottomNav />
        </div>
      </body>
    </html>
  );
}