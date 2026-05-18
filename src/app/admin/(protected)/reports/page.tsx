'use client';

import { useStore } from '@/context/StoreContext';
import { Package, Tags, AlertTriangle, XCircle, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminReportsPage() {
  const { products, categories } = useStore();

  // ── Derived metrics ──
  const outOfStock = products.filter(p => p.stock === 0);
  const lowStock = products.filter(p => p.stock === 1);
  const totalStock = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);

  // Category breakdown
  const categoryStats = categories.map(cat => {
    const catProducts = products.filter(p => p.category_id === cat.id);
    const prices = catProducts.map(p => p.price);
    const stocks = catProducts.map(p => p.stock);
    const totalCatStock = stocks.reduce((s: number, v) => s + (v ?? 0), 0);
    const unlimitedCount = stocks.filter(v => v === null).length;
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    return {
      id: cat.id,
      title: cat.title,
      count: catProducts.length,
      totalStock: totalCatStock,
      unlimitedCount,
      avgPrice,
      minPrice,
      maxPrice,
      outOfStock: catProducts.filter(p => p.stock === 0).length,
      lowStock: catProducts.filter(p => p.stock === 1).length,
    };
  }).sort((a, b) => b.count - a.count);

  const alertProducts = products
    .filter(p => p.stock !== null && p.stock !== undefined && p.stock <= 1)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

  const statCards = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Categories',
      value: categories.length,
      icon: Tags,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Low Stock (= 1)',
      value: lowStock.length,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Out of Stock',
      value: outOfStock.length,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-inter text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1 font-inter">
          Overview of your catalogue, stock levels and pricing.
        </p>
      </div>

      {/* ── Overview cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-inter">{card.label}</p>
              <p className="text-2xl font-bold font-inter text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stock Alerts ── */}
      {alertProducts.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-800">
              Stock Alerts
              <span className="ml-2 text-sm font-normal text-gray-400">({alertProducts.length} products need attention)</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-amber-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alertProducts.map(p => {
                  const cat = categories.find(c => c.id === p.category_id);
                  return (
                    <tr key={p.id} className="bg-white">
                      <td className="px-6 py-3 flex items-center gap-3">
                        <img src={p.image_url} alt={p.title} className="w-9 h-9 rounded object-cover" />
                        <span className="font-medium text-sm text-gray-800">{p.title}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{cat?.title ?? '—'}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">Rs. {p.price.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        {p.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Out of Stock</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">⚠ Only 1 left</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Category Breakdown ── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-800">Category Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Products</th>
                <th className="px-6 py-3">Total Stock</th>
                <th className="px-6 py-3">Avg Price</th>
                <th className="px-6 py-3">Price Range</th>
                <th className="px-6 py-3">⚠ Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categoryStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-400 text-sm">No categories yet.</td>
                </tr>
              )}
              {categoryStats.map(cat => (
                <tr key={cat.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{cat.title}</td>
                  <td className="px-6 py-4 text-gray-600">{cat.count}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {cat.count === 0 ? '—' : (
                      <span>
                        {cat.totalStock}
                        {cat.unlimitedCount > 0 && (
                          <span className="text-xs text-gray-400 ml-1">
                            + {cat.unlimitedCount} unlimited
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {cat.count === 0 ? '—' : `Rs. ${cat.avgPrice.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {cat.count === 0 ? '—' : `Rs. ${cat.minPrice.toFixed(2)} – Rs. ${cat.maxPrice.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {cat.outOfStock > 0 && (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          {cat.outOfStock} out
                        </span>
                      )}
                      {cat.lowStock > 0 && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {cat.lowStock} low
                        </span>
                      )}
                      {cat.outOfStock === 0 && cat.lowStock === 0 && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── All Products Table ── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-800">
            All Products
            <span className="ml-2 text-sm font-normal text-gray-400">({products.length})</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[650px]">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-400 text-sm">No products yet.</td>
                </tr>
              )}
              {products.map(p => {
                const cat = categories.find(c => c.id === p.category_id);
                const stockLabel =
                  p.stock === null || p.stock === undefined
                    ? <span className="text-xs text-gray-400">Unlimited</span>
                    : p.stock === 0
                    ? <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                    : p.stock === 1
                    ? <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">⚠ 1 left</span>
                    : <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{p.stock}</span>;
                return (
                  <tr key={p.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 flex items-center gap-3">
                      <img src={p.image_url} alt={p.title} className="w-9 h-9 rounded object-cover" />
                      <span className="font-medium text-sm text-gray-800">{p.title}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{cat?.title ?? '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">Rs. {p.price.toFixed(2)}</td>
                    <td className="px-6 py-3">{stockLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
