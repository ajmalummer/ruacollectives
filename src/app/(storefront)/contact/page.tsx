import PageBanner from '@/components/PageBanner';
import { MessageCircle, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <main>
      <PageBanner title="Contact Us" image="/images/banner-about.jpg" />
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Info */}
            <div>
              <h2 className="font-playfair text-2xl text-gray-900 mb-4">
                Get in touch with us
              </h2>
              <p className="font-inter text-base text-gray-600 leading-relaxed mb-4">
                Have a question, feedback, or need assistance? We&apos;re here to help.
                Whether it&apos;s about our products or your order, the RUA team is
                happy to connect with you.
              </p>
              <p className="font-inter text-base text-gray-600 leading-relaxed mb-8">
                Drop us a message using the form, or reach out through any of the
                options below.
              </p>

              {/* Chat Section */}
              <div className="mb-8">
                <h3 className="font-inter font-semibold text-lg text-gray-900 mb-2">
                  Chat with us
                </h3>
                <p className="font-inter text-sm text-gray-600 mb-3">
                  Our support team is ready to assist you with quick responses.
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="w-5 h-5 text-foreground" />
                  <span className="font-inter text-sm text-gray-900">
                    (+91) 6238695004
                  </span>
                </div>
                <p className="font-inter text-xs text-gray-500">
                  Click to start a chat with our customer support team
                </p>
              </div>

              {/* Visit Section */}
              <div>
                <h3 className="font-inter font-semibold text-lg text-gray-900 mb-2">
                  Visit Us
                </h3>
                <p className="font-inter text-sm text-gray-600 mb-3">
                  You&apos;re welcome to visit our store.
                </p>
                <div className="flex items-start gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <span className="font-inter text-sm text-gray-900">
                    RUA Store, Vilakkode, Iritty, Kannur, Kerala
                  </span>
                </div>
                <p className="font-inter text-xs text-gray-500">
                  Business Hours: Monday – Sunday: 10:00 AM – 10:00 PM
                </p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-cherry rounded-xl p-8">
              <h3 className="font-playfair text-xl text-foreground text-center mb-6">
                Drop Us a Message
              </h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full bg-white rounded-lg px-4 py-3 font-inter text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email *"
                    required
                    className="w-full bg-white rounded-lg px-4 py-3 font-inter text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="w-full bg-white rounded-lg px-4 py-3 font-inter text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Comment"
                    rows={4}
                    className="w-full bg-white rounded-lg px-4 py-3 font-inter text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-white/30 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-foreground font-inter font-medium text-sm py-3 rounded-lg transition-colors duration-200 hover:bg-gray-100"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
