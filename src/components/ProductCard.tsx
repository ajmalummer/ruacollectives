'use client';

import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface ProductCardProps {
  id: string | number;
  title: string;
  price: number;
  image: string;
}

export default function ProductCard({ id, title, price, image }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

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
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="font-inter text-sm text-gray-900 mb-1 truncate">{title}</h3>
        <p className="font-inter font-semibold text-foreground mb-3">Rs. {price.toFixed(2)}</p>

        <button
          onClick={(e) => {
            e.preventDefault();
            // Handle add to cart here later
          }}
          className="mt-auto w-full bg-cherry text-foreground font-inter text-xs font-medium py-2.5 px-4 rounded-full transition-colors duration-200 hover:opacity-90 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
