import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { Trash2, ShoppingBag, Plus, Minus, ArrowLeft, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, checkout, getTotalPrice, loading, error, clearError } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalPrice = getTotalPrice();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Customer') {
      setValidationError('Hanya akun dengan peran Customer yang dapat melakukan pembelian.');
      return;
    }

    if (!address.trim() || !phone.trim()) {
      setValidationError('Alamat pengiriman dan nomor telepon wajib diisi.');
      return;
    }

    try {
      await checkout(address, phone);
      setSuccess(true);
    } catch (err) {
      // Handled by store error
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Pesanan Berhasil!</h2>
        <p className="mt-4 text-slate-500">
          Terima kasih telah berbelanja di WarungKita. Pesanan Anda sedang diproses oleh admin.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/orders"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Lihat Transaksi
          </Link>
          <Link
            to="/"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-250"
          >
            Belanja Lagi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-2.5">
        <ShoppingBag className="h-8 w-8 text-emerald-600" />
        Keranjang Belanja
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-150 text-slate-400 mb-6">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-700">Keranjang belanja Anda kosong</h2>
          <p className="mt-2 text-sm text-slate-400">Temukan barang-barang menarik di toko kami.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-200"
          >
            <ArrowLeft className="h-4 w-4" /> Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow transition"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-20 w-20 rounded-xl object-cover bg-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {item.product.category}
                  </span>
                  <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate mt-1">
                    {item.product.name}
                  </h3>
                  <p className="text-sm font-bold text-emerald-600 mt-1">
                    {formatRupiah(item.product.price)}
                  </p>
                </div>

                {/* Counter */}
                <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50 gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 hover:bg-white rounded-lg transition text-slate-500"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold text-slate-800 px-1 w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 hover:bg-white rounded-lg transition text-slate-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout & Summary Form */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
                Ringkasan Belanja
              </h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Total Produk</span>
                  <span className="font-semibold text-slate-800">
                    {items.reduce((total, i) => total + i.quantity, 0)} Barang
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ongkos Kirim</span>
                  <span className="font-semibold text-emerald-600">Gratis Ongkir</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                  <span>Total Harga</span>
                  <span>{formatRupiah(totalPrice)}</span>
                </div>
              </div>

              {/* Checkout fields */}
              <form onSubmit={handleCheckout} className="space-y-4">
                {(!user) ? (
                  <Link
                    to="/login"
                    className="w-full text-center block rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-md"
                  >
                    Masuk untuk Checkout
                  </Link>
                ) : (
                  <>
                    {(error || validationError) && (
                      <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-100">
                        <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                        <span>{validationError || error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Nomor WhatsApp / HP
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="contoh: 08123456789"
                        className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Alamat Lengkap Pengiriman
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan"
                        className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative flex justify-center items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-250 cursor-pointer disabled:opacity-75"
                    >
                      {loading ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4.5 w-4.5" />
                          <span>Pesan Sekarang</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
