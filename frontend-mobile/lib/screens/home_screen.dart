import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/product_provider.dart';
import '../providers/cart_provider.dart';
import 'login_screen.dart';
import 'cart_screen.dart';
import 'orders_screen.dart';
import 'product_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedCategory = 'Semua';
  String _searchQuery = '';
  final List<String> _categories = ['Semua', 'Bahan Pokok', 'Makanan Instan', 'Minuman', 'Bumbu Dapur'];

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
      Provider.of<ProductProvider>(context, listen: false).fetchProducts()
    );
  }

  void _onCategorySelected(String category) {
    setState(() {
      _selectedCategory = category;
    });
    Provider.of<ProductProvider>(context, listen: false).fetchProducts(category);
  }

  String _formatRupiah(double val) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(val);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final productProvider = Provider.of<ProductProvider>(context);
    final cartProvider = Provider.of<CartProvider>(context);

    final displayedProducts = productProvider.products.where((p) =>
      p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      p.description.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();

    return Scaffold(
      backgroundColor: Colors.slate[50],
      appBar: AppBar(
        title: const Text('WarungKita', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.emerald[600],
        foregroundColor: Colors.white,
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const CartScreen()),
                  );
                },
              ),
              if (cartProvider.itemCount > 0)
                Positioned(
                  right: 4,
                  top: 4,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red[600],
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      '${cartProvider.itemCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                )
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      drawer: Drawer(
        child: Column(
          children: [
            UserAccountsDrawerHeader(
              decoration: BoxDecoration(color: Colors.emerald[600]),
              currentAccountPicture: CircleAvatar(
                backgroundColor: Colors.white,
                child: Text(
                  authProvider.isAuthenticated
                      ? authProvider.user!.username.substring(0, 1).toUpperCase()
                      : '?',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.emerald[700]),
                ),
              ),
              accountName: Text(
                authProvider.isAuthenticated ? authProvider.user!.username : 'Tamu',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              accountEmail: Text(
                authProvider.isAuthenticated ? authProvider.user!.email : 'Silakan masuk akun',
              ),
            ),
            ListTile(
              leading: const Icon(Icons.storefront),
              title: const Text('Belanja Produk'),
              selected: true,
              selectedColor: Colors.emerald[700],
              onTap: () => Navigator.pop(context),
            ),
            if (authProvider.isAuthenticated)
              ListTile(
                leading: const Icon(Icons.receipt_long_outlined),
                title: const Text('Riwayat Belanja'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const OrdersScreen()),
                  );
                },
              ),
            const Spacer(),
            const Divider(),
            if (authProvider.isAuthenticated)
              ListTile(
                leading: Icon(Icons.logout, color: Colors.red[700]),
                title: Text('Keluar Akun', style: TextStyle(color: Colors.red[700])),
                onTap: () async {
                  await authProvider.logout();
                  if (mounted) {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                    );
                  }
                },
              )
            else
              ListTile(
                leading: Icon(Icons.login, color: Colors.emerald[700]),
                title: Text('Masuk Akun', style: TextStyle(color: Colors.emerald[700])),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                  );
                },
              ),
            const SizedBox(height: 16),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search Input
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                decoration: const InputDecoration(
                  hintText: 'Cari kebutuhan harian Anda...',
                  prefixIcon: Icon(Icons.search, color: Colors.slate),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
            ),
          ),

          // Categories horizontal list
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              itemBuilder: (context, idx) {
                final cat = _categories[idx];
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: FilterChip(
                    label: Text(
                      cat,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.slate[700],
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    selected: isSelected,
                    onSelected: (_) => _onCategorySelected(cat),
                    backgroundColor: Colors.white,
                    selectedColor: Colors.emerald[600],
                    checkmarkColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected ? Colors.emerald[600]! : Colors.slate[200]!,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),

          // Products Display
          Expanded(
            child: productProvider.loading
                ? const Center(child: CircularProgressIndicator())
                : productProvider.error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(productProvider.error!, style: TextStyle(color: Colors.red[700])),
                            const SizedBox(height: 8),
                            ElevatedButton(
                              onPressed: () => _onCategorySelected(_selectedCategory),
                              child: const Text('Coba Lagi'),
                            )
                          ],
                        ),
                      )
                    : displayedProducts.isEmpty
                        ? const Center(child: Text('Tidak ada produk tersedia.'))
                        : GridView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.68,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                            ),
                            itemCount: displayedProducts.length,
                            itemBuilder: (context, idx) {
                              final prod = displayedProducts[idx];
                              final isOutOfStock = prod.stock <= 0;
                              return GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => ProductDetailScreen(product: prod),
                                    ),
                                  );
                                },
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: Colors.slate[100]!),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.slate[500]!.withOpacity(0.02),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      )
                                    ],
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Image
                                      Expanded(
                                        child: ClipRRect(
                                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                          child: prod.imageUrl.isNotEmpty
                                              ? Image.network(
                                                  prod.imageUrl,
                                                  width: double.infinity,
                                                  fit: BoxFit.cover,
                                                  errorBuilder: (_, __, ___) => Container(
                                                    color: Colors.slate[100],
                                                    child: const Icon(Icons.broken_image, color: Colors.slate),
                                                  ),
                                                )
                                              : Container(
                                                  color: Colors.slate[100],
                                                  child: const Icon(Icons.image_outlined, color: Colors.slate),
                                                ),
                                        ),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.all(12.0),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              prod.category,
                                              style: TextStyle(
                                                color: Colors.emerald[600],
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              prod.name,
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14,
                                                color: Colors.slate[800],
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              isOutOfStock ? 'Stok Habis' : 'Stok: ${prod.stock}',
                                              style: TextStyle(
                                                color: isOutOfStock
                                                    ? Colors.red[600]
                                                    : prod.stock < 10
                                                        ? Colors.amber[600]
                                                        : Colors.slate[500],
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 12),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.between,
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    _formatRupiah(prod.price),
                                                    style: TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 14,
                                                      color: Colors.slate[800],
                                                    ),
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                                IconButton(
                                                  onPressed: isOutOfStock
                                                      ? null
                                                      : () {
                                                          cartProvider.addItem(prod);
                                                          ScaffoldMessenger.of(context).showSnackBar(
                                                            SnackBar(
                                                              content: Text('${prod.name} ditambahkan ke keranjang'),
                                                              duration: const Duration(seconds: 1),
                                                            ),
                                                          );
                                                        },
                                                  icon: const Icon(Icons.add, size: 18),
                                                  style: IconButton.styleFrom(
                                                    backgroundColor: Colors.emerald[50],
                                                    foregroundColor: Colors.emerald[600],
                                                    shape: RoundedRectangleBorder(
                                                      borderRadius: BorderRadius.circular(10),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
