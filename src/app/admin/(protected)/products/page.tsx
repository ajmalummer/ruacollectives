'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function StockBadge({ stock }: { stock: number | null | undefined }) {
  if (stock === null || stock === undefined) {
    return <span className="text-xs text-gray-400 font-inter">Unlimited</span>;
  }
  if (stock === 0) {
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>;
  }
  if (stock === 1) {
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">⚠ 1 — Low!</span>;
  }
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{stock}</span>;
}

function SortableProductRow({ product, categoryName, onEdit, onDelete }: { product: any, categoryName: string, onEdit: any, onDelete: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, position: isDragging ? 'relative' as const : undefined };

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
      <td className="px-6 py-4"><img src={product.image_url} alt={product.title} className="w-12 h-12 rounded object-cover" /></td>
      <td className="px-6 py-4 font-medium">{product.title}</td>
      <td className="px-6 py-4 text-gray-500">{categoryName}</td>
      <td className="px-6 py-4 text-gray-500">Rs. {product.price.toFixed(2)}</td>
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

export default function AdminProductsPage() {
  const { products, categories, fetchData } = useStore();
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setCategoryId('');
    setStock('');
    setFile(null);
    setEditingId(null);
    const fileInput = document.getElementById('productImage') as HTMLInputElement;
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
    if (!title || !price || !categoryId) return toast.error('Please fill required fields');
    if (!editingId && !file) return toast.error('Please select an image for the new product');

    setIsUploading(true);
    const toastId = toast.loading(editingId ? 'Updating product...' : 'Adding product...');

    try {
      let imageUrl = undefined;
      if (file) {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(`products/${fileName}`, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(`products/${fileName}`);
        imageUrl = publicUrlData.publicUrl;
      }

      // stock: empty string → null (unlimited), otherwise parse as integer
      const stockValue = stock.trim() === '' ? null : parseInt(stock, 10);

      if (editingId) {
        const updateData: any = { title, price: parseFloat(price), category_id: categoryId, stock: stockValue };
        if (imageUrl) updateData.image_url = imageUrl;
        const { error: dbError } = await supabase.from('products').update(updateData).eq('id', editingId);
        if (dbError) throw dbError;
        toast.success('Product updated successfully!', { id: toastId });
      } else {
        const { error: dbError } = await supabase.from('products').insert({
          title, price: parseFloat(price), category_id: categoryId, display_order: localProducts.length, image_url: imageUrl, stock: stockValue
        });
        if (dbError) throw dbError;
        toast.success('Product added successfully!', { id: toastId });
      }

      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save product', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const toastId = toast.loading('Deleting product...');
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted successfully!', { id: toastId });
      if (editingId === id) resetForm();
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete product', { id: toastId });
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price.toString());
    setCategoryId(product.category_id);
    setStock(product.stock !== null && product.stock !== undefined ? product.stock.toString() : '');
    setFile(null);
    const fileInput = document.getElementById('productImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      await Promise.all(reordered.map((prod, index) => supabase.from('products').update({ display_order: index }).eq('id', prod.id)));
      await fetchData();
    } catch (err) {
      console.error('Failed to update order', err);
      toast.error('Failed to save new order');
      setLocalProducts(products);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-inter text-gray-900">Manage Products</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry bg-white">
                <option value="" disabled>Select category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-gray-400 font-normal">(blank = unlimited)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-cherry"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image (WebP, max 500KB) {editingId && <span className="text-gray-400 font-normal ml-1">(Optional)</span>}
            </label>
            <input id="productImage" required={!editingId} type="file" accept="image/webp" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cherry/10 file:text-cherry hover:file:bg-cherry/20" />
          </div>
          <div className="flex gap-3">
            <button disabled={isUploading} type="submit" className="bg-cherry text-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
              {isUploading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Product' : 'Add Product')}
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
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 w-10"></th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Image</th>
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
                      onEdit={handleEdit}
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
    </div>
  );
}
