'use client';

import CategoryCard from '@/components/CategoryCard';
import { useStore } from '@/context/StoreContext';

export default function CategoriesSection() {
  const { categories, isLoading } = useStore();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-playfair text-3xl md:text-4xl text-center text-foreground mb-12">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
            ))
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <CategoryCard key={category.id} id={category.id} title={category.title} image={category.image_url} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No categories found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
