-- Database Schema for Toko Warung
-- Target Database: PostgreSQL

-- Drop tables if they exist (for easy re-creation)
DROP TABLE IF EXISTS "OrderItems" CASCADE;
DROP TABLE IF EXISTS "Orders" CASCADE;
DROP TABLE IF EXISTS "Products" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- 1. Users Table
CREATE TABLE "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Username" VARCHAR(50) NOT NULL UNIQUE,
    "Email" VARCHAR(100) NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "Role" VARCHAR(20) NOT NULL DEFAULT 'Customer', -- 'Customer' or 'Admin'
    "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

-- 2. Products Table
CREATE TABLE "Products" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" TEXT,
    "Price" DECIMAL(18, 2) NOT NULL,
    "Stock" INT NOT NULL DEFAULT 0,
    "ImageUrl" VARCHAR(500),
    "Category" VARCHAR(50) NOT NULL,
    "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

-- 3. Orders Table
CREATE TABLE "Orders" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "OrderDate" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    "TotalAmount" DECIMAL(18, 2) NOT NULL,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Processing', 'Completed', 'Cancelled'
    "ShippingAddress" TEXT NOT NULL,
    "ContactPhone" VARCHAR(20) NOT NULL
);

-- 4. OrderItems Table
CREATE TABLE "OrderItems" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INT NOT NULL REFERENCES "Orders"("Id") ON DELETE CASCADE,
    "ProductId" INT NOT NULL REFERENCES "Products"("Id") ON DELETE RESTRICT,
    "Quantity" INT NOT NULL,
    "UnitPrice" DECIMAL(18, 2) NOT NULL
);

-- Seed Initial Admin User (password is 'admin123' hashed with BCrypt)
-- Hash: $2a$11$J1p1w6FspZq8x4G0u79.zO11D2f2bJm4WvJsnRvh6iBmWJqQ495yq
INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role")
VALUES ('admin', 'admin@warung.com', '$2a$11$J1p1w6FspZq8x4G0u79.zO11D2f2bJm4WvJsnRvh6iBmWJqQ495yq', 'Admin');

-- Seed Initial Customer User (password is 'customer123' hashed with BCrypt)
-- Hash: $2a$11$7N2b.8qP0KzHw3J89mO6Re492YwQ1YxW3G08m8pZc9h897P.mI7dC
INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role")
VALUES ('budi', 'budi@gmail.com', '$2a$11$7N2b.8qP0KzHw3J89mO6Re492YwQ1YxW3G08m8pZc9h897P.mI7dC', 'Customer');

-- Seed Initial Products (Warung Groceries)
INSERT INTO "Products" ("Name", "Description", "Price", "Stock", "ImageUrl", "Category") VALUES
('Indomie Goreng Special', 'Mie instan goreng rasa spesial dari Indomie, kelezatan legendaris.', 3500.00, 100, 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=400&q=80', 'Makanan Instan'),
('Beras Pandan Wangi 5kg', 'Beras premium pandan wangi, nasi pulen dan harum alami.', 75000.00, 20, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', 'Bahan Pokok'),
('Minyak Goreng Filma 2L', 'Minyak goreng kelapa sawit pilihan untuk masakan renyah.', 36000.00, 15, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', 'Bahan Pokok'),
('Telur Ayam Negeri 1kg', 'Telur ayam negeri segar pilihan, isi kurang lebih 16 butir.', 28000.00, 30, 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=400&q=80', 'Bahan Pokok'),
('Kecap Manis Bango 550ml', 'Kecap manis legendaris terbuat dari kedelai hitam pilihan.', 22000.00, 25, 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&w=400&q=80', 'Bumbu Dapur'),
('Gula Pasir Gulaku 1kg', 'Gula tebu murni bersih dan berkualitas tinggi.', 17500.00, 40, 'https://images.unsplash.com/photo-1581781870027-04212e232938?auto=format&fit=crop&w=400&q=80', 'Bahan Pokok'),
('Teh Celup Sariwangi isi 25', 'Teh celup hitam asli Indonesia, aroma wangi menyegarkan.', 6500.00, 50, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80', 'Minuman'),
('Kopi Kapal Api Special 165g', 'Kopi bubuk hitam murni dengan aroma harum yang mantap.', 15000.00, 35, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', 'Minuman'),
('Aqua Air Mineral 600ml', 'Air mineral murni pegunungan kemasan botol sedang.', 4000.00, 120, 'https://images.unsplash.com/photo-1608885898957-a599fb1b4600?auto=format&fit=crop&w=400&q=80', 'Minuman'),
('Susu Kental Manis Frisian Flag 370g', 'Susu kental manis lezat untuk campuran minuman atau roti.', 12500.00, 20, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', 'Bahan Pokok');
