import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileText, Calendar, MapPin, Phone, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  id: number;
  productId: number;
  product?: {
    name: string;
    imageUrl: string;
    category: string;
  };
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  contactPhone: string;
  orderItems: OrderItem[];
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const fetchUserOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Order[]>('/order');
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default: // Pending
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'Completed': return 'Selesai';
      case 'Processing': return 'Diproses';
      case 'Cancelled': return 'Dibatalkan';
      default: return 'Menunggu';
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <FileText className="h-8 w-8 text-emerald-600" />
          Riwayat Belanja
        </h1>
        <button
          onClick={fetchUserOrders}
          disabled={loading}
          className="p-2 text-slate-500 hover:text-emerald-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          title="Refresh Riwayat"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 h-28 rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-rose-100">
          <p className="text-rose-600 font-medium">Gagal memuat transaksi: {error}</p>
          <button
            onClick={fetchUserOrders}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Belum ada transaksi</h2>
          <p className="mt-2 text-sm text-slate-400">Anda belum melakukan pesanan apa pun.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Header */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800">
                        INV/WRG-{order.id.toString().padStart(5, '0')}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(order.orderDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 leading-none">Total Belanja</p>
                      <p className="text-base font-extrabold text-emerald-600 mt-1">
                        {formatRupiah(order.totalAmount)}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>

                {/* Collapsible items */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-5 space-y-4">
                    {/* Delivery details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl border border-slate-100">
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          Alamat Pengiriman
                        </h4>
                        <p className="text-slate-600 text-xs pl-5.5 leading-relaxed">
                          {order.shippingAddress}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <Phone className="h-4 w-4 text-slate-400" />
                          Kontak Pembeli
                        </h4>
                        <p className="text-slate-600 text-xs pl-5.5">
                          {order.contactPhone}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2.5">
                      <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                        Daftar Belanjaan
                      </h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100/50"
                          >
                            <img
                              src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                              alt={item.product?.name || 'Produk'}
                              className="h-12 w-12 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-slate-800 text-sm truncate">
                                {item.product?.name || `Produk ID: ${item.productId}`}
                              </h5>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {item.quantity} x {formatRupiah(item.unitPrice)}
                              </p>
                            </div>
                            <span className="font-bold text-slate-700 text-sm">
                              {formatRupiah(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
