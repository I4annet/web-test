import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { ShoppingCart, LogOut, Store, ListOrdered, Shield, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalItems = getTotalItems();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition">
            <Store className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Warung<span className="text-emerald-600 font-extrabold">Kita</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium transition flex items-center gap-1.5">
              <Store className="h-4.5 w-4.5" /> Belanja
            </Link>
            
            {user && (
              <Link to="/orders" className="text-slate-600 hover:text-emerald-600 font-medium transition flex items-center gap-1.5">
                <ListOrdered className="h-4.5 w-4.5" /> Riwayat Belanja
              </Link>
            )}

            {user?.role === 'Admin' && (
              <Link to="/admin" className="text-amber-600 hover:text-amber-700 font-semibold transition flex items-center gap-1.5">
                <Shield className="h-4.5 w-4.5" /> Admin Panel
              </Link>
            )}
          </div>

          {/* Actions & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-slate-700 leading-none">{user.username}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-full transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-emerald-600 font-medium transition px-3 py-1.5 rounded-lg hover:bg-slate-50"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition px-4 py-2 rounded-lg shadow-sm shadow-emerald-200"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-inner">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
          >
            Belanja
          </Link>
          {user && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
            >
              Riwayat Belanja
            </Link>
          )}
          {user?.role === 'Admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-semibold text-amber-600 hover:bg-slate-50"
            >
              Admin Panel
            </Link>
          )}

          {user ? (
            <div className="border-t border-slate-200 pt-3 flex flex-col space-y-2">
              <div className="flex items-center gap-3 px-3 py-1.5">
                <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-700 leading-none">{user.username}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-5 w-5" /> Keluar
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-3 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg text-slate-700 font-medium border border-slate-200 hover:bg-slate-50"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
