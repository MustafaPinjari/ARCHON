import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARCHON 2.0 — Understand Code. See Impact. Build Safer.",
  description:
    "Evidence-first engineering memory engine powered by AST extraction, Git commit archaeology, and idempotent Neo4j GraphRAG.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
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
