import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const agave = localFont({
  src: [
    { path: "../fonts/AgaveNerdFont-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/AgaveNerdFont-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-agave",
});

export const metadata: Metadata = {
  title: "Twoside",
  description: "Personal finance tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${agave.variable} dark antialiased`}>
      <body>{children}</body>
    </html>
  );
}