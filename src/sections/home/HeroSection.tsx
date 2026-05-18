'use client';

import { useStore } from '@/context/StoreContext';
import { useRef, useState, useEffect, useCallback } from 'react';

export default function HeroSection() {
  const { heroImages } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const images = heroImages.length > 0 ? heroImages : [];

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || images.length === 0) return;
      setIsTransitioning(true);
      setCurrentIndex((index + images.length) % images.length);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning, images.length]
  );

  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  useEffect(() => {
    if (images.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [images.length]);

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    }
  };

  const handlePrev = () => { prev(); resetAutoPlay(); };
  const handleNext = () => { next(); resetAutoPlay(); };

  return (
    <section className="w-full bg-white">
      {/* ── Text block ── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12 pb-10 text-center">
        <h1 className="font-playfair italic text-3xl sm:text-4xl lg:text-5xl text-foreground leading-snug mb-4">
          Two young entrepreneurs from Kannur, Kerala building{' '}
          <em className="font-playfair">RUA</em> with a vision to make
          luxury affordable for more people, more often.
        </h1>
      </div>

      {/* ── Carousel block ── */}
      <div className="relative w-full overflow-hidden" style={{ borderRadius: '2rem 2rem 0 0' }}>
        {images.length > 0 ? (
          <>
            {/* Slides */}
            <div className="relative w-full" style={{ height: 'clamp(340px, 55vw, 640px)' }}>
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="absolute inset-0 w-full h-full transition-opacity duration-500"
                  style={{ opacity: i === currentIndex ? 1 : 0, pointerEvents: i === currentIndex ? 'auto' : 'none' }}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || `Hero image ${i + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}

              {/* Gradient overlay at top for the curved illusion */}
              <div
                className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{
                  height: '80px',
                  background: 'linear-gradient(to bottom, white 0%, transparent 100%)',
                  borderRadius: '2rem 2rem 0 0',
                }}
              />

              {/* Prev / Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors z-10"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors z-10"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </>
              )}

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
                        background: i === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
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
            style={{ height: 'clamp(340px, 55vw, 640px)', borderRadius: '2rem 2rem 0 0' }}
          >
            No hero images uploaded yet. Add some in the Admin → Hero Images section.
          </div>
        )}
      </div>
    </section>
  );
}
