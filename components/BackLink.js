"use client";

import Link from "next/link";

export default function BackLink({ href = "/", label = "Back" }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm tracking-wide text-paper/70 transition-colors hover:text-champagne"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
