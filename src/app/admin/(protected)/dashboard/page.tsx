'use client';

import { useStore } from '@/context/StoreContext';
import { Users, Tags, Package } from 'lucide-react';

export default function AdminDashboardPage() {
  const { categories, products, signIns } = useStore();

  const stats = [
    { title: "Today's Visits", value: signIns, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { title: 'Total Categories', value: categories.length, icon: Tags, color: 'bg-green-100 text-green-600' },
    { title: 'Total Products', value: products.length, icon: Package, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-inter text-gray-900">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-lg ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-inter">{stat.title}</p>
              <p className="text-2xl font-bold font-inter text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
