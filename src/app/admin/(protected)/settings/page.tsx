'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/context/StoreContext';
import { toast } from 'react-hot-toast';
import { Settings, UploadCloud, Save, Smartphone, QrCode } from 'lucide-react';

export default function AdminSettingsPage() {
  const { storeSettings, fetchData } = useStore();
  const [whatsapp, setWhatsapp] = useState('');
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (storeSettings) {
      setWhatsapp(storeSettings.whatsapp_number || '');
      setQrCodePreview(storeSettings.qr_code_url || null);
    }
  }, [storeSettings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image must be less than 2MB');
    }
    setQrCodeFile(file);
    setQrCodePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading('Saving settings...');

    try {
      let qrCodeUrl = storeSettings?.qr_code_url;

      if (qrCodeFile) {
        const fileName = `qr-${Date.now()}-${qrCodeFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, qrCodeFile);
        
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        qrCodeUrl = data.publicUrl;
      }

      const { error } = await supabase.from('store_settings').upsert({
        id: 1,
        whatsapp_number: whatsapp,
        qr_code_url: qrCodeUrl,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success('Settings saved successfully!', { id: toastId });
      await fetchData(); // Refresh context
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save settings', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-inter text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-cherry" />
          Store Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-inter">Manage your store's contact and payment details.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          
          {/* WhatsApp Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-gray-400" />
              WhatsApp Notification Number
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4 text-sm text-gray-600">
              <p>This is the number that will receive new order notifications from customers. Make sure to include your country code without the '+' sign (e.g., <strong>919876543210</strong> for India).</p>
            </div>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input 
                type="tel" 
                value={whatsapp} 
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="e.g. 919876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry focus:ring-1 focus:ring-cherry text-sm" 
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Payment Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-gray-400" />
              Payment QR Code
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4 text-sm text-gray-600">
              <p>Upload your UPI/Bank QR code here. Customers will see this during checkout to make manual payments.</p>
            </div>
            
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Image</label>
              
              {!qrCodePreview ? (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square max-w-[200px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-cherry transition-all">
                  <UploadCloud className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Upload QR</span>
                </button>
              ) : (
                <div className="relative w-full aspect-square max-w-[200px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center group">
                  <img src={qrCodePreview} alt="QR Code" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-gray-900 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-100">
                      Change QR
                    </button>
                    <button type="button" onClick={() => { setQrCodeFile(null); setQrCodePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-red-600">
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-cherry text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
