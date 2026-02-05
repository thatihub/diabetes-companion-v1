import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for a clean, modern look
import "./globals.css";

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
      <body className={`${inter.variable} font-sans antialiased bg-[#09090b] text-[#fafafa]`}>
        <div className="mx-auto max-w-md min-h-screen bg-black shadow-2xl overflow-hidden border-x border-zinc-800">
          {/* Mobile-first container */}
          <div className="w-full bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 p-2 flex justify-between items-center px-4 sticky top-0 z-50">
            <span className="text-[10px] font-bold text-zinc-600">V1.2.0</span>
            <a href="/project-cabinet" className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
              📂 Project Cabinet
            </a>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
