"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import BackLink from "@/components/BackLink";
import RequireUnlock from "@/components/RequireUnlock";
import PartyDecor from "@/components/PartyDecor";
import { content } from "@/lib/content";

gsap.registerPlugin(useGSAP);

function NoteInner() {
  const ref = useRef(null);
  const paragraphs = content.birthdayNote
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim());

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".note-meta",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
        );
        gsap.fromTo(
          ".note-line",
          { y: 28, opacity: 0, rotate: -0.6 },
          {
            y: 0,
            opacity: 1,
            rotate: 0,
            duration: 0.7,
            stagger: 0.14,
            ease: "power3.out",
            delay: 0.1,
          }
        );
        gsap.fromTo(
          ".note-card",
          { scale: 0.96, opacity: 0, rotate: -1.5 },
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 0.7,
            ease: "back.out(1.4)",
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <main
      ref={ref}
      className="page-shell relative flex min-h-dvh items-center justify-center px-6 py-16"
    >
      <PartyDecor variant="note" />
      <div className="absolute left-6 top-10 z-10 sm:left-10">
        <div className="note-meta">
          <BackLink href="/" label="Back to gift" />
        </div>
      </div>

      <article className="note-card relative z-10 w-full max-w-2xl border border-paper/10 bg-paper/[0.06] px-8 py-12 backdrop-blur-sm sm:px-14 sm:py-16">
        <p className="note-meta mb-8 text-xs uppercase tracking-[0.28em] text-champagne">
          Birthday note
        </p>
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 24)}
            className="note-line mb-6 font-display text-2xl leading-relaxed text-paper last:mb-0 sm:text-3xl sm:leading-snug"
            style={{ whiteSpace: "pre-line" }}
          >
            {paragraph}
          </p>
        ))}
      </article>
    </main>
  );
}

export default function NotePage() {
  return (
    <RequireUnlock>
      <NoteInner />
    </RequireUnlock>
  );
}
