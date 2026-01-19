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
          {children}
        </div>
      </body>
    </html>
  );
}
