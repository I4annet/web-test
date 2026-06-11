# WarungKita - Sistem Aplikasi Toko Warung Sembako

WarungKita adalah sistem aplikasi toko warung sembako terintegrasi yang terdiri dari tiga komponen utama:
1. **Backend RESTful API**: Dibangun dengan ASP.NET Core & PostgreSQL. [Pelajari Selengkapnya di backend/README.md](file:///d:/github%20matkul/web-shop/backend/README.md).
2. **Frontend Web**: Dibuat dengan React (Vite + TS) & TailwindCSS. [Pelajari Selengkapnya di frontend-web/README.md](file:///d:/github%20matkul/web-shop/frontend-web/README.md).
3. **Frontend Mobile**: Dikembangkan dengan Flutter. [Pelajari Selengkapnya di frontend-mobile/README.md](file:///d:/github%20matkul/web-shop/frontend-mobile/README.md).

---

## 🛠️ Daftar Teknologi Utama
- **Backend API**: ASP.NET Core (.NET 8.0 LTS), PostgreSQL Database, Dapper (Raw SQL), Entity Framework Core (ORM), JWT Bearer Security, Serilog.
- **Frontend Web**: React (Vite + TypeScript), Zustand (State Store), React Router DOM (Routing), TailwindCSS (v4 UI Layout), Lucide Icons.
- **Frontend Mobile**: Flutter (Dart SDK `>=3.0.0`), Provider (State Notifier), http package (API Client), shared_preferences (Local Cache), intl localization.

---

## 📐 Arsitektur Sistem & Pola Desain
Sistem ini menggunakan arsitektur **Distributed Client-Server** dengan RESTful API sebagai jembatan komunikasi data terenkripsi:
- **Backend API**: Menggunakan arsitektur berlapis (Domain Models, DTO, Repository, Service, Controllers) dengan pola **Hybrid Repository**. Query GET/READ dibaca langsung menggunakan kueri Raw SQL Dapper untuk performa kueri yang instan, sedangkan transaksi tulis (Sign Up & Checkout) diproses secara terintegrasi oleh EF Core. JWT token bertindak sebagai otorisasi statis untuk membatasi endpoint sensitif.
- **Frontend Web**: Menerapkan arsitektur komponen React yang modular. State global dikendalikan secara reaktif menggunakan Zustand store terpisah (auth, product, cart) untuk performa render optimal.
- **Frontend Mobile**: Menerapkan pola **Model-View-Provider** (MVP). Flutter Provider bertindak sebagai pengelola state reaktif yang memperbarui widget UI secara langsung saat ada perubahan data di API.

---

## 🚀 Panduan Ringkas Setup & Menjalankan Aplikasi

Instruksi penginstalan terperinci tersedia di masing-masing folder komponen:

1. **Database & API** ([backend/README.md](file:///d:/github%20matkul/web-shop/backend/README.md)):
   - Buat database PostgreSQL lokal bernama `WarungDb` dan jalankan script SQL di [backend/DbSchema.sql](file:///d:/github%20matkul/web-shop/backend/DbSchema.sql).
   - Jalankan API di folder `backend/` dengan perintah:
     ```bash
     dotnet restore
     dotnet run
     ```
   - Akses dokumentasi Swagger di browser pada `http://localhost:5000/`.

2. **Frontend Web** ([frontend-web/README.md](file:///d:/github%20matkul/web-shop/frontend-web/README.md)):
   - Jalankan web development server di folder `frontend-web/` dengan perintah:
     ```bash
     npm install
     npm run dev
     ```
   - Akses aplikasi di browser pada `http://localhost:5173`.

3. **Frontend Mobile** ([frontend-mobile/README.md](file:///d:/github%20matkul/web-shop/frontend-mobile/README.md)):
   - Jalankan aplikasi Flutter di folder `frontend-mobile/` dengan perintah:
     ```bash
     flutter pub get
     flutter run
     ```

---

## 🌐 Panduan Deployment Publik

Berikut adalah konfigurasi dan instruksi lengkap untuk merilis aplikasi WarungKita ke server produksi/publik agar dapat diakses dari mana saja.

### 🗄️ A. Deployment Backend API & Database (Render.com)

[Render.com](https://render.com) menyediakan hosting gratis untuk PostgreSQL Database dan Web Service dengan dukungan Dockerfile yang telah kami sediakan di dalam folder `backend/`.

#### Langkah 1: Buat Database PostgreSQL di Render
1. Masuk ke dashboard Render Anda, lalu klik **New > PostgreSQL**.
2. Beri nama database `WarungDb` dan pilih region terdekat (misalnya Singapore).
3. Setelah database aktif, salin **Internal Database URL** (untuk dihubungkan dengan Web Service) atau **External Database URL** (untuk koneksi dari luar/alat database manager).

#### Langkah 2: Deploy C# Web Service
1. Unggah seluruh folder proyek Anda (`web-shop/`) ke repositori GitHub pribadi/publik Anda.
2. Di dashboard Render, klik **New > Web Service**.
3. Hubungkan repositori GitHub Anda.
4. Tentukan konfigurasi berikut:
   - **Root Directory**: `backend` (Sangat penting agar Render mendeteksi API)
   - **Runtime**: `Docker` (Render akan otomatis membaca file `backend/Dockerfile` yang sudah kami sediakan)
5. Klik **Advanced** dan tambahkan **Environment Variables** berikut:
   - `ConnectionStrings__DefaultConnection`: *[Tempel tautan Internal Database URL dari PostgreSQL Render Anda]*
   - `ASPNETCORE_ENVIRONMENT`: `Production`
   - `Jwt__Key`: *[Masukkan string acak rahasia sepanjang minimal 32 karakter]*
   - `Jwt__Issuer`: `WarungApi`
   - `Jwt__Audience`: `WarungWebAndMobile`
6. Klik **Create Web Service**. Render akan men-download file Docker, men-compile Web API, dan menyalakannya secara publik (Anda akan menerima link HTTPS seperti `https://warung-api.onrender.com`).

---

### 💻 B. Deployment Web Frontend (Vite & React) (Vercel atau Netlify)

Aset statis React dirancang untuk dirilis ke platform serverless seperti **Vercel** atau **Netlify** secara gratis. Kami telah menyertakan berkas [vercel.json](file:///d:/github%20matkul/web-shop/frontend-web/vercel.json) dan [public/_redirects](file:///d:/github%20matkul/web-shop/frontend-web/public/_redirects) untuk menjamin routing SPA (Single Page Application) tetap aman saat di-refresh.

#### Pilihan 1: Deploy ke Vercel (Direkomendasikan)
1. Masuk ke dashboard [Vercel](https://vercel.com).
2. Klik **Add New > Project**, lalu hubungkan repositori GitHub Anda.
3. Tentukan konfigurasi berikut:
   - **Root Directory**: `frontend-web`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Di bagian **Environment Variables**, tambahkan:
   - `VITE_API_URL`: *[Masukkan tautan HTTPS Backend API publik Anda (contoh: https://warung-api.onrender.com/api)]*
5. Klik **Deploy**. Vercel akan memproses build dan memberikan tautan domain HTTPS gratis (contoh: `https://warung-kita.vercel.app`).

#### Pilihan 2: Deploy ke Netlify
1. Masuk ke dashboard [Netlify](https://netlify.com).
2. Pilih **Import from Git** dan hubungkan repositori GitHub Anda.
3. Atur base directory ke `frontend-web`, build command ke `npm run build`, dan publish directory ke `frontend-web/dist`.
4. Tambahkan environment variable `VITE_API_URL` dengan URL backend Anda.
5. Klik **Deploy site**.

---

### 📱 C. Distribusi Aplikasi Mobile (Flutter APK)

Karena aplikasi mobile berbasis Android disebarkan melalui berkas instalasi:
1. Masuk ke direktori `frontend-mobile/` di terminal komputer lokal Anda.
2. Jalankan perintah kompilasi:
   ```bash
   flutter build apk --release
   ```
3. Unduh berkas APK hasil kompilasi dari direktori:
   `frontend-mobile/build/app/outputs/flutter-apk/app-release.apk`
4. Unggah berkas APK ini ke layanan penyimpanan cloud (seperti Google Drive atau Dropbox) dan bagikan link unduhannya kepada calon pengguna, atau kirimkan file tersebut langsung ke perangkat seluler via WhatsApp Web untuk segera diinstal.
