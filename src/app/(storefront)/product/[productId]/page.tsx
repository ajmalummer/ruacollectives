'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, Minus, Plus, Truck, HeadphonesIcon, ShieldCheck } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { products, isLoading } = useStore();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === productId || p.id.toString() === productId);

  const relatedProducts = products
    .filter((p) => p.id !== product?.id)
    .slice(0, 4);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 px-4 flex items-center justify-center">
        <div className="animate-pulse flex flex-col md:flex-row gap-12 w-full max-w-6xl">
          <div className="w-full md:w-1/2 aspect-square bg-gray-200 rounded-lg"></div>
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded w-full mt-6"></div>
            <div className="h-32 bg-gray-200 rounded w-full mt-4"></div>
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

        {/* Product Details Section */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-24">

          {/* Left: Image */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] md:aspect-square overflow-hidden rounded-xl bg-[#f4f4f4]">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 flex flex-col">
            <h1 className="font-playfair text-3xl md:text-5xl text-foreground mb-4 leading-tight">
              {product.title}
            </h1>
            <p className="font-inter font-semibold text-lg text-foreground mb-8">
              Rs. {product.price.toFixed(2)}
            </p>

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

            {/* Description Text */}
            <div className="text-sm text-gray-600 font-inter space-y-1.5 leading-relaxed">
              <p>* Total length of the product (including extension): 50cm</p>
              <p>* Total length of the product (excluding extension): 45cm</p>
              <p>* Length of the extension chain: 5cm</p>
              <p>* Length of one side of the necklace (including extension): 23cm</p>
              <p>* Length of one side of the necklace (excluding extension): 22.5cm</p>
              <p className="font-medium text-foreground mt-4 mb-1">* Customisation Option:</p>
              <p>- Can the size be customised to a smaller length? -YES!</p>
              <p>Please mention your preferred size (in centimetres) in the &quot;Special Instructions&quot; section during checkout.</p>
            </div>
          </div>
        </div>

        {/* You may also like Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-24 border-t border-gray-200 pt-16">
            <h2 className="font-inter text-xl text-foreground mb-8">
              You may also like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  price={p.price}
                  image={p.image_url}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
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
