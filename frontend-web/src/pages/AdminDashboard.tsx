import React, { useEffect, useState } from 'react';
import { useProductStore } from '../stores/productStore';
import type { Product } from '../stores/productStore';
import { api } from '../services/api';
import { Shield, PackagePlus, Edit2, Trash2, ChevronDown, ChevronUp, Clock, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';

interface AdminOrderItem {
  id: number;
  productId: number;
  product?: {
    name: string;
  };
  quantity: number;
  unitPrice: number;
}

interface AdminOrder {
  id: number;
  userId: number;
  user?: {
    username: string;
    email: string;
  };
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  contactPhone: string;
  orderItems: AdminOrderItem[];
}

export const AdminDashboard: React.FC = () => {
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct, loading: productLoading } = useProductStore();
  
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Form states for creating/editing product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('Bahan Pokok');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await api.get<AdminOrder[]>('/order');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormPrice(0);
    setFormStock(0);
    setFormImageUrl('');
    setFormCategory('Bahan Pokok');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description);
    setFormPrice(product.price);
    setFormStock(product.stock);
    setFormImageUrl(product.imageUrl);
    setFormCategory(product.category);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formCategory || formPrice <= 0 || formStock < 0) {
      setFormError('Mohon isi semua kolom dengan benar.');
      return;
    }

    const payload = {
      name: formName,
      description: formDescription,
      price: formPrice,
      stock: formStock,
      imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      category: formCategory,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
        setFormError('Sesi Anda telah berakhir atau Anda tidak memiliki hak akses Admin. Silakan login ulang.');
      } else {
        setFormError(err.message);
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await deleteProduct(id);
      } catch (err: any) {
        alert(`Gagal menghapus produk: ${err.message}`);
      }
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/order/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      alert(`Gagal mengupdate status: ${err.message}`);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'Cancelled': return <AlertTriangle className="h-4 w-4 text-rose-600" />;
      default: return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Shield className="h-8 w-8 text-amber-500" />
            Panel Administrator
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kelola ketersediaan produk dan proses pemesanan warung.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { fetchProducts(); fetchOrders(); }}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Segarkan Data
          </button>
          {activeTab === 'products' && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-emerald-200 cursor-pointer"
            >
              <PackagePlus className="h-4.5 w-4.5" /> Tambah Produk
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'products' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Produk ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'orders' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Pesanan ({orders.length})
        </button>
      </div>

      {/* Product Tab Panel */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          {productLoading ? (
            <div className="p-8 text-center text-slate-400">Loading produk...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Tidak ada data produk.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Info Produk</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Harga</th>
                    <th className="p-4">Stok</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="h-10 w-10 object-cover rounded-lg bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{prod.name}</p>
                            <p className="text-xs text-slate-400 truncate max-w-xs">{prod.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">{formatRupiah(prod.price)}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${prod.stock <= 0 ? 'text-rose-600 font-bold' : prod.stock < 10 ? 'text-amber-500' : 'text-slate-600'}`}>
                          {prod.stock <= 0 ? 'Habis' : prod.stock}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab Panel */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="p-8 text-center text-slate-400">Loading pesanan...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white border border-slate-100 rounded-2xl">Tidak ada riwayat pesanan.</div>
          ) : (
            orders.map((ord) => {
              const isExpanded = expandedOrderId === ord.id;

              return (
                <div key={ord.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                    className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-800">INV/WRG-{ord.id}</span>
                        <span className="text-xs text-slate-500 font-medium">oleh {ord.user?.username || `User ID: ${ord.userId}`}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(ord.orderDate).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-6" onClick={(e) => e.stopPropagation()}>
                      {/* Price */}
                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-400">Total Harga</p>
                        <p className="text-base font-extrabold text-emerald-600">{formatRupiah(ord.totalAmount)}</p>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 border border-slate-200 rounded-xl">
                        {getOrderStatusIcon(ord.status)}
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-700 outline-none border-0 pr-6"
                        >
                          <option value="Pending">Menunggu</option>
                          <option value="Processing">Diproses</option>
                          <option value="Completed">Selesai</option>
                          <option value="Cancelled">Dibatalkan</option>
                        </select>
                      </div>

                      {/* Expand Toggle */}
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer hidden md:block"
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/40 p-5 space-y-4">
                      {/* User contacts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat Pengiriman</p>
                          <p className="text-slate-700 text-xs">{ord.shippingAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor WhatsApp / HP</p>
                          <p className="text-slate-700 text-xs">{ord.contactPhone}</p>
                        </div>
                      </div>

                      {/* Items table */}
                      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px]">
                              <th className="p-3">Nama Produk</th>
                              <th className="p-3">Harga Satuan</th>
                              <th className="p-3 text-center">Jumlah</th>
                              <th className="p-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600">
                            {ord.orderItems.map((item) => (
                              <tr key={item.id}>
                                <td className="p-3 font-semibold text-slate-800">{item.product?.name || `Produk ID: ${item.productId}`}</td>
                                <td className="p-3">{formatRupiah(item.unitPrice)}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right font-bold text-slate-700">{formatRupiah(item.unitPrice * item.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CRUD Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-700 border border-rose-100">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Beras Pandan Wangi 5kg"
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-950 text-sm focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan mengenai keunggulan produk..."
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-950 text-sm focus:border-emerald-500 outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formPrice || ''}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    placeholder="75000"
                    className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-950 text-sm focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    value={formStock || ''}
                    onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                    placeholder="10"
                    className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-950 text-sm focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-950 text-sm focus:border-emerald-500 outline-none bg-white transition"
                  >
                    <option value="Bahan Pokok">Bahan Pokok</option>
                    <option value="Makanan Instan">Makanan Instan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Bumbu Dapur">Bumbu Dapur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-950 text-sm focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-emerald-250"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
