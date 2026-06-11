# WarungKita - Flutter Mobile App

Repositori ini berisi kode frontend mobile berbasis **Flutter** untuk aplikasi **WarungKita** (Toko Warung Sembako). Aplikasi ini ditargetkan untuk pelanggan (Customer) agar dapat menelusuri katalog barang, menambahkan ke keranjang belanja, dan memesan produk harian secara mobile.

---

## 🛠️ Daftar Teknologi Utama
- **Framework**: Flutter (Dart SDK `>=3.0.0 <4.0.0`)
- **State Management**: Provider
- **HTTP Client**: http package (`package:http/http.dart`)
- **Database Lokal**: shared_preferences (untuk menyimpan JWT token secara persisten)
- **Desain & Ikon**: Material Design 3, Google Fonts (Inter)
- **Formatting**: intl package (untuk formatting mata uang Rupiah dan tanggal lokal)

---

## 📐 Arsitektur & Pola Desain (Design Patterns)

Aplikasi mobile ini menggunakan pola **Model-View-Provider** (MVP) untuk pemisahan logika bisnis dari antarmuka pengguna:
- **Models**: Merepresentasikan struktur data terstruktur yang memetakan respon JSON API ke dalam kelas Dart (`User`, `Product`, `Order`, `OrderItem`).
- **Services**: Kelas `api_service.dart` mengelola kueri HTTP terpusat, mengaitkan header JWT, dan mengonfigurasi IP Emulator khusus `10.0.2.2` untuk terhubung dengan server host computer.
- **Providers (State Management)**:
  - `AuthProvider`: Mengendalikan sesi pengguna aktif, melakukan panggilan endpoint login/register, dan mencadangkan data token di penyimpanan lokal (local cache).
  - `ProductProvider`: Meminta data daftar barang ke server berdasarkan kategori tertentu.
  - `CartProvider`: Mengelola daftar barang dalam keranjang belanja lokal di memori dan mengirimkan order checkout ke server API.
- **Views/Screens**: Halaman murni widget UI yang merender status data terbaru dari Provider konsumen.

---

## 🚀 Instruksi Setup & Menjalankan Aplikasi

### Langkah 1: Kebutuhan Awal
- Unduh dan konfigurasi [Flutter SDK](https://docs.flutter.dev/get-started/install).
- Jalankan emulator Android di Android Studio atau hubungkan perangkat HP Android fisik melalui USB debugging.
- Pastikan server backend API telah berjalan di komputer host (default: `http://localhost:5000`).

### Langkah 2: Instal Dependensi Dart
Buka terminal di folder `frontend-mobile/` lalu jalankan perintah:
```bash
flutter pub get
```

### Langkah 3: Jalankan Aplikasi
Jalankan aplikasi di perangkat/emulator yang terhubung dengan perintah:
```bash
flutter run
```

---

## 📦 Instruksi Build & Instalasi APK (Android)

Untuk menghasilkan file installer APK mandiri (`app-release.apk`) yang siap dibagikan dan diinstal di ponsel Android fisik:

### 1. Buat Build APK Release
Jalankan perintah berikut di terminal folder `frontend-mobile/`:
```bash
flutter build apk --release
```
*Tip: Jika Anda ingin memecah file APK agar ukurannya lebih ringan sesuai dengan masing-masing arsitektur perangkat (split per ABI), gunakan perintah berikut:*
```bash
flutter build apk --split-per-abi
```

### 2. Lokasi Output File APK
Setelah proses build selesai, file instalasi APK Anda dapat ditemukan di folder:
`frontend-mobile/build/app/outputs/flutter-apk/app-release.apk`

### 3. Cara Instalasi di Handphone
1. Kirim file `app-release.apk` tersebut ke handphone Android Anda (lewat kabel USB, Google Drive, atau WhatsApp).
2. Buka file manager di handphone, lalu klik file APK tersebut untuk menginstal. 
3. Jika muncul peringatan keamanan, aktifkan opsi *"Izinkan instalasi dari sumber tidak dikenal" (Allow from unknown sources)* di pengaturan handphone Anda.
