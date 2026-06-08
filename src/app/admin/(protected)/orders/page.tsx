'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/context/StoreContext';
import { toast } from 'react-hot-toast';
import { Package, Clock, CheckCircle2, ChevronRight, X, ExternalLink, Calendar } from 'lucide-react';
import { Order, OrderItem } from '@/context/StoreContext';

export default function AdminOrdersPage() {
  const { products } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const [{ data: oData, error: oError }, { data: iData, error: iError }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('order_items').select('*')
      ]);

      if (oError) throw oError;
      if (iError) throw iError;

      setOrders(oData || []);
      setOrderItems(iData || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmOrder = async (order: Order) => {
    try {
      const { error } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', order.id);
      if (error) throw error;
      
      toast.success('Order confirmed!');
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'confirmed' } : o));
      
      // WhatsApp notification
      const text = `Hello ${order.full_name}! 👋\n\nGreat news! Your order (ID: ${order.id}) from Thauya for Rs. ${order.total_amount.toFixed(2)} has been confirmed and is now being processed.\n\nThank you for shopping with us!`;
      const waLink = `https://wa.me/${order.whatsapp}?text=${encodeURIComponent(text)}`;
      window.open(waLink, '_blank');

      setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm order');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-inter text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1 font-inter">Manage customer orders and verify payments.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID / Date</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-900 font-semibold">{order.id.split('-')[0]}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-sm text-gray-900">{order.full_name}</div>
                      <div className="text-xs text-gray-500">{order.mobile}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 text-sm">
                      Rs. {order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm font-medium text-cherry hover:text-cherry/80 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                <p className="text-xs text-gray-500 font-mono">ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
              {/* Left Column: Customer & Items */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Customer Info</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedOrder.full_name}</p>
                    <p><span className="font-medium">Mobile:</span> {selectedOrder.mobile}</p>
                    <p><span className="font-medium">WhatsApp:</span> <a href={`https://wa.me/${selectedOrder.whatsapp}`} target="_blank" className="text-cherry hover:underline">{selectedOrder.whatsapp}</a></p>
                    <p><span className="font-medium">Address:</span> {selectedOrder.address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Order Items</h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {orderItems.filter(i => i.order_id === selectedOrder.id).map(item => {
                      const product = products.find(p => p.id === item.product_id);
                      return (
                        <div key={item.id} className="p-4 flex gap-4 bg-white">
                          <img src={product?.image_url || ''} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{product?.title || 'Unknown Product'}</p>
                            <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                          </div>
                          <div className="font-semibold text-sm text-gray-900">
                            Rs. {(item.price_at_time * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                    <div className="p-4 bg-gray-50 flex justify-between items-center font-bold text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-cherry text-lg">Rs. {selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Screenshot */}
              <div className="w-full md:w-72 flex flex-col">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Payment Screenshot</h3>
                <a href={selectedOrder.payment_screenshot_url} target="_blank" className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[3/4] flex-shrink-0 block">
                  <img src={selectedOrder.payment_screenshot_url} alt="Payment" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium flex items-center gap-2"><ExternalLink className="w-4 h-4" /> View Full</span>
                  </div>
                </a>

                {selectedOrder.status === 'pending' ? (
                  <button 
                    onClick={() => handleConfirmOrder(selectedOrder)}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm & Notify Customer
                  </button>
                ) : (
                  <div className="mt-6 bg-green-50 text-green-700 font-medium py-3 rounded-xl text-center flex items-center justify-center gap-2 border border-green-200">
                    <CheckCircle2 className="w-5 h-5" /> Order Confirmed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
