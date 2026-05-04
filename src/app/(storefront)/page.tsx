import HeroSection from '@/sections/home/HeroSection';
import CategoriesSection from '@/sections/home/CategoriesSection';
import BestSellersSection from '@/sections/home/BestSellersSection';
import FAQSection from '@/sections/home/FAQSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <BestSellersSection />
      <FAQSection />
    </main>
  );
}
