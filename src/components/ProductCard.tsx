'use client';

import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface ProductCardProps {
  id: string | number;
  title: string;
  price: number;
  image: string;
  stock?: number | null;
}

export default function ProductCard({ id, title, price, image, stock }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const isOutOfStock = stock === 0;
  const isLowStock = stock === 1;

  return (
    <Link href={`/product/${id}`} className="group cursor-pointer flex flex-col block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100 mb-4">
        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />}
        <img
          src={image}
          alt={title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-20" />

        {/* Stock badges */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2 z-30 bg-gray-800 text-white text-[10px] font-inter font-semibold px-2.5 py-1 rounded-full tracking-wide uppercase">
            Out of Stock
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 left-2 z-30 bg-amber-500 text-white text-[10px] font-inter font-semibold px-2.5 py-1 rounded-full tracking-wide uppercase">
            Only 1 left!
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="font-inter text-sm text-gray-900 mb-1 truncate">{title}</h3>
        <p className="font-inter font-semibold text-foreground mb-3">Rs. {price.toFixed(2)}</p>

        <button
          onClick={(e) => {
            e.preventDefault();
            // Handle add to cart here later
          }}
          disabled={isOutOfStock}
          className={`mt-auto w-full font-inter text-xs font-medium py-2.5 px-4 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-cherry text-foreground hover:opacity-90'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
