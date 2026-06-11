# WarungKita - React Web Frontend

Repositori ini berisi kode frontend web untuk aplikasi **WarungKita** (Toko Warung Sembako). Tampilan didesain responsif untuk desktop dan tablet, serta mengadopsi antarmuka modern premium berbasis warna emerald/teal untuk merepresentasikan produk segar harian.

---

## 🛠️ Daftar Teknologi Utama
- **Framework/Library**: React (Vite + TypeScript)
- **Styling**: TailwindCSS (v4.0 dengan integrasi `@tailwindcss/postcss`)
- **State Management**: Zustand
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Fetch API
- **Icons**: Lucide React

---

## 📐 Arsitektur & Pola Desain (Design Patterns)

Aplikasi web ini menggunakan pola **Component-Driven Development** dengan struktur modular:
- **`src/services/api.ts`**: Wrapper fetch terpusat yang otomatis menyisipkan otorisasi token `Bearer` dari LocalStorage dan memetakan error respon dari backend secara robust.
- **`src/stores/`**: Menggunakan **Zustand** untuk manajemen state global yang terbagi berdasarkan fungsinya:
  - `authStore`: Mengelola otentikasi user, register, logout, serta memvalidasi token aktif ke API.
  - `productStore`: Mengelola data katalog produk, filter kategori, serta aksi tulis admin (tambah, ubah, hapus produk).
  - `cartStore`: Mengelola keranjang belanja lokal di memori, penyesuaian jumlah unit belanja dengan stok tersedia, serta integrasi checkout.
- **Route Guards**:
  - `ProtectedRoute`: Melindungi halaman riwayat belanja dari akses tamu tak berizin.
  - `AdminRoute`: Melindungi halaman admin panel khusus untuk pengguna dengan role `Admin`.

---

## 🚀 Instruksi Setup & Menjalankan Aplikasi

### Langkah 1: Kebutuhan Awal
- Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan) dan npm.
- Pastikan backend API sudah menyala di alamat `http://localhost:5000/api` (jika berbeda, atur variabel lingkungan `.env` atau `VITE_API_URL`).

### Langkah 2: Instal Dependensi
Buka terminal di folder `frontend-web/` dan jalankan perintah:
```bash
npm install
```

### Langkah 3: Jalankan Server Development
Jalankan perintah berikut untuk mengaktifkan hot-reloading server lokal:
```bash
npm run dev
```
Buka browser di alamat yang ditunjukkan di terminal (biasanya `http://localhost:5173`).

### Langkah 4: Build Produksi
Untuk melakukan build aset produksi statis yang teroptimasi:
```bash
npm run build
```
Hasil build siap pakai akan disimpan pada direktori `frontend-web/dist/`.

---

## 🌐 Akses Deployment & Hosting Publik

- **URL Lokal**: `http://localhost:5173`
- **Deployment ke Hosting Publik**:
  Aplikasi React statis ini sangat mudah di-host di layanan gratis seperti **Vercel, Netlify, Firebase Hosting, atau GitHub Pages**:
  - **Vercel/Netlify**: Cukup hubungkan repositori Git Anda, pilih framework preset `Vite`, isi build command `npm run build`, dan output directory `dist`.
  - Tambahkan Environment Variable `VITE_API_URL` yang mengarah ke alamat backend API produksi Anda.
- **Akun Percobaan (Seed Data):**
  - **Admin Akun**: Username: `admin` | Password: `admin123` (Akses ke Admin Panel)
  - **Customer Akun**: Username: `budi` | Password: `customer123` (Belanja & Checkout)
