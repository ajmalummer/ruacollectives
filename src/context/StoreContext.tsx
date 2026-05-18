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
  image_url: string;
  category_id: string;
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [signIns, setSignIns] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth
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
      const [{ data: cats }, { data: prods }, { data: heroes }, { data: signs }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('products').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('hero_images').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('sign_ins').select('*').eq('date', new Date().toISOString().split('T')[0]).single()
      ]);

      if (cats) setCategories(cats);
      if (prods) setProducts(prods);
      if (heroes) setHeroImages(heroes);
      if (signs) setSignIns(signs.count);
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
    <StoreContext.Provider value={{ categories, products, heroImages, signIns, isAuthenticated, login, logout, fetchData, isLoading }}>
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
