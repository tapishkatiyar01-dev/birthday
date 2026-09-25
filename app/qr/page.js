"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import BackLink from "@/components/BackLink";
import RequireUnlock from "@/components/RequireUnlock";
import PartyDecor from "@/components/PartyDecor";
import { content } from "@/lib/content";

gsap.registerPlugin(useGSAP);

function QrInner() {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".qr-meta",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
        );
        gsap.fromTo(
          ".qr-frame",
          { scale: 0.88, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.75,
            ease: "back.out(1.4)",
            delay: 0.12,
          }
        );
        gsap.to(".qr-frame", {
          y: -6,
          duration: 1.6,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 0.9,
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <main
      ref={ref}
      className="page-shell relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16"
    >
      <PartyDecor variant="qr" />
      <div className="qr-meta absolute left-6 top-10 z-20 sm:left-10">
        <BackLink href="/" label="Back to gift" />
      </div>

      <p className="qr-meta relative z-10 mb-3 text-xs uppercase tracking-[0.28em] text-champagne">
        A little more
      </p>
      <h1 className="qr-meta relative z-10 font-display text-4xl text-paper sm:text-5xl">Surprise</h1>
      <p className="qr-meta relative z-10 mt-3 max-w-sm text-center text-sm text-paper/60">
        Tap the code to open the link, or scan it with your camera.
      </p>

      <a
        href={content.qrUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="qr-frame relative z-10 mt-10 block cursor-pointer rounded-sm bg-paper p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition duration-200 hover:scale-[1.03]"
        aria-label={`Open link: ${content.qrUrl}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.qrImage}
          alt={`QR code for ${content.qrUrl}`}
          width={280}
          height={280}
          className="h-[280px] w-[280px] object-contain"
        />
      </a>

      <p className="qr-meta mt-6 max-w-xs truncate text-center text-xs text-paper/40">
        {content.qrUrl}
      </p>
    </main>
  );
}

export default function QrPage() {
  return (
    <RequireUnlock>
      <QrInner />
    </RequireUnlock>
  );
}
