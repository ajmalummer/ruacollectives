'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, Minus, Plus, Truck, HeadphonesIcon, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { products, isLoading } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const product = products.find((p) => p.id === productId || p.id.toString() === productId);

  // Build the full gallery: primary + additional_images
  const gallery: string[] = product
    ? [product.image_url, ...(product.additional_images ?? [])].filter(Boolean)
    : [];

  // Reset active image when product changes
  useEffect(() => {
    setActiveIndex(0);
    setImageLoaded(false);
  }, [productId]);

  const relatedProducts = products
    .filter((p) => p.id !== product?.id)
    .slice(0, 4);

  const handleDecrease = () => { if (quantity > 1) setQuantity(quantity - 1); };
  const handleIncrease = () => setQuantity(quantity + 1);

  const goToPrev = () => {
    setImageLoaded(false);
    setActiveIndex(i => (i - 1 + gallery.length) % gallery.length);
  };
  const goToNext = () => {
    setImageLoaded(false);
    setActiveIndex(i => (i + 1) % gallery.length);
  };
  const goTo = (index: number) => {
    if (index === activeIndex) return;
    setImageLoaded(false);
    setActiveIndex(index);
  };

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 px-4 flex items-center justify-center">
        <div className="animate-pulse flex flex-col md:flex-row gap-12 w-full max-w-6xl">
          <div className="w-full md:w-1/2 flex flex-col gap-3">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="flex gap-2">
              {[0,1,2,3].map(i => <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />)}
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-12 bg-gray-200 rounded w-full mt-6" />
            <div className="h-32 bg-gray-200 rounded w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 px-4 text-center">
        <h1 className="text-2xl font-playfair mb-4">Product not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* ── Product Details ── */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-24">

          {/* Left: Image Gallery */}
          <div className="w-full md:w-1/2 flex flex-col gap-3">

            {/* Main viewer */}
            <div className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-xl bg-[#f4f4f4] group">
              {/* Fade-in image */}
              <img
                key={activeIndex}
                src={gallery[activeIndex]}
                alt={product.title}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover object-center transition-opacity duration-400 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

              {/* Prev / Next arrows — only if multiple images */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dot indicators (mobile) */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden z-10">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Go to image ${i + 1}`}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                          i === activeIndex ? 'bg-foreground w-3' : 'bg-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip — only if multiple images, shown on md+ */}
            {gallery.length > 1 && (
              <div className="hidden md:flex gap-2">
                {gallery.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative flex-shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                      i === activeIndex
                        ? 'border-cherry shadow-sm'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={url} alt={`${product.title} image ${i + 1}`} className="w-full h-full object-cover" />
                    {/* Dimming overlay for non-active */}
                    {i !== activeIndex && (
                      <div className="absolute inset-0 bg-white/30" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-4">
              <h1 className="font-playfair text-3xl md:text-5xl text-foreground leading-tight inline-block mr-3">
                {product.title}
              </h1>
              {product.is_anti_tarnish && (
                <span className="inline-block align-middle text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded-sm border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1 mb-0.5" />
                  Anti-tarnish
                </span>
              )}
            </div>
            {/* Price */}
            {product.offer_enabled && product.offer_price != null && product.offer_price < product.price ? (
              <div className="flex flex-wrap items-baseline gap-3 mb-8">
                <p className="font-inter font-bold text-2xl" style={{ color: '#C0392B' }}>
                  Rs. {product.offer_price.toFixed(2)}
                </p>
                <p className="font-inter text-base text-gray-500 line-through">
                  Rs. {product.price.toFixed(2)}
                </p>
                <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded-full" style={{ backgroundColor: '#C0392B' }}>
                  {Math.round(((product.price - product.offer_price) / product.price) * 100)}% off
                </span>
              </div>
            ) : (
              <p className="font-inter font-semibold text-lg text-foreground mb-8">
                Rs. {product.price.toFixed(2)}
              </p>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-12 w-32">
                <button
                  onClick={handleDecrease}
                  className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-inter text-sm">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button className="flex-1 h-12 border border-foreground text-foreground font-inter text-sm font-medium rounded-lg hover:bg-foreground hover:text-white transition-colors flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Add to cart
              </button>
            </div>

            {/* Buy it now */}
            <button className="w-full h-12 bg-[#111827] text-white font-inter text-sm font-medium rounded-lg hover:opacity-90 transition-opacity mb-10">
              Buy it now
            </button>

            {/* Description — shown only if admin has enabled it */}
            {product.description_enabled && product.description && (() => {
              const lines = product.description
                .split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0);
              if (lines.length === 0) return null;
              return (
                <ul className="mt-2 mb-6 space-y-2">
                  {lines.map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-inter leading-relaxed">
                      <span className="mt-0.5 flex-shrink-0" style={{ color: '#b5a090', fontSize: '1rem' }}>✦</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        </div>

        {/* ── You may also like ── */}
        {relatedProducts.length > 0 && (
          <div className="mb-24 border-t border-gray-200 pt-16">
            <h2 className="font-inter text-xl text-foreground mb-8">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  price={p.price}
                  image={p.image_url}
                  stock={p.stock}
                  offerEnabled={p.offer_enabled}
                  offerPrice={p.offer_price}
                  isAntiTarnish={p.is_anti_tarnish}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Features ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-gray-200">
          <div className="flex items-start gap-4">
            <Truck className="w-6 h-6 text-foreground shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <h4 className="font-inter font-medium text-sm text-foreground mb-1">DTDC &amp; Indian Post</h4>
              <p className="font-inter text-xs text-gray-500">Shipping Worldwide &amp; Home Delivery all over India</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <HeadphonesIcon className="w-6 h-6 text-foreground shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <h4 className="font-inter font-medium text-sm text-foreground mb-1">Customer service</h4>
              <p className="font-inter text-xs text-gray-500 hover:text-foreground cursor-pointer transition-colors">
                WhatsApp Us +91 956 200 1937
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-foreground shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <h4 className="font-inter font-medium text-sm text-foreground mb-1">Secure payment</h4>
              <p className="font-inter text-xs text-gray-500">All payments are processed securely</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
