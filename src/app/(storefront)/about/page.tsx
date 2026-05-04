import PageBanner from '@/components/PageBanner';

export default function AboutPage() {
  return (
    <main>
      <PageBanner title="About Us" image="/images/banner-about.jpg" />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="font-playfair italic text-lg text-gray-700 leading-relaxed mb-8">
            RUA was founded in March 2021 by Aysha Ummer in Kannur, Kerala.
            What began as a heartfelt dream soon grew into a brand rooted in purpose
            and passion.
          </p>
          <div className="space-y-6 font-inter text-base text-gray-700 leading-relaxed">
            <p>
              The name &quot;RUA&quot; is a tribute to Aysha&apos;s parents who is her
              greatest pillars of strength and inspiration.
            </p>
            <p>
              Today, RUA has entered an exciting new chapter with Shamraaz
              Ahemed joining as a partner. The brand is now established as a Limited
              Liability Partnership (LLP), marking a significant milestone in its
              growth journey.
            </p>
            <p>
              From humble beginnings, RUA has evolved into a trusted name in the
              accessories industry, proudly serving a growing community of customers
              across India and internationally.
            </p>
            <p>
              Every piece RUA create is designed not just as an accessory, but as
              a celebration of individuality, confidence, and self-expression.
            </p>
            <p>
              Together, Aysha and Shamraaz work tirelessly every day to elevate
              RUA to new heights. Their shared vision focuses on creating
              exceptional products while delivering an outstanding customer
              experience.
            </p>
            <p>
              By building a passionate and dedicated RUA team, they continue
              striving to ensure every customer feels valued, satisfied, and truly
              connected to the brand.
            </p>
            <p>
              We&apos;re also excited to share that we&apos;ve now opened our store at
              Vilakkode, Iritty, Kannur, Kerala. If you&apos;re visiting Kannur, we would love
              for you to stop by and experience RUA in person.
            </p>
            <p>
              At RUA, we believe in more than just style. We believe in stories,
              strength, and the power of meaningful beginnings.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
