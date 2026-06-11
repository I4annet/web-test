import React from 'react';
import { Store } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-white">
            <Store className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-lg tracking-tight">
              Warung<span className="text-emerald-400 font-extrabold">Kita</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} WarungKita. Menyediakan kebutuhan harian Anda.
          </p>
        </div>
      </div>
    </footer>
  );
};
