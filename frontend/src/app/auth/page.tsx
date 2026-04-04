import type { Metadata } from "next";
import { AuthClient } from "@/components/auth/AuthClient";
import { GlowBackdrop } from "@/components/landing/GlowBackdrop";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "Sign in | LifeOS",
  description: "Sign in or create your LifeOS account. Plan smarter with your autonomous academic agent.",
};

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <GlowBackdrop />
      <Navbar />
      <AuthClient />
    </div>
  );
}
