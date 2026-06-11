using WarungApi.Models;

namespace WarungApi.Repositories
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Order>> GetAllAsync();
        Task<Order?> GetByIdAsync(int id);
        Task<IEnumerable<Order>> GetByUserIdAsync(int userId);
        Task<Order> CreateAsync(Order order);
        Task UpdateStatusAsync(int id, string status);
        Task DeleteAsync(int id);
    }
}
