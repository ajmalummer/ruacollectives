'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Our Story', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { session, profile, signInWithGoogle, signOut, cart } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-cherry transition-shadow duration-300 ${
        scrolled ? 'shadow-header' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-playfair text-2xl text-foreground tracking-wide">
              RUA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-inter text-sm text-foreground transition-opacity duration-200 hover:opacity-70 ${
                  pathname === link.href ? 'opacity-100' : 'opacity-90'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:block font-playfair italic text-foreground text-xl mr-2">
              t
            </span>
            <button className="text-foreground hover:opacity-70 transition-opacity duration-200">
              <Search className="w-5 h-5" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="text-foreground hover:opacity-70 transition-opacity duration-200 flex items-center"
              >
                {session && profile?.full_name ? (
                  <div className="w-6 h-6 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 flex flex-col z-50">
                  {session ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {profile?.full_name || session.user.email}
                        </p>
                      </div>
                      <button onClick={() => { signOut(); setProfileOpen(false); }} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left w-full">
                        Logout
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { signInWithGoogle(); setProfileOpen(false); }} className="px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors text-left w-full flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Google Login
                    </button>
                  )}
                </div>
              )}
            </div>
            <Link href="/checkout" className="text-foreground hover:opacity-70 transition-opacity duration-200 relative">
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-foreground text-[10px] font-inter font-semibold rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
            <button
              className="md:hidden text-foreground hover:opacity-70 transition-opacity duration-200"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-cherry border-t border-white/10">
          <nav className="flex flex-col px-4 py-4 gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-inter text-sm text-foreground py-2 transition-opacity duration-200 hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
