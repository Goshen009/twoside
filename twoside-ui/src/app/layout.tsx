import type { Metadata } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Track expenses, income, and loans seamlessly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-zinc-100 antialiased max-w-md mx-auto relative min-h-screen">
        {children}
      </body>
    </html>
  );
}