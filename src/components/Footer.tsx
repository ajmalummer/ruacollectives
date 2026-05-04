import Link from 'next/link';
import { Truck, Headphones, ShieldCheck, MapPin, Mail, Phone, MessageCircle, CreditCard, Smartphone, Globe } from 'lucide-react';

const trustBadges = [
  {
    icon: Truck,
    title: 'DTDC & Indian Post',
    description: 'Shipping Worldwide & Home Delivery all over India',
  },
  {
    icon: Headphones,
    title: 'Customer service',
    description: 'WhatsApp Us +91 956 200 1937',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payment',
    description: 'All payments are processed securely',
  },
];

const infoLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Privacy Policies', href: '/shipping-policy' },
  { label: 'Refund Policy', href: '/shipping-policy' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Terms of Service', href: '/shipping-policy' },
  { label: 'Contact Us', href: '/contact' },
];

const quickLinks = [
  { label: 'Necklaces', href: '/' },
  { label: 'Bracelets', href: '/' },
  { label: 'Earrings', href: '/' },
  { label: 'Bangle Bracelets', href: '/' },
  { label: 'Rings', href: '/' },
  { label: 'Waist chain', href: '/' },
];

export default function Footer() {
  return (
    <footer className="bg-cherry text-foreground">
      {/* Trust Badges */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustBadges.map((badge) => (
              <div key={badge.title} className="flex items-start gap-4">
                <badge.icon className="w-8 h-8 text-foreground/80 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-inter font-medium text-sm text-foreground">
                    {badge.title}
                  </h4>
                  <p className="font-inter text-sm text-foreground/60 mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="text-center py-8 border-b border-white/10">
        <p className="font-playfair italic text-lg text-foreground/90">
          Crafted with elegance. Delivered with trust.
        </p>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Information */}
          <div>
            <h4 className="font-inter font-medium text-sm text-foreground mb-4">
              Information
            </h4>
            <ul className="space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-inter text-sm text-foreground/60 hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-inter font-medium text-sm text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-inter text-sm text-foreground/60 hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="font-inter font-medium text-sm text-foreground mb-4">
              Contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-foreground/60 shrink-0 mt-0.5" />
                <p className="font-inter text-sm text-foreground/60">
                  Vilakkode, Iritty, Kannur, Kerala
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-foreground/60 shrink-0" />
                <p className="font-inter text-sm text-foreground/60">
                  ruacollectives@gmail.com
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-foreground/60 shrink-0" />
                <p className="font-inter text-sm text-foreground/60">
                  (+91) 9562001937
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-foreground/60 shrink-0" />
                <p className="font-inter text-sm text-foreground/60">
                  +9195622001788
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-foreground/40" />
              <Smartphone className="w-6 h-6 text-foreground/40" />
              <Globe className="w-6 h-6 text-foreground/40" />
            </div>
            <p className="font-inter text-xs text-foreground/50">
              © 2026 RUA, Founded by Aysha Ummer
            </p>
            <Link
              href="/shipping-policy"
              className="font-inter text-xs text-foreground/50 hover:text-foreground transition-colors duration-200"
            >
              Terms and Policies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
