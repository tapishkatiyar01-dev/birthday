"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isGiftUnlocked } from "@/lib/session";

/**
 * Ensures the visitor opened the gift in this browser session.
 * Redirects home when the session is not unlocked.
 */
export default function RequireUnlock({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isGiftUnlocked()) {
      router.replace("/");
      return;
    }
    setReady(true);
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
