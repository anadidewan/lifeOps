"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Ensures the user has a Firebase session. (AuthContext demo session is not used for real sign-in.)
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, (user) => {
        const ok = !!user;
        setSignedIn(ok);
        setReady(true);
        if (!ok) {
          router.replace("/auth");
        }
      });
    } catch {
      queueMicrotask(() => {
        setReady(true);
        router.replace("/auth");
      });
    }

    return () => unsubscribe?.();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center px-4 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!signedIn) {
    return null;
  }

  return <>{children}</>;
}
