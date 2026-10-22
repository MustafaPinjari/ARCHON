import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARCHON 2.0 — The Engineering Memory Engine",
  description: "Evidence-first engineering intelligence platform for hackFront India 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-[#090d16] text-slate-200 antialiased">{children}</body>
    </html>
  );
}
