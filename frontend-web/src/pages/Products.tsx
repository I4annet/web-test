import React, { useEffect, useState } from 'react';
import { useProductStore } from '../stores/productStore';
import type { Product } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { Search, Plus, Check } from 'lucide-react';

const CATEGORIES = ['Semua', 'Bahan Pokok', 'Makanan Instan', 'Minuman', 'Bumbu Dapur'];

export const Products: React.FC = () => {
  const { products, fetchProducts, loading } = useProductStore();
  const { addItem } = useCartStore();
  
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemIds, setAddedItemIds] = useState<number[]>([]);

  useEffect(() => {
    const categoryQuery = selectedCategory === 'Semua' ? undefined : selectedCategory;
    fetchProducts(categoryQuery);
  }, [selectedCategory, fetchProducts]);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    
    // Quick micro-animation feedback
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 1000);
  };

  // Local filter for search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format currency helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Banner / Hero Section */}
      <div className="mb-10 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-lg shadow-emerald-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Kebutuhan Harian Lengkap</h1>
          <p className="mt-2 text-emerald-100 max-w-md">Belanja bahan pokok, minuman, dan bumbu dapur praktis di WarungKita dengan harga bersahabat.</p>
        </div>
        <div className="w-full max-w-sm relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kebutuhan Anda..."
            className="w-full rounded-2xl bg-white/95 backdrop-blur-sm border-0 py-3.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-400 outline-none text-sm transition"
          />
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div className="mb-8 flex flex-wrap gap-2.5 overflow-x-auto pb-2 border-b border-slate-100">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl p-4 space-y-4">
              <div className="bg-slate-200 rounded-xl h-44 w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                <div className="h-8 bg-slate-200 rounded-full w-8"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400 font-medium">Tidak ada produk ditemukan.</p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((prod) => {
            const isAdded = addedItemIds.includes(prod.id);
            const isOutOfStock = prod.stock <= 0;

            return (
              <div
                key={prod.id}
                className="group relative flex flex-col bg-white border border-slate-100 hover:border-emerald-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  <img
                    src={prod.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                    alt={prod.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/90 backdrop-blur-sm rounded-full">
                    {prod.category}
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold text-slate-800 text-sm sm:text-base line-clamp-1 mb-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 flex-1 mb-3">
                    {prod.description}
                  </p>

                  <div className="flex items-center gap-1.5 mb-4">
                    <div className={`h-2 w-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : prod.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <span className="text-xs font-semibold text-slate-500">
                      {isOutOfStock ? 'Stok Habis' : `Stok: ${prod.stock}`}
                    </span>
                  </div>

                  {/* Pricing and Cart Actions */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-base sm:text-lg font-extrabold text-slate-900">
                      {formatRupiah(prod.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(prod)}
                      disabled={isOutOfStock}
                      className={`p-2 sm:p-2.5 rounded-xl transition cursor-pointer shadow-sm ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white shadow-emerald-100'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
