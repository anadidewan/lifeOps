"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlassCard } from "@/components/landing/GlassCard";
import {
  formatAuthError,
  sendPasswordReset,
  signInWithEmail,
  signUpWithEmail,
  verifyTokenWithBackend,
} from "@/lib/firebase/auth-flow";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup";

const fieldClass = cn(
  "w-full rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  "placeholder:text-slate-500",
  "outline-none transition-[border-color,box-shadow] duration-200",
  "focus:border-violet-500/45 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]",
);

const primaryBtnClass = cn(
  "relative w-full overflow-hidden rounded-full py-3 text-sm font-semibold text-white",
  "bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600",
  "shadow-[0_0_28px_-4px_rgba(139,92,246,0.65),0_8px_24px_-12px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.14)]",
  "ring-1 ring-white/15 transition-[filter,box-shadow,transform] duration-200",
  "hover:brightness-[1.06] hover:shadow-[0_0_36px_-4px_rgba(139,92,246,0.8)] active:scale-[0.99]",
);

export function AuthClient() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function completeSignIn(credential: { user: { getIdToken: () => Promise<string> } }) {
    const idToken = await credential.user.getIdToken();
    await verifyTokenWithBackend(idToken);
    router.push("/dashboard");
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-full flex-1 flex-col pt-16"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <motion.div
          className="absolute left-[12%] top-[28%] h-40 w-40 rounded-full bg-violet-500/10 blur-3xl"
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[10%] top-[42%] h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1.05, 1, 1.05] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[18%] left-[40%] h-32 w-64 rounded-full bg-blue-500/8 blur-3xl"
          animate={{ opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-[1] mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-sm text-center text-sm leading-relaxed text-slate-500 lg:max-w-xs lg:text-left lg:text-[0.9375rem]"
        >
          Plan smarter. Recover faster. Stay ahead.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[420px] lg:mx-0 lg:shrink-0"
        >
          <GlassCard
            glow="violet"
            className="relative overflow-hidden p-6 shadow-[0_32px_80px_-32px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.12),transparent_55%)]"
              aria-hidden
            />
            <div className="relative">
              {!isFirebaseConfigured() && (
                <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-100/90">
                  Add your Firebase Web app keys:{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5 text-[10px]">NEXT_PUBLIC_FIREBASE_API_KEY</code>{" "}
                  (and project id) in{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5 text-[10px]">.env</code> or{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5 text-[10px]">.env.local</code>. Service
                  account keys are for the server only.
                </p>
              )}
              {error && (
                <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200/90">
                  {error}
                </p>
              )}
              {resetMessage && (
                <p className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-100/90">
                  {resetMessage}
                </p>
              )}
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/35 to-indigo-600/28 ring-1 ring-white/12 shadow-[0_0_28px_-6px_rgba(139,92,246,0.55)]">
                  <Sparkles
                    className="h-5 w-5 text-violet-200"
                    strokeWidth={1.75}
                  />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  LifeOS
                </span>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
                  Welcome to LifeOS
                </h1>
                <p className="mt-2 max-w-[280px] text-sm text-slate-400">
                  Sign in to continue or create your account
                </p>
              </div>

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  setResetMessage(null);
                  if (!isFirebaseConfigured()) {
                    setError("Firebase Web app is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY in .env or .env.local.");
                    return;
                  }
                  if (!email.trim() || !password) {
                    setError("Enter your email and password.");
                    return;
                  }
                  setLoading(true);
                  try {
                    const cred =
                      mode === "signin"
                        ? await signInWithEmail(email, password)
                        : await signUpWithEmail(email, password);
                    await completeSignIn(cred);
                  } catch (err) {
                    console.error("err", err);
                    setError(formatAuthError(err));
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div>
                  <label
                    htmlFor="auth-email"
                    className="mb-1.5 block text-xs font-medium text-slate-400"
                  >
                    Email
                  </label>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@university.edu"
                    className={fieldClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="auth-password"
                    className="mb-1.5 block text-xs font-medium text-slate-400"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      placeholder="••••••••"
                      className={cn(fieldClass, "pr-12")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {mode === "signin" && (
                    <motion.div
                      key="signin-extra"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
                          <input
                            type="checkbox"
                            name="remember"
                            className="h-3.5 w-3.5 rounded border border-white/20 bg-white/[0.05] text-violet-500 focus:ring-violet-500/40"
                          />
                          Remember me
                        </label>
                        <button
                          type="button"
                          className="text-xs font-medium text-violet-300/95 transition-colors hover:text-violet-200"
                          disabled={loading}
                          onClick={async () => {
                            setError(null);
                            setResetMessage(null);
                            if (!isFirebaseConfigured()) {
                              setError("Firebase Web app is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY in .env or .env.local.");
                              return;
                            }
                            if (!email.trim()) {
                              setError("Enter your email address first.");
                              return;
                            }
                            setLoading(true);
                            try {
                              await sendPasswordReset(email);
                              setResetMessage("Check your inbox for a reset link.");
                            } catch (err) {
                              setError(formatAuthError(err));
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Forgot password?
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                >
                  <button type="submit" className={primaryBtnClass} disabled={loading}>
                    <span className="relative z-10">
                      {loading
                        ? mode === "signin"
                          ? "Signing in…"
                          : "Creating account…"
                        : "Continue"}
                    </span>
                    <span
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.05] to-white/[0.1]"
                      aria-hidden
                    />
                  </button>
                </motion.div>
              </form>

              <div className="mt-8 text-center">
                <AnimatePresence mode="wait" initial={false}>
                  {mode === "signin" ? (
                    <motion.p
                      key="to-signup"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="text-sm text-slate-500"
                    >
                      New to LifeOS?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup");
                          setError(null);
                          setResetMessage(null);
                        }}
                        className="font-semibold text-violet-300 transition-colors hover:text-violet-200"
                      >
                        Create account
                      </button>
                    </motion.p>
                  ) : (
                    <motion.p
                      key="to-signin"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="text-sm text-slate-500"
                    >
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signin");
                          setError(null);
                          setResetMessage(null);
                        }}
                        className="font-semibold text-violet-300 transition-colors hover:text-violet-200"
                      >
                        Sign in
                      </button>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.main>
  );
}
