import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RUA – Luxury Accessories',
  description: 'RUA Collectives – crafted with elegance, delivered with trust. Luxury accessories by Aysha Ummer & Shamraaz Ahemed from Kannur, Kerala.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <StoreProvider>
          <Toaster position="top-right" />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
