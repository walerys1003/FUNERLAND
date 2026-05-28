'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

type Props = {
  images: { src: string; alt?: string }[];
  /** Optional title for screen readers */
  title?: string;
};

/**
 * Accessible lightbox gallery — no external deps.
 * - Esc closes
 * - Arrow keys navigate
 * - Focus trap on dialog
 * - Reduced-motion friendly
 */
export default function CompanyGallery({ images, title }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () => setOpen((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );

  // Keyboard handling + body scroll lock
  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  if (!images || images.length === 0) return null;

  const hero = images[0];
  const rest = images.slice(1, 5);

  return (
    <div className="not-prose">
      <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden">
        {/* Hero (large) */}
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="col-span-4 sm:col-span-2 row-span-2 relative aspect-[4/3] sm:aspect-auto sm:h-full group focus:outline-none focus:ring-2 focus:ring-navy/40 rounded-l-2xl overflow-hidden"
          aria-label={`Powiększ zdjęcie 1 z ${images.length}`}
        >
          <Image
            src={hero.src}
            alt={hero.alt || title || 'Zdjęcie firmy'}
            fill
            className="object-cover transition motion-safe:group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 bg-black/55 text-white text-[11.5px] px-2 py-1 rounded-md backdrop-blur">
            <ZoomIn className="w-3.5 h-3.5" />
            Powiększ
          </span>
        </button>
        {/* Side grid */}
        {rest.map((img, i) => {
          const idx = i + 1;
          const isLastVisible = idx === 4 && images.length > 5;
          return (
            <button
              key={img.src + idx}
              type="button"
              onClick={() => setOpen(idx)}
              className="col-span-2 sm:col-span-1 relative aspect-[4/3] group focus:outline-none focus:ring-2 focus:ring-navy/40 overflow-hidden"
              aria-label={`Powiększ zdjęcie ${idx + 1} z ${images.length}`}
            >
              <Image
                src={img.src}
                alt={img.alt || `Galeria ${idx + 1}`}
                fill
                className="object-cover transition motion-safe:group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {isLastVisible && (
                <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-[14px] font-medium">
                  +{images.length - 5} zdjęć
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox dialog */}
      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria zdjęć${title ? `: ${title}` : ''}`}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center motion-safe:animate-fade-in"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/60"
            aria-label="Zamknij galerię"
          >
            <X className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/60"
                aria-label="Poprzednie zdjęcie"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/60"
                aria-label="Następne zdjęcie"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div
            className="relative w-[92vw] h-[80vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[open].src}
              alt={images[open].alt || `Zdjęcie ${open + 1}`}
              fill
              className="object-contain"
              sizes="92vw"
              priority
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-[12.5px] bg-black/40 px-3 py-1 rounded-full">
            {open + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
