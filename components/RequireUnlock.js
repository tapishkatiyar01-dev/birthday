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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;

    async function gate() {
      if (!isGiftUnlocked()) {
        router.replace("/");
        return;
      }

      try {
        const res = await fetch("/api/view");
        const data = await res.json();
        if (cancelled) return;

        if (data.viewed && isViewExpired(data.viewedAt)) {
          lockGiftSession();
          router.replace("/");
          return;
        }

        setReady(true);
        timer = setTimeout(() => {
          lockGiftSession();
          router.replace("/");
        }, remainingAccessMs(data.viewedAt));
      } catch {
        if (!cancelled) setReady(true);
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
        <p className="font-display text-2xl text-paper/70">Opening…</p>
      </div>
    );
  }

  return children;
}
