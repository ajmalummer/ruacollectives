export default function HeroSection() {
  return (
    <section className="min-h-[85vh] pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              <img
                src="/images/hero-founders.jpg"
                alt="RUA Founders - Shamraaz Ahemed and Aysha Ummer"
                className="w-full h-auto object-contain"
              />
              {/* Founder Labels */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded px-3 py-2 shadow-sm">
                <p className="font-inter font-medium text-sm text-gray-900">Shamraaz Ahemed</p>
                <p className="font-inter text-xs text-gray-500">Co-Founder, RUA</p>
              </div>
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded px-3 py-2 shadow-sm">
                <p className="font-inter font-medium text-sm text-gray-900">Aysha Ummer</p>
                <p className="font-inter text-xs text-gray-500">Founder, RUA</p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 flex items-center">
            <h1 className="font-playfair italic text-3xl sm:text-4xl lg:text-5xl text-foreground leading-snug">
              Two young entrepreneurs from Kannur, Kerala building{' '}
              <em className="font-playfair">RUA</em> with a vision to make
              luxury affordable for more people, more often.
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
