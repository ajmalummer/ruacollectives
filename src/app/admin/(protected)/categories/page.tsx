'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCategoryRow({ category, onEdit, onDelete }: { category: any, onEdit: any, onDelete: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, position: isDragging ? 'relative' as const : undefined };

  return (
    <tr ref={setNodeRef} style={style} className={`bg-white ${isDragging ? 'shadow-lg border border-cherry/20 z-10' : ''}`}>
      <td className="px-6 py-4 w-10">
        <button type="button" className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="px-6 py-4"><img src={category.image_url} alt={category.title} className="w-12 h-12 rounded object-cover" /></td>
      <td className="px-6 py-4 font-medium">{category.title}</td>
      <td className="px-6 py-4 text-right">
        <button onClick={() => onEdit(category)} className="text-gray-400 hover:text-cherry mr-3 transition-colors" title="Edit">
          <Pencil className="w-5 h-5 inline" />
        </button>
        <button onClick={() => onDelete(category.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
          <Trash2 className="w-5 h-5 inline" />
        </button>
      </td>
    </tr>
  );
}

export default function AdminCategoriesPage() {
  const { categories, fetchData } = useStore();
  const [localCategories, setLocalCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resetForm = () => {
    setTitle('');
    setFile(null);
    setEditingId(null);
    const fileInput = document.getElementById('categoryImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== 'image/webp') {
      toast.error('Only WebP images are allowed.');
      e.target.value = '';
      return;
    }
    if (selected.size > 500 * 1024) {
      toast.error('Image size must be 500KB or less.');
      e.target.value = '';
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error('Please enter a title');
    if (!editingId && !file) return toast.error('Please select an image for the new category');

    setIsUploading(true);
    const toastId = toast.loading(editingId ? 'Updating category...' : 'Adding category...');

    try {
      let imageUrl = undefined;
      if (file) {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(`categories/${fileName}`, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(`categories/${fileName}`);
        imageUrl = publicUrlData.publicUrl;
      }

      if (editingId) {
        const updateData: any = { title };
        if (imageUrl) updateData.image_url = imageUrl;
        const { error: dbError } = await supabase.from('categories').update(updateData).eq('id', editingId);
        if (dbError) throw dbError;
        toast.success('Category updated successfully!', { id: toastId });
      } else {
        const { error: dbError } = await supabase.from('categories').insert({ title, display_order: localCategories.length, image_url: imageUrl });
        if (dbError) throw dbError;
        toast.success('Category added successfully!', { id: toastId });
      }

      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save category', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated products may be affected.')) return;
    const toastId = toast.loading('Deleting category...');
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category deleted successfully!', { id: toastId });
      if (editingId === id) resetForm();
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete category', { id: toastId });
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setTitle(category.title);
    setFile(null);
    const fileInput = document.getElementById('categoryImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localCategories.findIndex(c => c.id === active.id);
    const newIndex = localCategories.findIndex(c => c.id === over.id);
    const reordered = arrayMove(localCategories, oldIndex, newIndex);
    setLocalCategories(reordered);

    try {
      await Promise.all(reordered.map((cat, index) => supabase.from('categories').update({ display_order: index }).eq('id', cat.id)));
      await fetchData();
    } catch (err) {
      console.error('Failed to update order', err);
      toast.error('Failed to save new order');
      setLocalCategories(categories);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-inter text-gray-900">Manage Categories</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image (WebP, max 500KB) {editingId && <span className="text-gray-400 font-normal ml-1">(Optional)</span>}
            </label>
            <input id="categoryImage" required={!editingId} type="file" accept="image/webp" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cherry/10 file:text-cherry hover:file:bg-cherry/20" />
          </div>
          <div className="flex gap-3">
            <button disabled={isUploading} type="submit" className="bg-cherry text-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
              {isUploading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Category' : 'Add Category')}
            </button>
            {editingId && (
              <button disabled={isUploading} type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 w-10"></th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Image</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Title</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 relative">
                <SortableContext items={localCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {localCategories.map(cat => (
                    <SortableCategoryRow key={cat.id} category={cat} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </SortableContext>
                {localCategories.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No categories found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
