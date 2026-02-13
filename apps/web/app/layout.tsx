import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for a clean, modern look
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
        <div className="mx-auto max-w-md min-h-screen bg-slate-900/50 shadow-2xl overflow-hidden border-x border-slate-800/50 backdrop-blur-3xl">
          {/* Elegant top bar */}
          <div className="w-full bg-slate-900/40 backdrop-blur-md border-b border-slate-800/50 p-3 flex justify-between items-center px-6 sticky top-0 z-50">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">GlycoFlow V2</span>
            <div className="flex items-center gap-4">
              <a href="/project-cabinet" className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50"></span>
                Cabinet
              </a>
            </div>
          </div>
          <main className="pb-24">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
