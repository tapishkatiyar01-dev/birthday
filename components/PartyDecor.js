"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const STICKERS = {
  balloon: "/stickers/sticker-balloon.png",
  cake: "/stickers/sticker-cake.png",
  gift: "/stickers/sticker-gift.png",
  hat: "/stickers/sticker-hat.png",
  star: "/stickers/sticker-star.png",
  heart: "/stickers/sticker-heart.png",
};

const LAYOUTS = {
  party: [
    { src: STICKERS.balloon, className: "left-[2%] top-[8%] w-[5.5rem] sm:w-28 -rotate-[18deg]" },
    { src: STICKERS.cake, className: "right-[2%] top-[12%] w-[5rem] sm:w-24 rotate-[14deg]" },
    { src: STICKERS.hat, className: "left-[4%] bottom-[10%] w-[4.75rem] sm:w-24 rotate-[8deg]" },
    { src: STICKERS.gift, className: "right-[3%] bottom-[8%] w-[5.25rem] sm:w-[6.5rem] -rotate-[10deg]" },
    { src: STICKERS.star, className: "left-[38%] top-[6%] w-14 sm:w-16 rotate-[20deg]" },
    { src: STICKERS.heart, className: "right-[36%] bottom-[7%] w-14 sm:w-16 -rotate-[16deg]" },
  ],
  hub: [
    { src: STICKERS.balloon, className: "left-[1%] top-[10%] w-20 sm:w-28 -rotate-[14deg]" },
    { src: STICKERS.cake, className: "right-[1%] top-[8%] w-[4.75rem] sm:w-24 rotate-[12deg]" },
    { src: STICKERS.gift, className: "right-[2%] bottom-[8%] w-20 sm:w-24 -rotate-[8deg]" },
    { src: STICKERS.hat, className: "left-[2%] bottom-[12%] w-[4.5rem] sm:w-20 rotate-[16deg]" },
    { src: STICKERS.heart, className: "right-[18%] top-[18%] hidden w-14 sm:block" },
    { src: STICKERS.star, className: "left-[16%] bottom-[20%] hidden w-14 sm:block rotate-[24deg]" },
  ],
  album: [
    { src: STICKERS.balloon, className: "left-1 top-[18%] w-14 sm:w-20 -rotate-[16deg]" },
    { src: STICKERS.heart, className: "right-1 top-[16%] w-12 sm:w-16 rotate-[18deg]" },
    { src: STICKERS.star, className: "left-2 bottom-[16%] w-12 sm:w-16 -rotate-[8deg]" },
    { src: STICKERS.gift, className: "right-2 bottom-[14%] w-14 sm:w-20 rotate-[10deg]" },
  ],
  note: [
    { src: STICKERS.cake, className: "left-[2%] top-[16%] w-[4.5rem] sm:w-24 -rotate-[12deg]" },
    { src: STICKERS.heart, className: "right-[3%] top-[14%] w-16 sm:w-20 rotate-[16deg]" },
    { src: STICKERS.star, className: "left-[6%] bottom-[12%] w-14 sm:w-16 rotate-[8deg]" },
    { src: STICKERS.balloon, className: "right-[4%] bottom-[10%] w-[4.75rem] sm:w-24 -rotate-[14deg]" },
  ],
  qr: [
    { src: STICKERS.gift, className: "left-[4%] top-[18%] w-[4.75rem] sm:w-24 -rotate-[18deg]" },
    { src: STICKERS.hat, className: "right-[4%] top-[16%] w-[4.5rem] sm:w-20 rotate-[14deg]" },
    { src: STICKERS.star, className: "left-[8%] bottom-[14%] w-14 sm:w-16 -rotate-[10deg]" },
    { src: STICKERS.balloon, className: "right-[6%] bottom-[12%] w-20 sm:w-24 rotate-[8deg]" },
    { src: STICKERS.heart, className: "left-[46%] top-[12%] w-12 sm:w-14" },
  ],
};

function SparkleGif({ className }) {
  return (
    <span className={`gif-sparkle ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function BalloonGif({ className }) {
  return (
    <span className={`gif-balloon ${className}`} aria-hidden="true">
      <span className="gif-balloon-body" />
      <span className="gif-balloon-string" />
    </span>
  );
}

function BurstGif({ className }) {
  return (
    <span className={`gif-burst ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export default function PartyDecor({ variant = "hub" }) {
  const ref = useRef(null);
  const stickers = LAYOUTS[variant] || LAYOUTS.hub;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          if (ctx.conditions.reduce) {
            gsap.set(".party-sticker", { opacity: 0.92, scale: 1 });
            return;
          }

          gsap.from(".party-sticker", {
            scale: 0.4,
            opacity: 0,
            rotate: -24,
            duration: 0.55,
            stagger: 0.07,
            ease: "back.out(1.7)",
          });

          gsap.to(".party-sticker", {
            y: "+=10",
            rotate: "+=5",
            duration: 2.2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            stagger: { each: 0.18, from: "random" },
            delay: 0.6,
          });
        }
      );
      return () => mm.revert();
    },
    { scope: ref, dependencies: [variant] }
  );

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden="true"
    >
      {stickers.map((sticker) => (
        <img
          key={sticker.src + sticker.className}
          src={sticker.src}
          alt=""
          className={`party-sticker absolute select-none ${sticker.className}`}
          draggable={false}
        />
      ))}

      <SparkleGif className="absolute left-[12%] top-[28%]" />
      <SparkleGif className="absolute right-[10%] top-[36%]" />
      <BalloonGif className="absolute bottom-[22%] left-[10%] hidden sm:block" />
      <BurstGif className="absolute right-[14%] bottom-[24%]" />
      {variant === "party" || variant === "hub" ? (
        <BurstGif className="absolute left-[48%] top-[8%]" />
      ) : null}
    </div>
  );
}
