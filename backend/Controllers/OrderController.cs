using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WarungApi.DTOs;
using WarungApi.Models;
using WarungApi.Repositories;

namespace WarungApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;

        public OrderController(IOrderRepository orderRepository, IProductRepository productRepository)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Invalid token user details" });
            }

            if (roleClaim == "Admin")
            {
                var allOrders = await _orderRepository.GetAllAsync();
                return Ok(allOrders);
            }

            var userOrders = await _orderRepository.GetByUserIdAsync(userId);
            return Ok(userOrders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound(new { Message = "Order not found" });
            }

            // Customer check: customers are restricted to viewing their own orders
            if (roleClaim != "Admin" && order.UserId != userId)
            {
                return Forbid();
            }

            return Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> Create(OrderCreateDto createDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0;

            foreach (var itemDto in createDto.OrderItems)
            {
                var product = await _productRepository.GetByIdAsync(itemDto.ProductId);
                if (product == null)
                {
                    return BadRequest(new { Message = $"Product with ID {itemDto.ProductId} not found." });
                }

                if (product.Stock < itemDto.Quantity)
                {
                    return BadRequest(new { Message = $"Product '{product.Name}' has insufficient stock. Stock: {product.Stock}, Requested: {itemDto.Quantity}" });
                }

                var item = new OrderItem
                {
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = product.Price
                };

                orderItems.Add(item);
                totalAmount += item.UnitPrice * item.Quantity;
            }

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                Status = "Pending",
                ShippingAddress = createDto.ShippingAddress,
                ContactPhone = createDto.ContactPhone,
                OrderItems = orderItems
            };

            try
            {
                var createdOrder = await _orderRepository.CreateAsync(order);
                // Return fully populated order object
                var detailedOrder = await _orderRepository.GetByIdAsync(createdOrder.Id);
                return CreatedAtAction(nameof(GetById), new { id = createdOrder.Id }, detailedOrder ?? (object)createdOrder);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, OrderStatusUpdateDto statusUpdateDto)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound(new { Message = "Order not found" });
            }

            await _orderRepository.UpdateStatusAsync(id, statusUpdateDto.Status);
            return Ok(new { Message = "Order status updated successfully.", Status = statusUpdateDto.Status });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound(new { Message = "Order not found" });
            }

            await _orderRepository.DeleteAsync(id);
            return Ok(new { Message = "Order deleted successfully." });
        }
    }
}
