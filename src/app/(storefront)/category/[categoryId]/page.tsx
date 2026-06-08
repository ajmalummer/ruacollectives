'use client';

import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/ProductCard';
import { ChevronDown, Grid3x3, LayoutGrid } from 'lucide-react';
import { useState } from 'react';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const { categories, products, isLoading } = useStore();
  const [sortBy] = useState('featured');

  const category = categories.find((c) => c.id === categoryId);
  const categoryProducts = products.filter((p) => p.category_ids?.includes(categoryId));

  const sortedProducts = [...categoryProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center w-full">
          <div className="w-64 h-12 bg-gray-200 rounded mb-12"></div>
          <div className="w-full max-w-7xl border-t border-b border-gray-200 py-4 mb-8 flex justify-between">
            <div className="w-32 h-6 bg-gray-200 rounded"></div>
            <div className="w-48 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center">
        <h1 className="text-2xl font-playfair mb-4 mt-20">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground text-center mb-10">
            {category.title}
          </h1>

          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-b border-gray-200 py-4 gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-600 font-inter">
              <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                Availability <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                Price <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 font-inter">
              <span>{categoryProducts.length} items</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                  Sort <ChevronDown className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                <button className="text-foreground">
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-foreground transition-colors">
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image={product.image_url}
                stock={product.stock}
                offerEnabled={product.offer_enabled}
                offerPrice={product.offer_price}
                isAntiTarnish={product.is_anti_tarnish}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 font-inter">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
