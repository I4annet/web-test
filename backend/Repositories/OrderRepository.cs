using Dapper;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;
using WarungApi.Data;
using WarungApi.Models;

namespace WarungApi.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly WarungDbContext _context;
        private readonly string _connectionString;

        public OrderRepository(WarungDbContext context, IConfiguration configuration)
        {
            _context = context;
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration), "DefaultConnection is not configured.");
        }

        private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

        // --- READ Operations: Raw SQL via Dapper ---
        
        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            using var db = CreateConnection();
            string sql = @"
                SELECT o.*, u.""Id"", u.""Username"", u.""Email"", u.""Role""
                FROM ""Orders"" o
                JOIN ""Users"" u ON o.""UserId"" = u.""Id""
                ORDER BY o.""OrderDate"" DESC";

            var orders = await db.QueryAsync<Order, User, Order>(
                sql,
                (order, user) => {
                    order.User = user;
                    return order;
                },
                splitOn: "Id"
            );
            return orders;
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
            using var db = CreateConnection();
            string sql = @"
                SELECT o.*, 
                       u.""Id"", u.""Username"", u.""Email"", u.""Role"",
                       oi.""Id"", oi.""OrderId"", oi.""ProductId"", oi.""Quantity"", oi.""UnitPrice"",
                       p.""Id"", p.""Name"", p.""Price"", p.""ImageUrl"", p.""Category""
                FROM ""Orders"" o
                JOIN ""Users"" u ON o.""UserId"" = u.""Id""
                LEFT JOIN ""OrderItems"" oi ON o.""Id"" = oi.""OrderId""
                LEFT JOIN ""Products"" p ON oi.""ProductId"" = p.""Id""
                WHERE o.""Id"" = @Id";

            var orderDictionary = new Dictionary<int, Order>();

            await db.QueryAsync<Order, User, OrderItem, Product, Order>(
                sql,
                (order, user, orderItem, product) => {
                    if (!orderDictionary.TryGetValue(order.Id, out var currentOrder))
                    {
                        currentOrder = order;
                        currentOrder.User = user;
                        currentOrder.OrderItems = new List<OrderItem>();
                        orderDictionary.Add(currentOrder.Id, currentOrder);
                    }
                    if (orderItem != null)
                    {
                        orderItem.Product = product;
                        currentOrder.OrderItems.Add(orderItem);
                    }
                    return currentOrder;
                },
                new { Id = id },
                splitOn: "Id,Id,Id"
            );

            return orderDictionary.Values.FirstOrDefault();
        }

        public async Task<IEnumerable<Order>> GetByUserIdAsync(int userId)
        {
            using var db = CreateConnection();
            string sql = @"
                SELECT o.*, 
                       u.""Id"", u.""Username"", u.""Email"", u.""Role"",
                       oi.""Id"", oi.""OrderId"", oi.""ProductId"", oi.""Quantity"", oi.""UnitPrice"",
                       p.""Id"", p.""Name"", p.""Price"", p.""ImageUrl"", p.""Category""
                FROM ""Orders"" o
                JOIN ""Users"" u ON o.""UserId"" = u.""Id""
                LEFT JOIN ""OrderItems"" oi ON o.""Id"" = oi.""OrderId""
                LEFT JOIN ""Products"" p ON oi.""ProductId"" = p.""Id""
                WHERE o.""UserId"" = @UserId
                ORDER BY o.""OrderDate"" DESC";

            var orderDictionary = new Dictionary<int, Order>();

            await db.QueryAsync<Order, User, OrderItem, Product, Order>(
                sql,
                (order, user, orderItem, product) => {
                    if (!orderDictionary.TryGetValue(order.Id, out var currentOrder))
                    {
                        currentOrder = order;
                        currentOrder.User = user;
                        currentOrder.OrderItems = new List<OrderItem>();
                        orderDictionary.Add(currentOrder.Id, currentOrder);
                    }
                    if (orderItem != null)
                    {
                        orderItem.Product = product;
                        currentOrder.OrderItems.Add(orderItem);
                    }
                    return currentOrder;
                },
                new { UserId = userId },
                splitOn: "Id,Id,Id"
            );

            return orderDictionary.Values;
        }

        // --- WRITE Operations: EF Core ---

        public async Task<Order> CreateAsync(Order order)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Verify and decrease stock
                foreach (var item in order.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        throw new Exception($"Product with ID {item.ProductId} not found.");
                    }
                    if (product.Stock < item.Quantity)
                    {
                        throw new Exception($"Insufficient stock for product '{product.Name}'. Available: {product.Stock}, Requested: {item.Quantity}");
                    }
                    product.Stock -= item.Quantity;
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return order;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateStatusAsync(int id, string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order != null)
            {
                order.Status = status;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order != null)
            {
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();
            }
        }
    }
}
