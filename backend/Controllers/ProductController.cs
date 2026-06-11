using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarungApi.DTOs;
using WarungApi.Models;
using WarungApi.Repositories;

namespace WarungApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductRepository _productRepository;

        public ProductController(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetAll([FromQuery] string? category)
        {
            if (!string.IsNullOrEmpty(category))
            {
                var productsByCategory = await _productRepository.GetByCategoryAsync(category);
                return Ok(productsByCategory);
            }

            var products = await _productRepository.GetAllAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetById(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { Message = $"Product with ID {id} not found." });
            }
            return Ok(product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> Create(ProductCreateDto createDto)
        {
            var product = new Product
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Price = createDto.Price,
                Stock = createDto.Stock,
                ImageUrl = createDto.ImageUrl,
                Category = createDto.Category
            };

            await _productRepository.CreateAsync(product);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProductUpdateDto updateDto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { Message = $"Product with ID {id} not found." });
            }

            product.Name = updateDto.Name;
            product.Description = updateDto.Description;
            product.Price = updateDto.Price;
            product.Stock = updateDto.Stock;
            product.ImageUrl = updateDto.ImageUrl;
            product.Category = updateDto.Category;

            await _productRepository.UpdateAsync(product);
            return Ok(product);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { Message = $"Product with ID {id} not found." });
            }

            await _productRepository.DeleteAsync(id);
            return Ok(new { Message = "Product deleted successfully." });
        }
    }
}
