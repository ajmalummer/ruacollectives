'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Our Story', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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
            <button className="text-foreground hover:opacity-70 transition-opacity duration-200">
              <User className="w-5 h-5" />
            </button>
            <button className="text-foreground hover:opacity-70 transition-opacity duration-200 relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-foreground text-[10px] font-inter font-semibold rounded-full flex items-center justify-center">
                0
              </span>
            </button>
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
