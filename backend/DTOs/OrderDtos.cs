using System.ComponentModel.DataAnnotations;

namespace WarungApi.DTOs
{
    public class OrderCreateDto
    {
        [Required(ErrorMessage = "Shipping address is required")]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contact phone is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string ContactPhone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Order must contain items")]
        [MinLength(1, ErrorMessage = "Order must have at least one item")]
        public List<OrderItemCreateDto> OrderItems { get; set; } = new();
    }

    public class OrderItemCreateDto
    {
        [Required(ErrorMessage = "Product ID is required")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Quantity is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }

    public class OrderStatusUpdateDto
    {
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression("Pending|Processing|Completed|Cancelled", ErrorMessage = "Invalid status. Allowed values: Pending, Processing, Completed, Cancelled")]
        public string Status { get; set; } = string.Empty;
    }
}
