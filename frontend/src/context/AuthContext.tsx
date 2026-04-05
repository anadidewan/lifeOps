"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const SESSION_KEY = "lifeos_demo_session";

export type DemoUser = {
  email: string;
  displayName: string;
};

const sessionListeners = new Set<() => void>();

function emitSession() {
  sessionListeners.forEach((l) => l());
}

function subscribeSession(onChange: () => void) {
  sessionListeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_KEY || e.key === null) onChange();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    sessionListeners.delete(onChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function readSession(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "email" in parsed &&
      "displayName" in parsed &&
      typeof (parsed as DemoUser).email === "string" &&
      typeof (parsed as DemoUser).displayName === "string"
    ) {
      return parsed as DemoUser;
    }
    return null;
  } catch {
    return null;
  }
}

function writeSession(user: DemoUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
  emitSession();
}

function getSessionSnapshot(): DemoUser | null {
  return readSession();
}

function getServerSessionSnapshot(): DemoUser | null {
  return null;
}

export type AuthState = {
  user: DemoUser | null;
  loading: boolean;
  signOut: () => void;
  signInWithEmailPassword: (
    email: string,
    password: string,
    mode: "signin" | "signup"
  ) => void;
  signInWithGoogleDemo: () => void;
  signInWithAppleDemo: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot
  );

  const signOut = useCallback(() => {
    writeSession(null);
  }, []);

  const signInWithEmailPassword = useCallback(
    (email: string, password: string, mode: "signin" | "signup") => {
      const e = email.trim();
      if (!e || !password) {
        throw new Error("Enter your email and password.");
      }
      if (mode === "signup" && password.length < 6) {
        throw new Error("Password should be at least 6 characters.");
      }
      const localPart = e.includes("@") ? e.split("@")[0] ?? e : e;
      const displayName =
        localPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
        "User";
      writeSession({ email: e, displayName });
    },
    []
  );

  const signInWithGoogleDemo = useCallback(() => {
    writeSession({
      email: "demo.google@lifeos.local",
      displayName: "Google demo",
    });
  }, []);

  const signInWithAppleDemo = useCallback(() => {
    writeSession({
      email: "demo.apple@lifeos.local",
      displayName: "Apple demo",
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading: false,
      signOut,
      signInWithEmailPassword,
      signInWithGoogleDemo,
      signInWithAppleDemo,
    }),
    [user, signOut, signInWithEmailPassword, signInWithGoogleDemo, signInWithAppleDemo]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
