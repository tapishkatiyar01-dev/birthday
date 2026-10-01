"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isGiftUnlocked, lockGiftSession } from "@/lib/session";
import { isViewExpired, remainingAccessMs } from "@/lib/view-access";

/**
 * Ensures the visitor opened the gift in this browser session.
 * Redirects home when the session is not unlocked.
 */
export default function RequireUnlock({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(() =>
    typeof window !== "undefined" ? isGiftUnlocked() : false
  );

  useEffect(() => {
    let cancelled = false;
    let timer;

    async function gate() {
      if (!isGiftUnlocked()) {
        router.replace("/");
        return;
      }

      setReady(true);

      try {
        const res = await fetch("/api/view", {
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.viewed && isViewExpired(data.viewedAt)) {
          lockGiftSession();
          router.replace("/");
          return;
        }

        timer = setTimeout(() => {
          lockGiftSession();
          router.replace("/");
        }, remainingAccessMs(data.viewedAt));
      } catch {
        // Stay in the gift if the check is slow or unavailable.
      }
    }

    gate();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="page-shell flex min-h-dvh items-center justify-center">
        <p className="font-display text-2xl text-paper/70" aria-busy="true">
          Opening…
        </p>
      </div>
    );
  }

  return children;
}
