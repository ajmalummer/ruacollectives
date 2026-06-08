'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { ShoppingBag, UploadCloud, CheckCircle2, ChevronRight, X, User } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, profile, storeSettings, session, signInWithGoogle } = useStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill profile
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.mobile) setMobile(profile.mobile);
      if (profile.whatsapp) setWhatsapp(profile.whatsapp);
      if (profile.address) setAddress(profile.address);
    }
  }, [profile]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-playfair mb-2">Your cart is empty</h1>
        <p className="text-gray-500 font-inter mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/" className="bg-cherry text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Screenshot must be less than 2MB');
      return;
    }
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobile || !whatsapp || !address) {
      return toast.error('Please fill out all details');
    }
    
    // Save to profile if logged in
    if (session?.user && profile) {
      supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: fullName,
        mobile,
        whatsapp,
        address
      }).then();
    }
    
    setStep(2);
    window.scrollTo(0, 0);
  };

  const placeOrder = async () => {
    if (!screenshotFile) {
      return toast.error('Please upload your payment screenshot');
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Placing your order...');

    try {
      // 1. Upload screenshot
      const fileName = `${Date.now()}-${screenshotFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const { error: uploadError } = await supabase.storage
        .from('payment_screenshots')
        .upload(fileName, screenshotFile);
      
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('payment_screenshots')
        .getPublicUrl(fileName);

      // 2. Insert Order
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        user_id: session?.user?.id || null,
        total_amount: cartTotal,
        status: 'pending',
        full_name: fullName,
        mobile,
        whatsapp,
        address,
        payment_screenshot_url: publicUrlData.publicUrl
      }).select().single();

      if (orderError) throw orderError;

      // 3. Insert Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time: item.product.offer_enabled && item.product.offer_price != null ? item.product.offer_price : item.product.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      toast.success('Order placed successfully!', { id: toastId });
      clearCart();

      // 4. WhatsApp Click-to-Chat
      if (storeSettings?.whatsapp_number) {
        const text = `Hello Thauya!\n\nI have just placed an order on your website.\n\n*Order ID:* ${orderData.id}\n*Total Amount:* Rs. ${cartTotal.toFixed(2)}\n*Name:* ${fullName}\n\nI have uploaded the payment screenshot on the website. Please confirm my order!`;
        const waLink = `https://wa.me/${storeSettings.whatsapp_number}?text=${encodeURIComponent(text)}`;
        window.open(waLink, '_blank');
      }

      router.push('/');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4 text-sm font-inter">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-cherry font-semibold' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-cherry text-white' : 'bg-gray-200'}`}>1</span>
            Details
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-cherry font-semibold' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-cherry text-white' : 'bg-gray-200'}`}>2</span>
            Payment
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-7">
            {step === 1 ? (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-playfair text-gray-900">Contact & Shipping Details</h2>
                  {!session && (
                    <button onClick={signInWithGoogle} className="text-sm font-inter text-cherry font-semibold hover:underline flex items-center gap-1">
                      <User className="w-4 h-4" /> Log in to save details
                    </button>
                  )}
                </div>

                <form id="details-form" onSubmit={handleDetailsSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-cherry focus:ring-2 focus:ring-cherry/10 transition-all text-sm" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <input required type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-cherry focus:ring-2 focus:ring-cherry/10 transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                      <input required type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-cherry focus:ring-2 focus:ring-cherry/10 transition-all text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Shipping Address</label>
                    <textarea required rows={4} value={address} onChange={e => setAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-cherry focus:ring-2 focus:ring-cherry/10 transition-all text-sm resize-none" />
                  </div>

                  <button type="submit" className="w-full bg-cherry text-white font-medium py-3.5 rounded-xl hover:opacity-90 transition-opacity mt-4">
                    Continue to Payment
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <h2 className="text-xl font-playfair text-gray-900">Payment & Verification</h2>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-sm text-amber-800">
                  <p className="font-semibold mb-1">Manual Payment Required</p>
                  <p>Please scan the QR code below and transfer <strong>Rs. {cartTotal.toFixed(2)}</strong>. Once completed, upload the screenshot of the successful transaction.</p>
                </div>

                <div className="flex flex-col items-center mb-8">
                  <div className="w-48 h-48 bg-gray-100 border border-gray-200 rounded-2xl mb-4 overflow-hidden flex items-center justify-center p-2 shadow-sm">
                    {storeSettings?.qr_code_url ? (
                      <img src={storeSettings.qr_code_url} alt="Payment QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <p className="text-xs text-gray-400 text-center">QR Code not configured by store admin.</p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-600">Scan to Pay using any UPI app</p>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot</label>
                  {!screenshotPreview ? (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-[3/1] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-cherry transition-all">
                      <UploadCloud className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Click to upload screenshot</span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 2MB</span>
                    </button>
                  ) : (
                    <div className="relative w-full aspect-[3/1] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center group">
                      <img src={screenshotPreview} alt="Screenshot preview" className="h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => fileInputRef.current?.click()} className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium">
                          Change Image
                        </button>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleScreenshotChange} className="hidden" />
                </div>

                <button 
                  onClick={placeOrder} 
                  disabled={isSubmitting || !screenshotFile}
                  className="w-full bg-[#111827] text-white font-medium py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {isSubmitting ? 'Processing...' : 'Place Order via WhatsApp'}
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">By placing this order, you will be redirected to WhatsApp to complete your order confirmation.</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28">
              <h3 className="text-lg font-playfair text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {cart.map((item, i) => {
                  const price = item.product.offer_enabled && item.product.offer_price != null ? item.product.offer_price : item.product.price;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={item.product.image_url} alt={item.product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.title}</h4>
                        <div className="flex items-center justify-between mt-1 text-sm text-gray-500">
                          <span>Qty: {item.quantity}</span>
                          <span className="font-semibold text-gray-900">Rs. {(price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-cherry">Rs. {cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
