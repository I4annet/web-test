import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _quantity = 1;

  String _formatRupiah(double val) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(val);
  }

  void _increaseQty() {
    if (_quantity < widget.product.stock) {
      setState(() => _quantity++);
    }
  }

  void _decreaseQty() {
    if (_quantity > 1) {
      setState(() => _quantity--);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context);
    final isOutOfStock = widget.product.stock <= 0;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Detail Produk'),
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.slate[800],
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Container(
              height: 300,
              width: double.infinity,
              color: Colors.slate[50],
              child: widget.product.imageUrl.isNotEmpty
                  ? Image.network(
                      widget.product.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Center(
                        child: Icon(Icons.broken_image, size: 50, color: Colors.slate),
                      ),
                    )
                  : const Center(
                      child: Icon(Icons.image, size: 50, color: Colors.slate),
                    ),
            ),
            
            // Info Body
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, py: 4),
                    decoration: BoxDecoration(
                      color: Colors.emerald[50],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      widget.product.category,
                      style: TextStyle(
                        color: Colors.emerald[700],
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.product.name,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.extrabold,
                      color: Colors.slate[800],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _formatRupiah(widget.product.price),
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.emerald[600],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Divider(color: Colors.slate[100]),
                  const SizedBox(height: 16),
                  const Text(
                    'Deskripsi Produk',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.slate,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.product.description.isNotEmpty
                        ? widget.product.description
                        : 'Tidak ada deskripsi untuk produk ini.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.slate[600],
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      const Icon(Icons.inventory_2_outlined, size: 16, color: Colors.slate),
                      const SizedBox(width: 6),
                      Text(
                        isOutOfStock
                            ? 'Stok Habis'
                            : 'Stok Tersedia: ${widget.product.stock} unit',
                        style: TextStyle(
                          color: isOutOfStock ? Colors.red[600] : Colors.slate[600],
                          fontSize: 13,
                          fontWeight: FontWeight.w650,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          border: Border(top: BorderSide(color: Colors.slate[100]!)),
          child: Row(
            children: [
              // Quantity selector
              if (!isOutOfStock) ...[
                Container(
                  decoration: BoxDecoration(
                    color: Colors.slate[50],
                    border: Border.all(color: Colors.slate[200]!),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: _decreaseQty,
                        icon: const Icon(Icons.remove, size: 16),
                      ),
                      Text(
                        '$_quantity',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      IconButton(
                        onPressed: _increaseQty,
                        icon: const Icon(Icons.add, size: 16),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
              ],

              // Add to Cart Button
              Expanded(
                child: ElevatedButton(
                  onPressed: isOutOfStock
                      ? null
                      : () {
                          cartProvider.addItem(widget.product, _quantity);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('$_quantity ${widget.product.name} dimasukkan ke keranjang'),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                          Navigator.pop(context);
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.emerald[600],
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.slate[100],
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    isOutOfStock ? 'Stok Habis' : 'Masukkan Keranjang',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
