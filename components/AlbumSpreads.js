"use client";

function PhotoFrame({ image, variant = "polaroid", className = "", onOpen }) {
  return (
    <div className={`polaroid-wrap h-full w-full ${className}`}>
      <button
        type="button"
        onClick={() => onOpen(image)}
        className={`photo-frame frame-${variant} group h-full w-full cursor-pointer text-left`}
        aria-label={`Open ${image.alt}`}
      >
        <span className="photo-frame-inner relative flex h-full w-full items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            draggable={false}
            className="photo-frame-img"
          />
        </span>
      </button>
    </div>
  );
}

function NoteCard({ page, variant = "plain", className = "" }) {
  return (
    <aside className={`album-note ${className}`}>
      <div className={`note-card note-${variant}`}>
        <p className="font-display pb-1 text-[0.95rem] leading-[1.35] text-ink sm:text-[1.5rem] sm:leading-[1.4]">
          {page.note || "A quiet page, waiting for its note."}
        </p>
      </div>
    </aside>
  );
}

function Book({ children, mood = "paper", className = "" }) {
  return (
    <article
      className={`album-book album-mood-${mood} relative mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-[1.1rem] lg:rounded-[1.35rem] ${className}`}
    >
      {children}
    </article>
  );
}

const SPREADS = [
  { mood: "kraft", note: "sticky" },
  { mood: "cinema", note: "lined" },
  { mood: "torn", note: "ticket" },
  { mood: "post", note: "postcard" },
  { mood: "editorial", note: "quote" },
  { mood: "party", note: "ribbon" },
];

function photoGridClass(count) {
  if (count <= 1) return "grid-cols-1 grid-rows-1";
  if (count === 2) return "grid-cols-2 grid-rows-1";
  return "grid-cols-2 grid-rows-2 lg:grid-cols-3 lg:grid-rows-1";
}

function AlbumPage({ page, onOpen }) {
  const photos = page.images;
  const count = photos.length;
  const spread = SPREADS[(page.pageNumber - 1) % SPREADS.length];

  return (
    <Book mood={spread.mood}>
      <div className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 sm:p-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.8fr)] lg:gap-6 lg:p-7">
        <div className={`grid min-h-0 flex-1 gap-2 lg:h-full lg:gap-4 ${photoGridClass(count)}`}>
          {photos.map((image, i) => (
            <div
              key={image.src}
              className={`relative min-h-0 ${count >= 3 && i === 2 ? "col-span-2 lg:col-span-1" : ""}`}
            >
              <PhotoFrame image={image} variant="polaroid" onOpen={onOpen} />
            </div>
          ))}
        </div>
        <NoteCard
          page={page}
          variant={spread.note}
          className="mobile-album-note max-h-[26%] shrink-0 overflow-y-auto lg:flex lg:max-h-none lg:items-center lg:overflow-visible"
        />
      </div>
    </Book>
  );
}

function ClosingEnvelope({ note }) {
  return (
    <Book
      mood="envelope"
      className="items-center justify-center overflow-y-auto px-3 py-4 sm:px-12 sm:py-6"
    >
      <div className="album-note w-full max-w-xl">
        <div className="envelope-card">
          <span className="envelope-flap" aria-hidden="true" />
          <p className="font-display relative z-[1] px-5 py-8 text-center text-[1.45rem] leading-[1.3] text-ink sm:px-10 sm:py-12 sm:text-[2.2rem]">
            {note}
          </p>
        </div>
      </div>
    </Book>
  );
}

export default function AlbumSpread({ page, onOpenPhoto }) {
  if (page.kind === "closing") {
    return <ClosingEnvelope note={page.note} />;
  }

  return <AlbumPage page={page} onOpen={onOpenPhoto} />;
}
