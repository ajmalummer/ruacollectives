'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CategoryCardProps {
  id: string;
  title: string;
  image: string;
}

export default function CategoryCard({ id, title, image }: CategoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/category/${id}`} className="group cursor-pointer relative aspect-square overflow-hidden rounded-lg bg-gray-100 block">
      {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />}
      <img
        src={image}
        alt={title}
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#00000021] backdrop-blur-md px-5 py-2 rounded-[20px] whitespace-nowrap transition-all duration-300 group-hover:bg-[#00000033] z-20">
        <h3 className="font-inter font-medium text-[15px] tracking-wide text-[#ffffff] drop-shadow-sm">
          {title}
        </h3>
      </div>
    </Link>
  );
}
