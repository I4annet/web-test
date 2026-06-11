using Dapper;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;
using WarungApi.Data;
using WarungApi.Models;

namespace WarungApi.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly WarungDbContext _context;
        private readonly string _connectionString;

        public ProductRepository(WarungDbContext context, IConfiguration configuration)
        {
            _context = context;
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration), "DefaultConnection is not configured.");
        }

        private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

        // --- READ Operations: Raw SQL via Dapper ---
        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            using var db = CreateConnection();
            string sql = "SELECT * FROM \"Products\" ORDER BY \"Id\" DESC";
            return await db.QueryAsync<Product>(sql);
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            using var db = CreateConnection();
            string sql = "SELECT * FROM \"Products\" WHERE \"Id\" = @Id";
            return await db.QueryFirstOrDefaultAsync<Product>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Product>> GetByCategoryAsync(string category)
        {
            using var db = CreateConnection();
            string sql = "SELECT * FROM \"Products\" WHERE \"Category\" = @Category ORDER BY \"Id\" DESC";
            return await db.QueryAsync<Product>(sql, new { Category = category });
        }

        // --- WRITE Operations: EF Core ---
        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }
    }
}
