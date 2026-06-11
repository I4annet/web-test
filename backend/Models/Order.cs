namespace WarungApi.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending"; // "Pending", "Processing", "Completed", "Cancelled"
        public string ShippingAddress { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public List<OrderItem> OrderItems { get; set; } = new();
    }
}
