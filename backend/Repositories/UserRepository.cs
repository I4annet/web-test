using Dapper;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;
using WarungApi.Data;
using WarungApi.Models;

namespace WarungApi.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly WarungDbContext _context;
        private readonly string _connectionString;

        public UserRepository(WarungDbContext context, IConfiguration configuration)
        {
            _context = context;
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration), "DefaultConnection is not configured.");
        }

        private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

        // --- READ Operations: Raw SQL via Dapper ---
        public async Task<User?> GetByIdAsync(int id)
        {
            using var db = CreateConnection();
            string sql = "SELECT * FROM \"Users\" WHERE \"Id\" = @Id";
            return await db.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            using var db = CreateConnection();
            string sql = "SELECT * FROM \"Users\" WHERE \"Username\" = @Username";
            // Note: Since PasswordHash is annotated with [JsonIgnore], Dapper will still populate it from DB
            // but the JSON serializer will exclude it from HTTP responses, protecting the hash.
            return await db.QueryFirstOrDefaultAsync<User>(sql, new { Username = username });
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            using var db = CreateConnection();
            string sql = "SELECT * FROM \"Users\" WHERE \"Email\" = @Email";
            return await db.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
        }

        // --- WRITE Operations: EF Core ---
        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}
