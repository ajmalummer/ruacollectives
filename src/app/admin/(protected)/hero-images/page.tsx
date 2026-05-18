'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, GripVertical, ImagePlus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableImageCard({
  image,
  onDelete,
}: {
  image: any;
  onDelete: (id: string, path: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm group ${
        isDragging ? 'shadow-xl ring-2 ring-cherry/30' : ''
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="absolute top-2 left-2 p-1.5 bg-black/50 rounded-lg text-white cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(image.id, image.storage_path)}
        className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete image"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <img
        src={image.image_url}
        alt={image.alt_text || 'Hero image'}
        className="w-full object-cover"
        style={{ height: '180px' }}
        draggable={false}
      />

      <div className="p-3">
        <p className="text-xs text-gray-500 font-inter truncate">
          {image.alt_text || <span className="italic text-gray-400">No description</span>}
        </p>
      </div>
    </div>
  );
}

export default function AdminHeroImagesPage() {
  const { heroImages, fetchData } = useStore();
  const [localImages, setLocalImages] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setLocalImages(heroImages);
  }, [heroImages]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== 'image/webp') {
      toast.error('Only WebP images are allowed.');
      e.target.value = '';
      setFile(null);
      setPreview(null);
      return;
    }
    if (selected.size > 500 * 1024) {
      toast.error('Image must be 500 KB or less.');
      e.target.value = '';
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a WebP image.');

    setIsUploading(true);
    const toastId = toast.loading('Uploading hero image...');

    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const storagePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(storagePath);

      const { error: dbError } = await supabase.from('hero_images').insert({
        image_url: urlData.publicUrl,
        storage_path: storagePath,
        alt_text: altText.trim() || null,
        display_order: localImages.length,
      });
      if (dbError) throw dbError;

      toast.success('Hero image uploaded!', { id: toastId });
      setFile(null);
      setAltText('');
      setPreview(null);
      const input = document.getElementById('heroImageInput') as HTMLInputElement;
      if (input) input.value = '';
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Upload failed', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!window.confirm('Delete this hero image?')) return;
    const toastId = toast.loading('Deleting...');
    try {
      // Remove from storage
      if (storagePath) {
        await supabase.storage.from('images').remove([storagePath]);
      }
      const { error } = await supabase.from('hero_images').delete().eq('id', id);
      if (error) throw error;
      toast.success('Image deleted.', { id: toastId });
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete', { id: toastId });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localImages.findIndex((img) => img.id === active.id);
    const newIndex = localImages.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(localImages, oldIndex, newIndex);
    setLocalImages(reordered);

    try {
      await Promise.all(
        reordered.map((img, index) =>
          supabase.from('hero_images').update({ display_order: index }).eq('id', img.id)
        )
      );
      await fetchData();
    } catch (err) {
      console.error('Failed to reorder', err);
      toast.error('Failed to save new order');
      setLocalImages(heroImages);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-inter text-gray-900">Hero Images</h1>
      <p className="text-sm text-gray-500 font-inter -mt-4">
        These images appear in the scrollable carousel on the home page hero section. Drag to reorder.
      </p>

      {/* Upload form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-cherry" />
          Upload New Image
        </h2>
        <form onSubmit={handleUpload} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image <span className="text-gray-400 font-normal">(WebP only, max 500 KB)</span>
            </label>
            <input
              id="heroImageInput"
              type="file"
              accept="image/webp"
              onChange={handleFileChange}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cherry/10 file:text-cherry hover:file:bg-cherry/20"
            />
          </div>

          {preview && (
            <div className="relative w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: '180px' }}>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description / Alt Text <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Store interior view"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading || !file}
            className="bg-cherry text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>

      {/* Image grid */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">
          Current Hero Images{' '}
          <span className="text-sm font-normal text-gray-400 ml-1">({localImages.length})</span>
        </h2>

        {localImages.length === 0 ? (
          <p className="text-sm text-gray-400 italic font-inter">No hero images uploaded yet.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localImages.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {localImages.map((img) => (
                  <SortableImageCard key={img.id} image={img} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
