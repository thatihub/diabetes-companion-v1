import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for a clean, modern look
import Link from "next/link";
import "./globals.css";
// Build Timestamp: 2026-02-11T11:29:00Z

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diabetes Companion V1",
  description: "Your daily AI-powered health companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-[#0f172a] text-[#f1f5f9]`}>
        <div className="min-h-screen">
          <div className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
              <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300 hover:text-white">
                GlycoFlow V2
              </Link>
              <Link href="/project-cabinet" className="app-btn">
                Cabinet
              </Link>
            </div>
          </div>
          <main className="pb-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
