# WarungKita - Backend Web API

Repositori ini berisi backend RESTful API untuk aplikasi **WarungKita** (Toko Warung Sembako). API ini mengelola registrasi, login, otentikasi role, pengelolaan data barang (produk), serta pemrosesan transaksi belanja (checkout).

---

## 🛠️ Daftar Teknologi Utama
- **Framework**: ASP.NET Core (minimal .NET 8.0 LTS)
- **Database**: PostgreSQL
- **Database Library**: Hybrid Dapper (Raw SQL) & Entity Framework Core (ORM)
- **Autentikasi**: JWT (JSON Web Token) Bearer Token & BCrypt password hashing
- **Logging**: Serilog (rolling log files & console output)
- **Dokumentasi API**: Swagger / OpenAPI
- **Validasi**: Data Annotations Model Validation

---

## 📐 Arsitektur & Pola Desain (Design Patterns)

Backend ini menerapkan **Modular Architecture** dengan pemisahan keprihatinan yang jelas (Separation of Concerns):
- **Domain Models**: Representasi entitas murni dalam database (`User`, `Product`, `Order`, `OrderItem`).
- **DTOs (Data Transfer Objects)**: Validasi ketat untuk payload request yang masuk (contoh: validasi format email, minimal panjang password, batasan range harga dan stok).
- **Repository Pattern (Hybrid)**:
  - **Dapper**: Digunakan untuk seluruh operasi membaca data (**READ/GET**) dengan kueri Raw SQL langsung ke PostgreSQL demi kecepatan performa optimal.
  - **Entity Framework Core**: Digunakan untuk operasi manipulasi data (**Create, Update, Delete**) untuk kemudahan pengelolaan transaksi state (seperti checkout barang dengan pengurangan stok dalam satu transaksi DB).
- **Middleware Pattern**: Global Exception Handling Middleware mencegat seluruh error aplikasi secara terpusat untuk dicatat ke dalam log file dan memformat respon error seragam berupa JSON.

---

## 🚀 Instruksi Setup & Menjalankan Aplikasi

### Langkah 1: Kebutuhan Awal
- Instal [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0).
- Instal database server [PostgreSQL](https://www.postgresql.org/).

### Langkah 2: Migrasi Database
1. Buat database baru bernama `WarungDb` di server PostgreSQL lokal Anda.
2. Inisialisasi struktur tabel dengan mengeksekusi script SQL yang berada di file [DbSchema.sql](file:///d:/github%20matkul/web-shop/backend/DbSchema.sql) pada database tersebut. 
   *(Catatan: Aplikasi juga dikonfigurasi dengan `context.Database.EnsureCreated()` yang akan membuat skema secara otomatis di database jika tabel terdeteksi kosong).*

### Langkah 3: Konfigurasi Connection String
Buka file [appsettings.json](file:///d:/github%20matkul/web-shop/backend/appsettings.json) dan sesuaikan kredensial username/password database PostgreSQL lokal Anda:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=WarungDb;Username=postgres;Password=postgres"
}
```

### Langkah 4: Jalankan API secara Lokal
Buka terminal di folder `backend/` lalu jalankan perintah:
```bash
dotnet restore
dotnet run
```
API akan menyala secara default pada alamat:
- **HTTP**: `http://localhost:5000`

---

## 🌐 Akses Deployment & Dokumentasi

- **Dokumentasi Interaktif (Swagger UI)**: Buka tautan browser di `http://localhost:5000/index.html` (atau `http://localhost:5000/` karena RoutePrefix di-set kosong). Di sana Anda dapat menguji login, register, dan semua endpoint API.
- **deployment Publik**: API ini dirancang untuk dapat dengan mudah di-deploy ke layanan cloud seperti **Render, Railway, Azure App Service**, atau **AWS Elastic Beanstalk** menggunakan Dockerfile atau repositori Git.
- **Akun Percobaan (Seed Data):**
  - **Admin Akun**: Username: `admin` | Password: `admin123`
  - **Customer Akun**: Username: `budi` | Password: `customer123`
