using WarungApi.Models;

namespace WarungApi.Data
{
    public static class DbSeeder
    {
        public static void Seed(WarungDbContext context)
        {
            // Seed Users
            if (!context.Users.Any())
            {
                context.Users.AddRange(new List<User>
                {
                    new User
                    {
                        Username = "admin",
                        Email = "admin@warung.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                        Role = "Admin"
                    },
                    new User
                    {
                        Username = "budi",
                        Email = "budi@gmail.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("customer123"),
                        Role = "Customer"
                    }
                });
                context.SaveChanges();
            }

            // Seed Products
            if (!context.Products.Any())
            {
                context.Products.AddRange(new List<Product>
                {
                    new Product
                    {
                        Name = "Indomie Goreng Special",
                        Description = "Mie instan goreng rasa spesial dari Indomie, kelezatan legendaris.",
                        Price = 3500.00m,
                        Stock = 100,
                        ImageUrl = "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=400&q=80",
                        Category = "Makanan Instan"
                    },
                    new Product
                    {
                        Name = "Beras Pandan Wangi 5kg",
                        Description = "Beras premium pandan wangi, nasi pulen dan harum alami.",
                        Price = 75000.00m,
                        Stock = 20,
                        ImageUrl = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
                        Category = "Bahan Pokok"
                    },
                    new Product
                    {
                        Name = "Minyak Goreng Filma 2L",
                        Description = "Minyak goreng kelapa sawit pilihan untuk masakan renyah.",
                        Price = 36000.00m,
                        Stock = 15,
                        ImageUrl = "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
                        Category = "Bahan Pokok"
                    },
                    new Product
                    {
                        Name = "Telur Ayam Negeri 1kg",
                        Description = "Telur ayam negeri segar pilihan, isi kurang lebih 16 butir.",
                        Price = 28000.00m,
                        Stock = 30,
                        ImageUrl = "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=400&q=80",
                        Category = "Bahan Pokok"
                    },
                    new Product
                    {
                        Name = "Kecap Manis Bango 550ml",
                        Description = "Kecap manis legendaris terbuat dari kedelai hitam pilihan.",
                        Price = 22000.00m,
                        Stock = 25,
                        ImageUrl = "https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&w=400&q=80",
                        Category = "Bumbu Dapur"
                    },
                    new Product
                    {
                        Name = "Gula Pasir Gulaku 1kg",
                        Description = "Gula tebu murni bersih dan berkualitas tinggi.",
                        Price = 17500.00m,
                        Stock = 40,
                        ImageUrl = "https://images.unsplash.com/photo-1581781870027-04212e232938?auto=format&fit=crop&w=400&q=80",
                        Category = "Bahan Pokok"
                    },
                    new Product
                    {
                        Name = "Teh Celup Sariwangi isi 25",
                        Description = "Teh celup hitam asli Indonesia, aroma wangi menyegarkan.",
                        Price = 6500.00m,
                        Stock = 50,
                        ImageUrl = "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80",
                        Category = "Minuman"
                    },
                    new Product
                    {
                        Name = "Kopi Kapal Api Special 165g",
                        Description = "Kopi bubuk hitam murni dengan aroma harum yang mantap.",
                        Price = 15000.00m,
                        Stock = 35,
                        ImageUrl = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
                        Category = "Minuman"
                    },
                    new Product
                    {
                        Name = "Aqua Air Mineral 600ml",
                        Description = "Air mineral murni pegunungan kemasan botol sedang.",
                        Price = 4000.00m,
                        Stock = 120,
                        ImageUrl = "https://images.unsplash.com/photo-1608885898957-a599fb1b4600?auto=format&fit=crop&w=400&q=80",
                        Category = "Minuman"
                    },
                    new Product
                    {
                        Name = "Susu Kental Manis Frisian Flag 370g",
                        Description = "Susu kental manis lezat untuk campuran minuman atau roti.",
                        Price = 12500.00m,
                        Stock = 20,
                        ImageUrl = "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
                        Category = "Bahan Pokok"
                    }
                });
                context.SaveChanges();
            }
        }
    }
}
