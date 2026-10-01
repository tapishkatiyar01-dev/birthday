"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { content } from "@/lib/content";
import { isGiftUnlocked, unlockGiftSession, lockGiftSession } from "@/lib/session";
import { isViewExpired, remainingAccessMs } from "@/lib/view-access";
import PartyDecor from "@/components/PartyDecor";

gsap.registerPlugin(useGSAP);

const HUB_LINKS = [
  { href: "/gallery", label: "Gallery", hint: "Our memories" },
  { href: "/note", label: "Birthday note", hint: "A few words for you" },
  { href: "/video", label: "Video", hint: "Press play" },
  { href: "/qr", label: "Surprise QR", hint: "Scan or tap" },
];

function ConfettiLayer({ count = 36 }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const colors = ["#f7d6de", "#e8c47a", "#c45c7a", "#fff8f2"];
    return {
      id: i,
      left: `${(i * 17) % 100}%`,
      color: colors[i % colors.length],
      size: 6 + (i % 5) * 2,
      delay: (i % 10) * 0.08,
      rotate: (i * 47) % 360,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-[-10%] rounded-sm opacity-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            ["--delay"]: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function BirthdayExperience() {
  const rootRef = useRef(null);
  const lockTimerRef = useRef(null);
  const [phase, setPhase] = useState("loading"); // loading | locked | party | warning | hub
  const [showNext, setShowNext] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function armLock(viewedAt) {
    clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      lockGiftSession();
      setPhase("locked");
    }, remainingAccessMs(viewedAt));
  }

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const unlocked = isGiftUnlocked();
      if (unlocked) {
        setPhase("hub");
      }

      try {
        const res = await fetch("/api/view", {
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.viewed && isViewExpired(data.viewedAt)) {
          lockGiftSession();
          setPhase("locked");
          return;
        }

        if (data.viewed && !isGiftUnlocked()) {
          setPhase("locked");
          return;
        }
        if (isGiftUnlocked()) {
          setPhase("hub");
          armLock(data.viewedAt);
          return;
        }
        setPhase("party");
      } catch {
        if (!cancelled && !unlocked) {
          setPhase("party");
        }
      }
    }

    boot();
    return () => {
      cancelled = true;
      clearTimeout(lockTimerRef.current);
    };
  }, []);

  useGSAP(
    () => {
      if (phase !== "party") return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { reduce } = context.conditions;

          if (reduce) {
            gsap.set([".wish-line", ".wish-sub", ".confetti-piece", ".next-btn"], {
              opacity: 1,
              y: 0,
            });
            setShowNext(true);
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
          });

          gsap.to(".confetti-piece", {
            y: "110vh",
            rotation: "+=180",
            opacity: 1,
            duration: 2.8,
            stagger: { each: 0.05, from: "random" },
            ease: "power1.in",
            repeat: -1,
            repeatDelay: 0.4,
          });

          tl.fromTo(
            ".wish-line",
            { y: 48, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.18 }
          ).fromTo(
            ".wish-sub",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7 },
            "-=0.35"
          );

          gsap.delayedCall(0.85, () => {
            setShowNext(true);
            gsap.fromTo(
              ".next-btn",
              { y: 24, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
            );
          });
        }
      );

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [phase], revertOnUpdate: true }
  );

  useGSAP(
    () => {
      if (phase !== "warning") return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          if (context.conditions.reduce) {
            gsap.set(".warn-panel", { opacity: 1, scale: 1, y: 0 });
            return;
          }
          gsap.fromTo(
            ".warn-panel",
            { scale: 0.92, opacity: 0, y: 16 },
            { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
          );
        }
      );
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [phase], revertOnUpdate: true }
  );

  useGSAP(
    () => {
      if (phase !== "hub") return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          if (context.conditions.reduce) {
            gsap.set(".hub-item", { opacity: 1, y: 0, rotate: 0 });
            return;
          }
          gsap.fromTo(
            ".hub-item",
            { y: 36, opacity: 0, rotate: -2 },
            {
              y: 0,
              opacity: 1,
              rotate: 0,
              duration: 0.75,
              stagger: 0.11,
              ease: "back.out(1.5)",
            }
          );
        }
      );
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [phase], revertOnUpdate: true }
  );

  useGSAP(
    () => {
      if (phase !== "locked") return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          if (context.conditions.reduce) {
            gsap.set(".locked-panel", { opacity: 1, y: 0 });
            return;
          }
          gsap.fromTo(
            ".locked-panel",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
          );
        }
      );
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [phase], revertOnUpdate: true }
  );

  async function handleConfirmView() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/view", { method: "POST", cache: "no-store" });
      const data = await res.json();

      if (data.alreadyViewed) {
        lockGiftSession();
        setPhase("locked");
        return;
      }

      if (!res.ok || data.ok === false) {
        // Dev fallback when MongoDB is missing: still unlock the session
        if (res.status >= 500) {
          unlockGiftSession();
          setPhase("hub");
          armLock(new Date());
          return;
        }
        setError("Something went wrong. Please try again.");
        return;
      }

      unlockGiftSession();
      setPhase("hub");
      armLock(data.viewedAt ?? new Date());
    } catch {
      unlockGiftSession();
      setPhase("hub");
      armLock(new Date());
    } finally {
      setBusy(false);
    }
  }

  return (
    <main ref={rootRef} className="page-shell relative overflow-hidden">
      {phase === "loading" && (
        <div className="flex min-h-dvh items-center justify-center">
          <p className="font-display text-3xl text-blush/80">Just a moment…</p>
        </div>
      )}

      {phase === "locked" && (
        <div className="flex min-h-dvh items-center justify-center px-6">
          <div className="locked-panel max-w-md text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-champagne">
              Gift closed
            </p>
            <h1 className="font-display text-4xl font-medium text-paper sm:text-5xl">
              This gift was already opened
            </h1>
            <p className="mt-5 text-base leading-relaxed text-paper/65">
              It was meant to be seen once. The moment has passed — and that is
              part of what made it special.
            </p>
          </div>
        </div>
      )}

      {phase === "party" && (
        <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <PartyDecor variant="party" />
          <ConfettiLayer />
          <p className="wish-line relative z-10 mb-4 text-xs uppercase tracking-[0.35em] text-champagne opacity-0">
            A little celebration
          </p>
          <h1 className="font-display relative z-10 max-w-3xl text-5xl font-medium leading-[1.05] text-paper sm:text-7xl md:text-8xl">
            <span className="wish-line block opacity-0">Happy Birthday,</span>
            <span className="wish-line mt-2 block text-blush opacity-0">
              {content.recipientName}
            </span>
          </h1>
          <p className="wish-sub relative z-10 mt-6 max-w-md text-base text-paper/70 opacity-0 sm:text-lg">
            Something was made just for you. Take a breath, then open it.
          </p>

          <button
            type="button"
            className={`next-btn joy-btn relative z-10 mt-12 cursor-pointer rounded-full border border-champagne/40 bg-champagne/10 px-10 py-3 text-sm font-medium tracking-[0.2em] text-champagne uppercase hover:bg-champagne/20 ${
              showNext ? "" : "pointer-events-none opacity-0"
            }`}
            onClick={() => setPhase("warning")}
          >
            Next
          </button>
        </div>
      )}

      {phase === "warning" && (
        <div className="relative flex min-h-dvh items-center justify-center px-6">
          <PartyDecor variant="note" />
          <div className="warn-panel relative z-10 w-full max-w-lg border border-paper/10 bg-paper/[0.04] px-8 py-10 text-center backdrop-blur-sm sm:px-12">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-rose">
              Before you continue
            </p>
            <h2 className="font-display text-3xl text-paper sm:text-4xl">
              You can only view this site once
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/65 sm:text-base">
              After you press OK, this gift opens for this visit, and then it
              closes for good. Make sure you are ready.
            </p>
            {error ? (
              <p className="mt-4 text-sm text-rose" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={handleConfirmView}
              className="joy-btn mt-8 cursor-pointer rounded-full bg-blush px-10 py-3 text-sm font-medium tracking-[0.18em] text-ink uppercase hover:bg-paper disabled:opacity-60"
            >
              {busy ? "Opening…" : "OK"}
            </button>
          </div>
        </div>
      )}

      {phase === "hub" && (
        <div className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-6 py-16">
          <PartyDecor variant="hub" />
          <p className="hub-item relative z-10 mb-3 text-xs uppercase tracking-[0.28em] text-champagne opacity-0">
            For {content.recipientName}
          </p>
          <h2 className="hub-item relative z-10 font-display text-4xl text-paper opacity-0 sm:text-5xl">
            Where would you like to go?
          </h2>
          <nav className="relative z-10 mt-12 flex flex-col gap-2" aria-label="Gift sections">
            {HUB_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hub-item group flex min-h-14 cursor-pointer items-baseline justify-between border-b border-paper/15 py-5 opacity-0 transition-colors duration-200 hover:border-champagne/50"
              >
                <span className="font-display text-3xl text-paper transition duration-200 group-hover:-translate-y-0.5 group-hover:text-blush sm:text-4xl">
                  {item.label}
                </span>
                <span className="text-sm text-paper/45 transition duration-200 group-hover:text-champagne">
                  {item.hint}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </main>
  );
}
