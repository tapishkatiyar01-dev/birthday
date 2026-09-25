"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import BackLink from "@/components/BackLink";

gsap.registerPlugin(useGSAP);

function isCoarseMobile() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 900px)").matches
  );
}

function isPortrait() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(orientation: portrait)").matches;
}

async function enterFullscreen(wrap, video) {
  try {
    if (video?.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
      return;
    }
  } catch {
    // Fall through to the Fullscreen API.
  }

  const node = wrap || video;
  if (!node) return;

  try {
    if (node.requestFullscreen) {
      await node.requestFullscreen();
    } else if (node.webkitRequestFullscreen) {
      node.webkitRequestFullscreen();
    }
  } catch {
    if (video?.webkitEnterFullscreen) {
      try {
        video.webkitEnterFullscreen();
      } catch {
        // Fullscreen is blocked until the next tap.
      }
    }
  }

  try {
    await screen.orientation?.lock?.("landscape");
  } catch {
    // Lock is only allowed in fullscreen on some browsers.
  }
}

function RotateHint() {
  return (
    <svg
      className="phone-tilt"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="22"
        y="10"
        width="28"
        height="52"
        rx="6"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <circle cx="36" cy="54" r="2.2" fill="currentColor" />
    </svg>
  );
}

export default function VideoPlayer({ src }) {
  const rootRef = useRef(null);
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [needsRotate, setNeedsRotate] = useState(false);
  const [playing, setPlaying] = useState(false);

  const syncOrientation = useCallback(() => {
    setNeedsRotate(isCoarseMobile() && isPortrait());
  }, []);

  useEffect(() => {
    syncOrientation();
    window.addEventListener("orientationchange", syncOrientation);
    window.addEventListener("resize", syncOrientation);
    return () => {
      window.removeEventListener("orientationchange", syncOrientation);
      window.removeEventListener("resize", syncOrientation);
    };
  }, [syncOrientation]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".video-chrome",
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
        gsap.fromTo(
          ".video-stage",
          { opacity: 0, scale: 1.02 },
          { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out", delay: 0.1 }
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  const startPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video || failed) return;

    if (isCoarseMobile() && isPortrait()) {
      setNeedsRotate(true);
      return;
    }

    try {
      await video.play();
      setPlaying(true);
      await enterFullscreen(wrapRef.current, video);
    } catch {
      setPlaying(false);
    }
  }, [failed]);

  useEffect(() => {
    if (needsRotate) {
      videoRef.current?.pause();
      setPlaying(false);
      return;
    }

    if (!isCoarseMobile()) {
      enterFullscreen(wrapRef.current, videoRef.current);
    }
  }, [needsRotate]);

  return (
    <main ref={rootRef} className="page-shell relative min-h-dvh bg-ink">
      <div className="video-chrome absolute left-6 top-8 z-30 sm:left-10">
        <BackLink href="/" label="Back to gift" />
      </div>

      <div
        ref={wrapRef}
        className="video-stage absolute inset-0 flex items-center justify-center bg-black"
      >
        {failed ? (
          <div className="max-w-md px-6 text-center">
            <p className="font-display text-3xl text-blush">Video missing</p>
            <p className="mt-4 text-sm leading-relaxed text-paper/60">
              Add your file under{" "}
              <code className="text-champagne">public/video</code>.
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              src={src}
              controls={playing}
              playsInline
              preload="auto"
              onError={() => setFailed(true)}
              onPlay={() => {
                if (isCoarseMobile() && isPortrait()) {
                  videoRef.current?.pause();
                  setNeedsRotate(true);
                  setPlaying(false);
                  return;
                }
                setPlaying(true);
                enterFullscreen(wrapRef.current, videoRef.current);
              }}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            >
              Your browser does not support the video tag.
            </video>

            {!playing && !needsRotate ? (
              <button
                type="button"
                onClick={startPlayback}
                className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-ink/35"
                aria-label="Play video fullscreen"
              >
                <span className="inline-flex min-h-16 min-w-16 items-center justify-center rounded-full border border-champagne/70 bg-ink/70 px-8 font-display text-2xl text-paper transition duration-200 hover:border-champagne hover:text-champagne">
                  Play
                </span>
              </button>
            ) : null}

            {needsRotate ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-ink px-8 text-center">
                <div className="text-champagne">
                  <RotateHint />
                </div>
                <p className="font-display max-w-sm text-3xl leading-[1.2] text-paper">
                  Turn your phone sideways
                </p>
                <p className="max-w-xs text-sm leading-relaxed text-paper/65">
                  This video is landscape. Rotate, then tap play for fullscreen.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
