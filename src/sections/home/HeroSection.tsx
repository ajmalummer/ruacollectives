'use client';

import { useStore } from '@/context/StoreContext';
import { useRef, useState, useEffect, useCallback } from 'react';

export default function HeroSection() {
  const { heroImages } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const images = heroImages;

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      setCurrentIndex((index + images.length) % images.length);
    },
    [images.length]
  );

  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    }
  }, [images.length]);

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [resetAutoPlay]);

  return (
    <section className="w-full bg-white">
      {/* ── Text block ── */}
      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 pt-14 pb-12 text-center">
        <h1 className="font-playfair italic text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-snug">
          Aysha Ummer from Kannur, Kerala building{' '}
          <em className="font-playfair">RUA Collectives</em> with a vision to make
          luxury affordable for more people, more often.
        </h1>
      </div>

      {/* ── Carousel block ── */}
      <div className="flex justify-center pb-10">
        <div
          className="relative overflow-hidden w-[90%] sm:w-[80%]"
          style={{ borderRadius: '2.5rem' }}
        >
          {images.length > 0 ? (
            <>
              {/* Slides */}
              <div
                className="relative w-full"
                style={{ height: 'clamp(300px, 50vw, 620px)' }}
              >
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    className="absolute inset-0 w-full h-full transition-opacity duration-500"
                    style={{
                      opacity: i === currentIndex ? 1 : 0,
                      pointerEvents: i === currentIndex ? 'auto' : 'none',
                    }}
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text || `Hero image ${i + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                ))}

                {/* Dot indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { goTo(i); resetAutoPlay(); }}
                        aria-label={`Go to slide ${i + 1}`}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: i === currentIndex ? '24px' : '8px',
                          height: '8px',
                          background:
                            i === currentIndex
                              ? 'white'
                              : 'rgba(255,255,255,0.5)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Placeholder when no images uploaded yet */
            <div
              className="w-full flex items-center justify-center bg-gray-100 text-gray-400 font-inter text-sm"
              style={{ height: 'clamp(300px, 50vw, 620px)' }}
            >
              No hero images uploaded yet. Add some in Admin → Hero Images.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
