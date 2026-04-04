import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeOS, Autonomous AI Student Agent",
  description:
    "An intelligent AI operating system for students. Observe, reason, act, and learn. Deadlines, schedules, and academic survival on autopilot.",
  keywords: [
    "AI",
    "student",
    "productivity",
    "LifeOS",
    "academic planner",
    "Gemini",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#030512] text-slate-100">
        {children}
      </body>
    </html>
  );
}
