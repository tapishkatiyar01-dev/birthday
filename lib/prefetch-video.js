"use client";

const PREFETCH_FLAG = "__giftVideoPrefetch";

export function prefetchGiftVideo(src) {
  if (typeof window === "undefined" || !src) return;
  if (window[PREFETCH_FLAG]) return;
  window[PREFETCH_FLAG] = true;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = src;
  document.head.appendChild(link);

  fetch(src, { cache: "force-cache", credentials: "same-origin" }).catch(() => {});
}
