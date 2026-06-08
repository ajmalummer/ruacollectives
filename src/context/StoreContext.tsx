'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  title: string;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  offer_enabled: boolean;
  offer_price: number | null;
  description_enabled: boolean;
  description: string | null;
  is_anti_tarnish: boolean;
  image_url: string;
  additional_images: string[];
  category_ids: string[];
  display_order: number;
  stock: number | null;
}

export interface HeroImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  mobile: string;
  whatsapp: string;
  address: string;
}

export interface StoreSettings {
  id: number;
  whatsapp_number: string;
  qr_code_url: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  full_name: string;
  mobile: string;
  whatsapp: string;
  address: string;
  payment_screenshot_url: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreContextType {
  categories: Category[];
  products: Product[];
  heroImages: HeroImage[];
  signIns: number;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  fetchData: () => Promise<void>;
  isLoading: boolean;
  storeSettings: StoreSettings | null;
  session: any | null;
  profile: Profile | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [signIns, setSignIns] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load Cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('rua_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save Cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rua_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => {
    const price = item.product.offer_enabled && item.product.offer_price != null 
      ? Number(item.product.offer_price) 
      : Number(item.product.price);
    return total + (price * item.quantity);
  }, 0);

  // Initialize Session Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Initialize Admin Auth
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const login = (password: string) => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [{ data: cats }, { data: prods }, { data: heroes }, { data: signs }, { data: settings }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('products').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('hero_images').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('sign_ins').select('*').eq('date', new Date().toISOString().split('T')[0]).single(),
        supabase.from('store_settings').select('*').eq('id', 1).single()
      ]);

      if (cats) setCategories(cats);
      if (prods) setProducts(prods);
      if (heroes) setHeroImages(heroes);
      if (signs) setSignIns(signs.count);
      if (settings) setStoreSettings(settings);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Track visit/sign-in
  useEffect(() => {
    fetchData();

    const trackVisit = async () => {
      if (!sessionStorage.getItem('visited')) {
        sessionStorage.setItem('visited', 'true');
        const today = new Date().toISOString().split('T')[0];

        try {
          const { data, error } = await supabase.from('sign_ins').select('count').eq('date', today).single();
          if (data) {
            await supabase.from('sign_ins').update({ count: data.count + 1 }).eq('date', today);
          } else if (error?.code === 'PGRST116') {
            await supabase.from('sign_ins').insert({ date: today, count: 1 });
          }
        } catch (e) {
          console.error('Visit tracking error', e);
        }
      }
    };

    setTimeout(trackVisit, 2000);
  }, []);

  return (
    <StoreContext.Provider value={{
      categories, products, heroImages, signIns, isAuthenticated, login, logout, fetchData, isLoading,
      storeSettings, session, profile, signInWithGoogle, signOut,
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
