import { create } from 'zustand';
import { api } from '../services/api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  createdAt: string;
}

interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  fetchProducts: (category?: string) => Promise<void>;
  fetchProduct: (id: number) => Promise<void>;
  createProduct: (data: any) => Promise<Product>;
  updateProduct: (id: number, data: any) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  product: null,
  loading: false,
  error: null,

  fetchProducts: async (category) => {
    set({ loading: true, error: null });
    try {
      const endpoint = category ? `/product?category=${encodeURIComponent(category)}` : '/product';
      const products = await api.get<Product[]>(endpoint);
      set({ products, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchProduct: async (id) => {
    set({ loading: true, error: null, product: null });
    try {
      const product = await api.get<Product>(`/product/${id}`);
      set({ product, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createProduct: async (data) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await api.post<Product>('/product', data);
      set((state) => ({
        products: [newProduct, ...state.products],
        loading: false,
      }));
      return newProduct;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateProduct: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await api.put<Product>(`/product/${id}`, data);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        loading: false,
      }));
      return updatedProduct;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/product/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
