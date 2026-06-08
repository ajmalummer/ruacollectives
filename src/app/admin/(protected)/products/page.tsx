'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Pencil, Trash2, GripVertical, X, ImagePlus, Images, Tag, FileText, ShieldCheck } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_SIZE = 50 * 1024; // 50 KB

// ─── Helpers ─────────────────────────────────────────────────────────────────
function validateImage(file: File, inputEl?: HTMLInputElement | null): boolean {
  if (file.type !== 'image/webp') {
    toast.error('Only WebP images are allowed.');
    if (inputEl) inputEl.value = '';
    return false;
  }
  if (file.size > MAX_SIZE) {
    toast.error('Image size must be 50 KB or less.');
    if (inputEl) inputEl.value = '';
    return false;
  }
  return true;
}

// ─── Stock Badge ─────────────────────────────────────────────────────────────
function StockBadge({ stock }: { stock: number | null | undefined }) {
  if (stock === null || stock === undefined)
    return <span className="text-xs text-gray-400 font-inter">Unlimited</span>;
  if (stock === 0)
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>;
  if (stock === 1)
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">⚠ 1 — Low!</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{stock}</span>;
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────
function SortableProductRow({ product, categoryName, onEdit, onDelete }: {
  product: any; categoryName: string; onEdit: any; onDelete: any;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? 'relative' as const : undefined,
  };
  const extraImages: string[] = product.additional_images ?? [];

  return (
    <tr ref={setNodeRef} style={style} className={`bg-white ${isDragging ? 'shadow-lg border border-cherry/20 z-10' : ''}`}>
      <td className="px-6 py-4 w-10">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
          style={{ touchAction: 'none' }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <img src={product.image_url} alt={product.title} className="w-12 h-12 rounded object-cover" />
          {extraImages.length > 0 && (
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex gap-0.5">
                {extraImages.slice(0, 3).map((url: string, i: number) => (
                  <img key={i} src={url} alt="" className="w-5 h-5 rounded object-cover opacity-80" />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <Images className="w-3 h-3" /> {extraImages.length + 1}
              </span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 font-medium">{product.title}</td>
      <td className="px-6 py-4 text-gray-500">{categoryName}</td>
      <td className="px-6 py-4 text-gray-500">
        {product.offer_enabled && product.offer_price != null ? (
          <div className="flex flex-col">
            <span className="font-bold text-sm" style={{ color: '#C0392B' }}>Rs. {Number(product.offer_price).toFixed(2)}</span>
            <span className="text-xs text-gray-400 line-through">Rs. {product.price.toFixed(2)}</span>
          </div>
        ) : (
          <span>Rs. {product.price.toFixed(2)}</span>
        )}
      </td>
      <td className="px-6 py-4"><StockBadge stock={product.stock} /></td>
      <td className="px-6 py-4 text-right">
        <button onClick={() => onEdit(product)} className="text-gray-400 hover:text-cherry mr-3 transition-colors" title="Edit">
          <Pencil className="w-5 h-5 inline" />
        </button>
        <button onClick={() => onDelete(product.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
          <Trash2 className="w-5 h-5 inline" />
        </button>
      </td>
    </tr>
  );
}

// ─── Image Slot (shared by Add form & Edit modal) ────────────────────────────
interface ImageSlotProps {
  index: number;
  existingUrl: string | null;
  newFile: File | null;
  onFileChange: (file: File | null) => void;
  onRemoveExisting: () => void;
}
function AdditionalImageSlot({ index, existingUrl, newFile, onFileChange, onRemoveExisting }: ImageSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = newFile ? URL.createObjectURL(newFile) : existingUrl;
  const label = `Image ${index + 2}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!validateImage(f, e.target)) return;
    onFileChange(f);
  };

  const handleClear = () => {
    if (newFile) onFileChange(null); else onRemoveExisting();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Optional</span>
      </div>

      {previewUrl ? (
        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
          <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="pointer-events-auto text-[11px] font-medium bg-black/60 text-white px-2.5 py-1 rounded-full hover:bg-black/80 transition-colors">
              Replace
            </button>
          </div>
          <button type="button" onClick={handleClear}
            className="absolute top-1.5 right-1.5 z-10 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-600 hover:scale-110 transition-all"
            title="Remove image">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-cherry/40 hover:bg-cherry/5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-cherry transition-colors">
          <ImagePlus className="w-6 h-6" />
          <span className="text-xs font-medium">Add image</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/webp" onChange={handleChange} className="hidden" />
    </div>
  );
}

// ─── Image Grid (primary + 3 additional) — used in both Add form & Edit modal ─
interface ImageGridProps {
  primaryFile: File | null;
  setPrimaryFile: (f: File | null) => void;
  primaryInputRef: React.RefObject<HTMLInputElement | null>;
  primaryPreviewUrl: string | null;
  additionalFiles: (File | null)[];
  onAdditionalFileChange: (i: number, f: File | null) => void;
  existingAdditionalUrls: (string | null)[];
  onRemoveExistingAdditional: (i: number) => void;
  isEditing: boolean;
}
function ImageGrid({
  primaryFile, setPrimaryFile, primaryInputRef, primaryPreviewUrl,
  additionalFiles, onAdditionalFileChange,
  existingAdditionalUrls, onRemoveExistingAdditional,
  isEditing,
}: ImageGridProps) {
  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!validateImage(f, e.target)) return;
    setPrimaryFile(f);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Images className="w-4 h-4 text-cherry" />
        <span className="text-sm font-semibold text-gray-700">
          Product Images <span className="font-normal text-gray-400">(up to 4 — WebP, max 50 KB each)</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Primary slot */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="block text-sm font-medium text-gray-700">Image 1</label>
            <span className="text-[10px] font-medium text-cherry bg-cherry/10 px-1.5 py-0.5 rounded-full">Primary</span>
            {isEditing && <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Optional</span>}
          </div>

          {primaryPreviewUrl ? (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
              <img src={primaryPreviewUrl} alt="Primary" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button type="button" onClick={() => primaryInputRef.current?.click()}
                  className="pointer-events-auto text-[11px] font-medium bg-black/60 text-white px-2.5 py-1 rounded-full hover:bg-black/80 transition-colors">
                  Replace
                </button>
              </div>
              <button type="button"
                onClick={() => { setPrimaryFile(null); if (primaryInputRef.current) primaryInputRef.current.value = ''; }}
                className="absolute top-1.5 right-1.5 z-10 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-600 hover:scale-110 transition-all"
                title="Remove / change image">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => primaryInputRef.current?.click()}
              className="w-full aspect-square rounded-lg border-2 border-dashed border-cherry/30 hover:border-cherry hover:bg-cherry/5 flex flex-col items-center justify-center gap-2 text-cherry/60 hover:text-cherry transition-colors">
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs font-medium">Add image</span>
            </button>
          )}
          <input ref={primaryInputRef} type="file" accept="image/webp"
            required={!isEditing && !primaryPreviewUrl}
            onChange={handlePrimaryChange} className="hidden" />
        </div>

        {/* Additional slots */}
        {[0, 1, 2].map(i => (
          <AdditionalImageSlot
            key={i}
            index={i}
            existingUrl={existingAdditionalUrls[i]}
            newFile={additionalFiles[i]}
            onFileChange={(f) => onAdditionalFileChange(i, f)}
            onRemoveExisting={() => onRemoveExistingAdditional(i)}
          />
        ))}
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Image 1 is shown in product listings. Images 2–4 are optional — add as many as you need. All appear in the product gallery.
      </p>
    </div>
  );
}

// ─── Description Section (shared toggle + textarea) ──────────────────────────
interface DescriptionSectionProps {
  enabled: boolean;
  value: string;
  onToggle: (val: boolean) => void;
  onChange: (val: string) => void;
}
function DescriptionSection({ enabled, value, onToggle, onChange }: DescriptionSectionProps) {
  const lines = value.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  return (
    <div className={`rounded-xl border transition-colors duration-200 p-4 ${
      enabled ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
    }`}>
      {/* Toggle row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <FileText className={`w-4 h-4 ${enabled ? 'text-gray-700' : 'text-gray-400'}`} />
          <span className={`text-sm font-semibold ${enabled ? 'text-gray-800' : 'text-gray-500'}`}>
            Product Description
          </span>
          {enabled && lines.length > 0 && (
            <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {lines.length} line{lines.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {/* iOS-style toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
          style={{ backgroundColor: enabled ? '#6b7280' : '#d1d5db' }}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-gray-400">
            Each line becomes a ✦ bullet on the product page. Press Enter to add a new line.
          </p>
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={6}
            placeholder={`Total length: 50cm\nMaterial: Sterling Silver\nCustomisation available on request`}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-gray-400 text-sm font-inter resize-y leading-relaxed"
            style={{ minHeight: '120px' }}
          />
          {/* Live preview */}
          {lines.length > 0 && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Preview</p>
              <ul className="space-y-1.5">
                {lines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5" style={{ color: '#b5a090' }}>✦</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Offer Price Section (shared toggle + fields) ────────────────────────────
interface OfferPriceSectionProps {
  regularPrice: string;
  offerEnabled: boolean;
  offerPrice: string;
  onToggle: (val: boolean) => void;
  onOfferPriceChange: (val: string) => void;
  inputClassName?: string;
}
function OfferPriceSection({
  regularPrice, offerEnabled, offerPrice,
  onToggle, onOfferPriceChange, inputClassName = '',
}: OfferPriceSectionProps) {
  const reg = parseFloat(regularPrice);
  const off = parseFloat(offerPrice);
  const discountPct = !isNaN(reg) && !isNaN(off) && reg > 0 && off < reg
    ? Math.round(((reg - off) / reg) * 100)
    : null;

  return (
    <div className={`rounded-xl border transition-colors duration-200 p-4 ${
      offerEnabled ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
    }`}>
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4" style={{ color: offerEnabled ? '#C0392B' : '#9ca3af' }} />
          <span className="text-sm font-semibold" style={{ color: offerEnabled ? '#C0392B' : '#4b5563' }}>
            Offer Price
          </span>
          {offerEnabled && discountPct !== null && (
            <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: '#C0392B' }}>
              -{discountPct}% off
            </span>
          )}
        </div>
        {/* iOS-style toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={offerEnabled}
          onClick={() => onToggle(!offerEnabled)}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
          style={{ backgroundColor: offerEnabled ? '#C0392B' : '#d1d5db' }}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              offerEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Offer price field — animated reveal */}
      {offerEnabled && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Regular Price (Rs.)</label>
            <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500">
              {regularPrice || '—'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#C0392B' }}>Offer Price (Rs.) *</label>
            <input
              required={offerEnabled}
              type="number"
              step="0.01"
              min="0.01"
              value={offerPrice}
              onChange={e => onOfferPriceChange(e.target.value)}
              placeholder="Enter offer price"
              className={`w-full px-3 py-2 border rounded-lg outline-none text-sm bg-white ${inputClassName}`}
              style={{ borderColor: '#C0392B' }}
            />
            {discountPct !== null && (
              <p className="text-[11px] font-medium mt-1" style={{ color: '#C0392B' }}>
                Customer saves {discountPct}% off the regular price
              </p>
            )}
            {offerPrice && !isNaN(off) && !isNaN(reg) && off >= reg && (
              <p className="text-[11px] text-red-600 font-medium mt-1">
                ⚠ Offer price must be less than regular price
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Anti-Tarnish Section (shared toggle) ──────────────────────────────────
interface AntiTarnishSectionProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}
function AntiTarnishSection({ enabled, onToggle }: AntiTarnishSectionProps) {
  return (
    <div className={`rounded-xl border transition-colors duration-200 p-4 ${
      enabled ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${enabled ? 'text-amber-600' : 'text-gray-400'}`} />
          <span className={`text-sm font-semibold ${enabled ? 'text-amber-700' : 'text-gray-600'}`}>
            Anti-tarnish
          </span>
          {enabled && (
            <span className="text-[11px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
              Enabled
            </span>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
            enabled ? 'bg-amber-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditModalProps {
  product: any;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}
function EditModal({ product, categories, onClose, onSaved }: EditModalProps) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price.toString());
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [stock, setStock] = useState(
    product.stock !== null && product.stock !== undefined ? product.stock.toString() : ''
  );
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreviewUrl, setPrimaryPreviewUrl] = useState<string | null>(product.image_url ?? null);
  const primaryInputRef = useRef<HTMLInputElement>(null);

  const [additionalFiles, setAdditionalFiles] = useState<(File | null)[]>([null, null, null]);
  const [existingAdditionalUrls, setExistingAdditionalUrls] = useState<(string | null)[]>(() => {
    const arr: (string | null)[] = [null, null, null];
    (product.additional_images ?? []).slice(0, 3).forEach((url: string, i: number) => { arr[i] = url; });
    return arr;
  });

  const [isUploading, setIsUploading] = useState(false);
  const [offerEnabled, setOfferEnabled] = useState<boolean>(!!product.offer_enabled);
  const [offerPrice, setOfferPrice] = useState<string>(
    product.offer_price != null ? String(product.offer_price) : ''
  );
  const [descEnabled, setDescEnabled] = useState<boolean>(!!product.description_enabled);
  const [description, setDescription] = useState<string>(product.description ?? '');
  const [isAntiTarnish, setIsAntiTarnish] = useState<boolean>(!!product.is_anti_tarnish);

  // Keep primaryPreviewUrl in sync when primaryFile changes
  useEffect(() => {
    if (primaryFile) {
      const url = URL.createObjectURL(primaryFile);
      setPrimaryPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [primaryFile]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from('images').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !categoryId) return toast.error('Please fill required fields');

    setIsUploading(true);
    const toastId = toast.loading('Updating product...');
    try {
      let imageUrl: string | undefined;
      if (primaryFile) {
        const fileName = `${Date.now()}-${primaryFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        imageUrl = await uploadFile(primaryFile, `products/${fileName}`);
      }

      const additionalUrls: string[] = [];
      for (let i = 0; i < 3; i++) {
        const f = additionalFiles[i];
        const existing = existingAdditionalUrls[i];
        if (f) {
          const fileName = `${Date.now()}-${i}-${f.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
          additionalUrls.push(await uploadFile(f, `products/${fileName}`));
        } else if (existing) {
          additionalUrls.push(existing);
        }
      }

      const stockValue = stock.trim() === '' ? null : parseInt(stock, 10);
      const offerPriceValue = offerEnabled && offerPrice.trim() !== '' ? parseFloat(offerPrice) : null;
      const updateData: any = {
        title,
        price: parseFloat(price),
        category_id: categoryId,
        stock: stockValue,
        additional_images: additionalUrls,
        offer_enabled: offerEnabled,
        offer_price: offerPriceValue,
        description_enabled: descEnabled,
        description: descEnabled && description.trim() !== '' ? description.trim() : null,
        is_anti_tarnish: isAntiTarnish,
      };
      if (imageUrl) updateData.image_url = imageUrl;

      const { error: dbError } = await supabase.from('products').update(updateData).eq('id', product.id);
      if (dbError) throw dbError;

      toast.success('Product updated!', { id: toastId });
      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update product', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Modal panel — stop propagation so inner clicks don't close */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry text-sm" />
            </div>

            {/* Price / Category / Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required value={categoryId} onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry bg-white text-sm">
                  <option value="" disabled>Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock <span className="text-gray-400 font-normal">(blank = unlimited)</span>
                </label>
                <input type="number" min="0" step="1" value={stock} onChange={e => setStock(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry text-sm" />
              </div>
            </div>

            {/* Offer Price */}
            <OfferPriceSection
              regularPrice={price}
              offerEnabled={offerEnabled}
              offerPrice={offerPrice}
              onToggle={setOfferEnabled}
              onOfferPriceChange={setOfferPrice}
            />

            {/* Description */}
            <DescriptionSection
              enabled={descEnabled}
              value={description}
              onToggle={setDescEnabled}
              onChange={setDescription}
            />

            {/* Anti-Tarnish */}
            <AntiTarnishSection
              enabled={isAntiTarnish}
              onToggle={setIsAntiTarnish}
            />

            {/* Images */}
            <ImageGrid
              primaryFile={primaryFile}
              setPrimaryFile={(f) => { setPrimaryFile(f); if (!f) setPrimaryPreviewUrl(product.image_url ?? null); }}
              primaryInputRef={primaryInputRef}
              primaryPreviewUrl={primaryPreviewUrl}
              additionalFiles={additionalFiles}
              onAdditionalFileChange={(i, f) => setAdditionalFiles(prev => { const n = [...prev]; n[i] = f; return n; })}
              existingAdditionalUrls={existingAdditionalUrls}
              onRemoveExistingAdditional={(i) => setExistingAdditionalUrls(prev => { const n = [...prev]; n[i] = null; return n; })}
              isEditing={true}
            />
          </form>
        </div>

        {/* Footer — sticky action bar */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button type="button" onClick={onClose} disabled={isUploading}
            className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="edit-product-form" disabled={isUploading}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-cherry text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2">
            {isUploading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {isUploading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const { products, categories, fetchData } = useStore();
  const [localProducts, setLocalProducts] = useState<any[]>([]);

  // Add-form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [offerEnabled, setOfferEnabled] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [descEnabled, setDescEnabled] = useState(false);
  const [description, setDescription] = useState('');
  const [isAntiTarnish, setIsAntiTarnish] = useState(false);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreviewUrl, setPrimaryPreviewUrl] = useState<string | null>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const [additionalFiles, setAdditionalFiles] = useState<(File | null)[]>([null, null, null]);
  const [existingAdditionalUrls] = useState<(string | null)[]>([null, null, null]);
  const [isAdding, setIsAdding] = useState(false);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  useEffect(() => { setLocalProducts(products); }, [products]);

  // Keep add-form primaryPreviewUrl in sync
  useEffect(() => {
    if (primaryFile) {
      const url = URL.createObjectURL(primaryFile);
      setPrimaryPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPrimaryPreviewUrl(null);
    }
  }, [primaryFile]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resetAddForm = () => {
    setTitle(''); setPrice(''); setCategoryId(''); setStock('');
    setOfferEnabled(false); setOfferPrice('');
    setDescEnabled(false); setDescription('');
    setIsAntiTarnish(false);
    setPrimaryFile(null);
    setAdditionalFiles([null, null, null]);
    if (primaryInputRef.current) primaryInputRef.current.value = '';
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from('images').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !categoryId) return toast.error('Please fill required fields');
    if (!primaryFile) return toast.error('Please select a primary image');

    setIsAdding(true);
    const toastId = toast.loading('Adding product...');
    try {
      const fileName = `${Date.now()}-${primaryFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const imageUrl = await uploadFile(primaryFile, `products/${fileName}`);

      const additionalUrls: string[] = [];
      for (let i = 0; i < 3; i++) {
        const f = additionalFiles[i];
        if (f) {
          const fn = `${Date.now()}-${i}-${f.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
          additionalUrls.push(await uploadFile(f, `products/${fn}`));
        }
      }

      const stockValue = stock.trim() === '' ? null : parseInt(stock, 10);
      const offerPriceValue = offerEnabled && offerPrice.trim() !== '' ? parseFloat(offerPrice) : null;
      const { error: dbError } = await supabase.from('products').insert({
        title, price: parseFloat(price), category_id: categoryId,
        display_order: localProducts.length,
        image_url: imageUrl, additional_images: additionalUrls, stock: stockValue,
        offer_enabled: offerEnabled, offer_price: offerPriceValue,
        description_enabled: descEnabled,
        description: descEnabled && description.trim() !== '' ? description.trim() : null,
        is_anti_tarnish: isAntiTarnish,
      });
      if (dbError) throw dbError;

      toast.success('Product added!', { id: toastId });
      resetAddForm();
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to add product', { id: toastId });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const toastId = toast.loading('Deleting product...');
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted!', { id: toastId });
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete product', { id: toastId });
    }
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.title || 'Unknown';

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localProducts.findIndex(p => p.id === active.id);
    const newIndex = localProducts.findIndex(p => p.id === over.id);
    const reordered = arrayMove(localProducts, oldIndex, newIndex);
    setLocalProducts(reordered);
    try {
      await Promise.all(reordered.map((prod, index) =>
        supabase.from('products').update({ display_order: index }).eq('id', prod.id)
      ));
      await fetchData();
    } catch {
      toast.error('Failed to save new order');
      setLocalProducts(products);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-inter text-gray-900">Manage Products</h1>

      {/* ── Add Product Form ── */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-5">Add New Product</h2>
        <form onSubmit={handleAddSubmit} className="space-y-5 max-w-2xl">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select required value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry bg-white">
                <option value="" disabled>Select category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-gray-400 font-normal">(blank = unlimited)</span>
              </label>
              <input type="number" min="0" step="1" value={stock} onChange={e => setStock(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry" />
            </div>
          </div>

          <ImageGrid
            primaryFile={primaryFile}
            setPrimaryFile={setPrimaryFile}
            primaryInputRef={primaryInputRef}
            primaryPreviewUrl={primaryPreviewUrl}
            additionalFiles={additionalFiles}
            onAdditionalFileChange={(i, f) => setAdditionalFiles(prev => { const n = [...prev]; n[i] = f; return n; })}
            existingAdditionalUrls={existingAdditionalUrls}
            onRemoveExistingAdditional={() => {/* no existing URLs on add form */}}
            isEditing={false}
          />

          {/* Offer Price */}
          <OfferPriceSection
            regularPrice={price}
            offerEnabled={offerEnabled}
            offerPrice={offerPrice}
            onToggle={setOfferEnabled}
            onOfferPriceChange={setOfferPrice}
          />

          {/* Description */}
          <DescriptionSection
            enabled={descEnabled}
            value={description}
            onToggle={setDescEnabled}
            onChange={setDescription}
          />

          {/* Anti-Tarnish */}
          <AntiTarnishSection
            enabled={isAntiTarnish}
            onToggle={setIsAntiTarnish}
          />

          <div>
            <button disabled={isAdding} type="submit"
              className="bg-cherry text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {isAdding && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {isAdding ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Products Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 w-10"></th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Images</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Title</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 relative">
                <SortableContext items={localProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {localProducts.map(prod => (
                    <SortableProductRow
                      key={prod.id}
                      product={prod}
                      categoryName={getCategoryName(prod.category_id)}
                      onEdit={(p: any) => setEditingProduct(p)}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
                {localProducts.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </DndContext>
      </div>

      {/* ── Edit Modal (portal-style, rendered at root level) ── */}
      {editingProduct && (
        <EditModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
