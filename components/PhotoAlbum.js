"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Observer } from "gsap/Observer";
import BackLink from "@/components/BackLink";
import PartyDecor from "@/components/PartyDecor";
import AlbumSpread from "@/components/AlbumSpreads";

gsap.registerPlugin(useGSAP, Observer);

const CLOSING_NOTE = "In a year I can only make this much memory😤😂";

function Chevron({ direction }) {
  const isPrev = direction === "prev";
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={isPrev ? "" : "rotate-180"}
    >
      <path
        d="M12.5 4.5L7 10l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyAlbum() {
  return (
    <main className="page-shell flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-8">
        <BackLink href="/" label="Back to gift" />
      </header>
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="max-w-md text-center font-display text-2xl leading-[1.3] text-paper">
          Add photos and a message.json file to each gallery page folder to open the album.
        </p>
      </div>
    </main>
  );
}

export default function PhotoAlbum({ pages }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const spreadsRef = useRef([]);
  const indexRef = useRef(0);
  const animatingRef = useRef(false);
  const goToRef = useRef(() => {});
  const lightboxOpenRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);

  const albumPages = useMemo(
    () => [
      ...pages,
      {
        id: "closing",
        kind: "closing",
        note: CLOSING_NOTE,
        images: [],
      },
    ],
    [pages]
  );
  const total = albumPages.length;

  useGSAP(
    (context, contextSafe) => {
      if (!total) return undefined;

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const reduce = Boolean(ctx.conditions.reduce);
          const spreads = spreadsRef.current.filter(Boolean);

          gsap.fromTo(
            ".album-chrome",
            { y: reduce ? 0 : 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: reduce ? 0.01 : 0.42,
              ease: "power2.out",
              stagger: reduce ? 0 : 0.05,
            }
          );

          const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

          gsap.set(spreads, { autoAlpha: 0, rotationY: 0, xPercent: 0 });
          if (spreads[0]) {
            gsap.set(spreads[0], { autoAlpha: 1 });
            if (!reduce) {
              const firstPhotos = spreads[0].querySelectorAll(
                isDesktop ? ".desktop-spread .polaroid-wrap" : ".mobile-spread .polaroid-wrap"
              );
              const firstNotes = spreads[0].querySelectorAll(
                isDesktop ? ".desktop-spread .album-note" : ".mobile-spread .album-note"
              );
              gsap.from(firstPhotos, {
                y: 28,
                opacity: 0,
                scale: 0.92,
                duration: 0.55,
                stagger: 0.08,
                ease: "back.out(1.5)",
                delay: 0.12,
              });
              gsap.from(firstNotes, {
                y: 18,
                opacity: 0,
                duration: 0.5,
                ease: "power2.out",
                delay: 0.28,
              });
            }
          }

          const goTo = contextSafe((next) => {
            if (animatingRef.current || lightboxOpenRef.current) return;
            const clamped = Math.max(0, Math.min(total - 1, next));
            if (clamped === indexRef.current) return;

            const outgoing = spreads[indexRef.current];
            const incoming = spreads[clamped];
            if (!outgoing || !incoming) return;

            animatingRef.current = true;
            const direction = clamped > indexRef.current ? 1 : -1;
            indexRef.current = clamped;
            setIndex(clamped);

            if (reduce) {
              gsap.set(outgoing, { autoAlpha: 0, rotationY: 0, xPercent: 0 });
              gsap.set(incoming, { autoAlpha: 1, rotationY: 0, xPercent: 0 });
              animatingRef.current = false;
              return;
            }

            const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
            const polaroids = incoming.querySelectorAll(
              isDesktop ? ".desktop-spread .polaroid-wrap" : ".mobile-spread .polaroid-wrap"
            );
            const note = incoming.querySelectorAll(
              isDesktop ? ".desktop-spread .album-note" : ".mobile-spread .album-note"
            );
            const mobile = !isDesktop;

            if (polaroids.length) gsap.set(polaroids, { opacity: 0, y: 20, scale: 0.96 });
            if (note.length) gsap.set(note, { opacity: 0, y: 12 });

            const duration = mobile ? 0.28 : 0.58;
            if (mobile) {
              gsap.set(incoming, {
                autoAlpha: 1,
                xPercent: 18 * direction,
                rotationY: 0,
              });
              const tl = gsap.timeline({
                onComplete: () => {
                  gsap.set(outgoing, { autoAlpha: 0, xPercent: 0, rotationY: 0 });
                  animatingRef.current = false;
                },
              });
              tl.to(outgoing, {
                xPercent: -16 * direction,
                autoAlpha: 0,
                duration,
                ease: "power2.inOut",
              }, 0);
              tl.to(incoming, {
                xPercent: 0,
                duration: 0.32,
                ease: "power2.out",
              }, 0.04);
              if (polaroids.length) {
                tl.to(polaroids, { opacity: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.05, ease: "power2.out" }, 0.08);
              }
              if (note.length) {
                tl.to(note, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.12);
              }
              return;
            }

            gsap.set(incoming, {
              autoAlpha: 1,
              rotationY: 68 * direction,
              xPercent: 10 * direction,
              transformOrigin: direction > 0 ? "left center" : "right center",
            });
            gsap.set(outgoing, {
              transformOrigin: direction > 0 ? "left center" : "right center",
            });

            const tl = gsap.timeline({
              onComplete: () => {
                gsap.set(outgoing, { autoAlpha: 0, rotationY: 0, xPercent: 0 });
                animatingRef.current = false;
              },
            });

            tl.to(
              outgoing,
              {
                rotationY: -58 * direction,
                xPercent: -12 * direction,
                autoAlpha: 0,
                duration,
                ease: "power2.inOut",
              },
              0
            );
            tl.to(
              incoming,
              {
                rotationY: 0,
                xPercent: 0,
                duration: 0.62,
                ease: "power3.out",
              },
              0.06
            );
            if (polaroids.length) {
              tl.to(
                polaroids,
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.5,
                  stagger: 0.08,
                  ease: "back.out(1.5)",
                },
                0.22
              );
            }
            if (note.length) {
              tl.to(
                note,
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.4,
                  ease: "power2.out",
                },
                polaroids.length ? 0.34 : 0.18
              );
            }
          });

          goToRef.current = goTo;

          const goNext = contextSafe(() => goTo(indexRef.current + 1));
          const goPrev = contextSafe(() => goTo(indexRef.current - 1));

          const observer = Observer.create({
            target: stageRef.current,
            type: "touch,pointer",
            tolerance: 64,
            dragMinimum: 48,
            preventDefault: false,
            ignore: "button, a, [role='tab'], [role='dialog'], .album-note, .album-nav-btn",
            onLeft: goNext,
            onRight: goPrev,
          });

          const onKey = contextSafe((event) => {
            if (lightboxOpenRef.current) {
              if (event.key === "Escape") {
                lightboxOpenRef.current = false;
                setLightbox(null);
              }
              return;
            }
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              event.preventDefault();
              goNext();
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              event.preventDefault();
              goPrev();
            }
          });

          window.addEventListener("keydown", onKey);

          return () => {
            observer.kill();
            window.removeEventListener("keydown", onKey);
          };
        }
      );

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [total] }
  );

  const openPhoto = (image) => {
    lightboxOpenRef.current = true;
    setLightbox(image);
  };

  const closePhoto = () => {
    lightboxOpenRef.current = false;
    setLightbox(null);
  };

  if (!pages.length) return <EmptyAlbum />;

  return (
    <main
      ref={rootRef}
      className="page-shell flex min-h-dvh flex-col overflow-hidden"
    >
      <div className="hidden lg:block">
        <PartyDecor variant="album" />
      </div>
      <header className="album-chrome relative z-20 flex items-center justify-between gap-4 px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-8">
        <BackLink href="/" label="Back to gift" />
        <p className="text-sm text-champagne" aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </header>

      <div
        ref={stageRef}
        className="album-stage relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden px-3 sm:px-6"
        role="region"
        aria-roledescription="carousel"
        aria-label="Photo album"
        tabIndex={0}
      >
        <div className="album-chrome px-2 pb-2 pt-1 sm:pb-4">
          <h1 className="font-display text-2xl leading-[1.1] text-paper sm:text-4xl">
            Memories
          </h1>
        </div>

        <div className="relative mx-auto min-h-0 w-full min-w-0 max-w-6xl flex-1">
          <div className="relative h-full min-h-[22rem] min-w-0 w-full sm:min-h-[28rem] lg:min-h-[40rem]">
            {albumPages.map((page, i) => (
              <div
                key={page.id}
                ref={(node) => {
                  spreadsRef.current[i] = node;
                }}
                className="album-spread-3d absolute inset-0"
                aria-hidden={i !== index}
              >
                <AlbumSpread
                  page={page}
                  isFirst={i === 0}
                  onOpenPhoto={openPhoto}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => goToRef.current(indexRef.current - 1)}
              disabled={index === 0}
              aria-label="Previous page"
              className="album-nav-btn album-chrome absolute left-2 top-1/2 z-30 hidden min-h-12 min-w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-paper/90 text-ink shadow-[0_8px_24px_rgba(8,12,20,0.2)] transition duration-200 hover:border-champagne hover:text-rose disabled:cursor-not-allowed disabled:opacity-25 sm:left-3 lg:inline-flex"
            >
              <Chevron direction="prev" />
            </button>

            <button
              type="button"
              onClick={() => goToRef.current(indexRef.current + 1)}
              disabled={index === total - 1}
              aria-label="Next page"
              className="album-nav-btn album-chrome absolute right-2 top-1/2 z-30 hidden min-h-12 min-w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-paper/90 text-ink shadow-[0_8px_24px_rgba(8,12,20,0.2)] transition duration-200 hover:border-champagne hover:text-rose disabled:cursor-not-allowed disabled:opacity-25 sm:right-3 lg:inline-flex"
            >
              <Chevron direction="next" />
            </button>
          </div>
        </div>
      </div>

      <nav
        className="album-chrome relative z-30 flex w-full min-w-0 shrink-0 items-center gap-2 overflow-x-hidden border-t border-paper/10 bg-ink/80 px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm sm:px-8 sm:pb-6 lg:justify-center"
        aria-label="Album pages"
      >
        <button
          type="button"
          onClick={() => goToRef.current(indexRef.current - 1)}
          disabled={index === 0}
          aria-label="Previous page"
          className="inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full border border-champagne/40 bg-champagne/15 px-3 text-sm font-medium text-champagne transition duration-200 [touch-action:manipulation] hover:bg-champagne/25 disabled:cursor-not-allowed disabled:opacity-30 lg:hidden"
        >
          <Chevron direction="prev" />
          Prev
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center overflow-x-auto" role="tablist" aria-label="Pages">
          {albumPages.map((page, i) => (
            <button
              key={page.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={page.kind === "closing" ? "Go to closing note" : `Go to page ${i + 1}`}
              onClick={() => goToRef.current(i)}
              className={`flex min-h-12 min-w-8 cursor-pointer items-center justify-center rounded-full transition duration-200 sm:min-w-12 ${
                i === index ? "text-champagne" : "text-paper/35 hover:text-paper/70"
              }`}
            >
              <span
                className={`block h-2.5 w-2.5 rounded-full transition duration-200 ${
                  i === index ? "scale-125 bg-champagne" : "bg-current"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => goToRef.current(indexRef.current + 1)}
          disabled={index === total - 1}
          aria-label="Next page"
          className="inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full border border-champagne/40 bg-champagne/15 px-3 text-sm font-medium text-champagne transition duration-200 [touch-action:manipulation] hover:bg-champagne/25 disabled:cursor-not-allowed disabled:opacity-30 lg:hidden"
        >
          Next
          <Chevron direction="next" />
        </button>
      </nav>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink/88 px-4 py-8"
          onClick={closePhoto}
        >
          <button
            type="button"
            onClick={closePhoto}
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex min-h-11 cursor-pointer items-center rounded-full border border-paper/25 px-4 text-sm text-paper transition duration-200 hover:border-champagne hover:text-champagne"
            aria-label="Close photo"
          >
            Close
          </button>
          <div
            className="relative h-[min(82dvh,46rem)] w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={lightbox.src}
              alt={lightbox.alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
