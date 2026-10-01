"use client";

function PhotoFrame({
  image,
  variant = "polaroid",
  className = "",
  tilt = 0,
  onOpen,
}) {
  return (
    <div className={`polaroid-wrap h-full w-full ${className}`}>
      <div className="h-full w-full" style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}>
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
    </div>
  );
}

function Washi({ className = "" }) {
  return <span className={`washi-tape ${className}`} aria-hidden="true" />;
}

function NoteCard({ page, variant = "plain", className = "" }) {
  return (
    <aside className={`album-note ${className}`}>
      <div className={`note-card note-${variant}`}>
        <p className="font-display pb-1 text-[0.95rem] leading-[1.3] text-ink sm:text-[1.5rem] sm:leading-[1.4]">
          {page.note || "A quiet page, waiting for its note."}
        </p>
      </div>
    </aside>
  );
}

function Book({ children, mood = "paper", className = "" }) {
  return (
    <article
      className={`album-book album-mood-${mood} relative mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-[1.1rem] lg:overflow-visible lg:rounded-[1.35rem] ${className}`}
    >
      {children}
    </article>
  );
}

function MobileSheet({ page, isFirst, onOpen, noteVariant = "sticky" }) {
  const photos = page.images;
  const count = photos.length;
  const gridClass =
    count <= 1
      ? "grid-cols-1 grid-rows-1"
      : count === 2
        ? "grid-cols-2 grid-rows-1"
        : "grid-cols-2 grid-rows-2";

  return (
    <div className="mobile-spread flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2 py-2 lg:hidden">
      <div className={`grid min-h-0 flex-1 gap-2 ${gridClass}`}>
        {photos.map((image, i) => (
          <div
            key={image.src}
            className={`relative min-h-0 ${count >= 3 && i === 2 ? "col-span-2" : ""}`}
          >
            <PhotoFrame
              image={image}
              variant="polaroid"
              tilt={0}
              priority={isFirst && i === 0}
              onOpen={onOpen}
              sizes={count === 1 ? "100vw" : "50vw"}
            />
          </div>
        ))}
      </div>
      <NoteCard
        page={page}
        variant={noteVariant}
        className="mobile-album-note max-h-[26%] shrink-0 overflow-y-auto"
      />
    </div>
  );
}

function LayoutPile({ page, isFirst, onOpen }) {
  const [a, b] = page.images;
  return (
    <Book mood="kraft" className="lg:px-8 lg:py-8">
      <MobileSheet page={page} isFirst={isFirst} onOpen={onOpen} noteVariant="sticky" />
      <div className="desktop-spread relative hidden min-h-0 flex-1 grid-cols-[1.2fr_0.8fr] items-center gap-6 px-8 py-8 lg:grid">
        <div className="relative mx-auto h-[min(58dvh,34rem)] w-full max-w-lg">
          {a ? (
            <div className="absolute left-[6%] top-[4%] z-[1] h-[78%] w-[62%]">
              <PhotoFrame
                image={a}
                variant="polaroid"
                tilt={-8}
                priority={isFirst}
                onOpen={onOpen}
                sizes="32vw"
              />
              <Washi className="left-[28%] top-[-10px] w-24 -rotate-12" />
            </div>
          ) : null}
          {b ? (
            <div className="absolute bottom-[2%] right-[2%] z-[2] h-[70%] w-[58%]">
              <PhotoFrame
                image={b}
                variant="polaroid"
                tilt={7}
                onOpen={onOpen}
                sizes="28vw"
              />
              <Washi className="right-[18%] top-[-8px] w-20 rotate-[16deg]" />
            </div>
          ) : null}
        </div>
        <NoteCard page={page} variant="sticky" className="flex items-center justify-center" />
      </div>
    </Book>
  );
}

function LayoutFilm({ page, isFirst, onOpen }) {
  return (
    <Book mood="cinema" className="lg:px-8 lg:py-7">
      <MobileSheet page={page} isFirst={isFirst} onOpen={onOpen} noteVariant="lined" />
      <div className="desktop-spread hidden min-h-0 flex-1 grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] items-center gap-5 px-8 py-7 lg:grid">
        <div className="film-strip mx-auto flex h-[min(56dvh,32rem)] w-full max-w-[13.5rem] flex-col gap-2 p-2">
          {page.images.map((image, i) => (
            <div key={image.src} className="relative min-h-0 flex-1">
              <PhotoFrame
                image={image}
                variant="film"
                tilt={0}
                priority={isFirst && i === 0}
                onOpen={onOpen}
                sizes="18vw"
              />
            </div>
          ))}
        </div>
        <NoteCard page={page} variant="lined" className="flex items-center justify-center px-1" />
      </div>
    </Book>
  );
}

function LayoutTorn({ page, isFirst, onOpen }) {
  const [a, b] = page.images;
  return (
    <Book mood="torn" className="lg:px-6 lg:py-6">
      <MobileSheet page={page} isFirst={isFirst} onOpen={onOpen} noteVariant="ticket" />
      <div className="desktop-spread relative hidden min-h-0 flex-1 flex-col lg:flex">
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-6 px-8 pt-8">
          {a ? (
            <div className="relative min-h-0">
              <PhotoFrame
                image={a}
                variant="polaroid"
                tilt={-3}
                priority={isFirst}
                onOpen={onOpen}
                sizes="40vw"
              />
            </div>
          ) : null}
          {b ? (
            <div className="relative min-h-0">
              <PhotoFrame
                image={b}
                variant="polaroid"
                tilt={3}
                onOpen={onOpen}
                sizes="40vw"
              />
            </div>
          ) : null}
        </div>
        <NoteCard
          page={page}
          variant="ticket"
          className="flex w-full justify-center px-8 pb-8 pt-4"
        />
      </div>
    </Book>
  );
}

function LayoutStamp({ page, isFirst, onOpen }) {
  const [a, b] = page.images;
  return (
    <Book mood="post" className="lg:px-8 lg:py-8">
      <MobileSheet page={page} isFirst={isFirst} onOpen={onOpen} noteVariant="postcard" />
      <div className="desktop-spread hidden min-h-0 flex-1 grid-cols-[0.9fr_1.1fr] items-center gap-6 px-8 py-8 lg:grid">
        <NoteCard page={page} variant="postcard" className="flex items-center" />
        <div className="relative mx-auto h-[min(56dvh,32rem)] w-full max-w-xl">
          {a ? (
            <div className="absolute left-[8%] top-[6%] z-[1] h-[72%] w-[58%]">
              <PhotoFrame
                image={a}
                variant="polaroid"
                tilt={-4}
                priority={isFirst}
                onOpen={onOpen}
                sizes="26vw"
              />
            </div>
          ) : null}
          {b ? (
            <div className="absolute bottom-[2%] right-[4%] z-[2] h-[64%] w-[52%]">
              <PhotoFrame
                image={b}
                variant="stamp"
                tilt={6}
                onOpen={onOpen}
                sizes="24vw"
              />
              <Washi className="left-[30%] top-[-8px] w-16 rotate-[8deg]" />
            </div>
          ) : null}
        </div>
      </div>
    </Book>
  );
}

function LayoutMagazine({ page, isFirst, onOpen }) {
  const [a, b] = page.images;
  return (
    <Book mood="editorial" className="lg:overflow-hidden lg:p-0">
      <MobileSheet page={page} isFirst={isFirst} onOpen={onOpen} noteVariant="quote" />
      <div className="desktop-spread relative hidden min-h-0 flex-1 lg:block">
        {a ? (
          <div className="absolute inset-6">
            <PhotoFrame
              image={a}
              variant="polaroid"
              priority={isFirst}
              onOpen={onOpen}
              sizes="70vw"
            />
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        {b ? (
          <div className="absolute right-8 top-8 z-[2] h-[38%] w-[34%] max-w-[13rem]">
            <PhotoFrame
              image={b}
              variant="polaroid"
              tilt={8}
              onOpen={onOpen}
              sizes="18vw"
            />
          </div>
        ) : null}
        <NoteCard
          page={page}
          variant="quote"
          className="absolute inset-x-8 bottom-8 z-[3]"
        />
      </div>
    </Book>
  );
}

function LayoutFan({ page, isFirst, onOpen }) {
  const photos = page.images.slice(0, 3);
  const tilts = [-14, 2, 12];
  const spots = [
    "left-[4%] top-[10%] h-[58%] w-[46%] z-[1]",
    "left-[28%] top-[18%] h-[62%] w-[48%] z-[2]",
    "right-[4%] top-[8%] h-[56%] w-[44%] z-[3]",
  ];

  return (
    <Book mood="party" className="lg:px-7 lg:py-7">
      <MobileSheet page={page} isFirst={isFirst} onOpen={onOpen} noteVariant="ribbon" />
      <div className="desktop-spread hidden min-h-0 flex-1 flex-col px-7 py-7 lg:flex">
        <div className="relative mx-auto h-[min(50dvh,30rem)] w-full max-w-3xl">
          {photos.map((image, i) => (
            <div key={image.src} className={`absolute ${spots[i] || spots[0]}`}>
              <PhotoFrame
                image={image}
                variant="polaroid"
                tilt={tilts[i]}
                priority={isFirst && i === 0}
                onOpen={onOpen}
                sizes="24vw"
              />
            </div>
          ))}
        </div>
        <NoteCard page={page} variant="ribbon" className="mt-4 flex justify-center" />
      </div>
    </Book>
  );
}

function ClosingEnvelope({ note }) {
  return (
    <Book mood="envelope" className="desktop-spread mobile-spread items-center justify-center overflow-y-auto px-3 py-4 sm:px-12 sm:py-6">
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

const LAYOUTS = [
  LayoutPile,
  LayoutFilm,
  LayoutTorn,
  LayoutStamp,
  LayoutMagazine,
  LayoutFan,
];

export default function AlbumSpread({ page, isFirst, onOpenPhoto }) {
  if (page.kind === "closing") {
    return <ClosingEnvelope note={page.note} />;
  }

  const Layout = LAYOUTS[(page.pageNumber - 1) % LAYOUTS.length];
  return <Layout page={page} isFirst={isFirst} onOpen={onOpenPhoto} />;
}
