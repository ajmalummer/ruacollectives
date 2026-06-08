'use client';

import ProductCard from '@/components/ProductCard';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function BestSellersSection() {
  const { products, isLoading } = useStore();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-3">
              Best Sellers
            </h2>
            <p className="font-inter text-gray-600">Loved by our customers</p>
          </div>
          <button className="hidden sm:flex items-center gap-1 font-inter text-sm text-gray-600 hover:text-foreground transition-colors duration-200">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/5] bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.slice(0, 8).map((product) => (
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
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No products found.</p>
          )}
        </div>

        <button className="sm:hidden mt-8 w-full flex justify-center items-center gap-2 font-inter text-sm text-foreground py-3 border border-gray-200 rounded-lg">
          View All Products <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
