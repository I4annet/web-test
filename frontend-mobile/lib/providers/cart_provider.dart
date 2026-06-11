import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});
}

class CartProvider with ChangeNotifier {
  final Map<int, CartItem> _items = {};
  bool _loading = false;
  String? _error;

  Map<int, CartItem> get items => {..._items};
  bool get loading => _loading;
  String? get error => _error;

  int get itemCount => _items.values.fold(0, (sum, item) => sum + item.quantity);

  double get totalAmount => _items.values.fold(0.0, (sum, item) => sum + (item.product.price * item.quantity));

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void addItem(Product product, [int quantity = 1]) {
    if (_items.containsKey(product.id)) {
      final existing = _items[product.id]!;
      if (existing.quantity + quantity > product.stock) {
        return; // Stock threshold limit hit
      }
      existing.quantity += quantity;
    } else {
      if (quantity > product.stock) return;
      _items[product.id] = CartItem(product: product, quantity: quantity);
    }
    notifyListeners();
  }

  void updateQuantity(int productId, int quantity) {
    if (!_items.containsKey(productId)) return;
    
    final item = _items[productId]!;
    if (quantity > item.product.stock) return;
    
    if (quantity <= 0) {
      _items.remove(productId);
    } else {
      item.quantity = quantity;
    }
    notifyListeners();
  }

  void removeItem(int productId) {
    _items.remove(productId);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  Future<bool> checkout(String address, String phone) async {
    if (_items.isEmpty) return false;

    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final orderItemsPayload = _items.values.map((item) => {
        'productId': item.product.id,
        'quantity': item.quantity,
      }).toList();

      final response = await ApiService.post('/order', {
        'shippingAddress': address,
        'contactPhone': phone,
        'orderItems': orderItemsPayload,
      });

      if (response.statusCode == 201 || response.statusCode == 200) {
        clearCart();
        _loading = false;
        notifyListeners();
        return true;
      } else {
        final Map<String, dynamic> data = jsonDecode(response.body);
        _error = data['message'] ?? 'Checkout gagal. Coba lagi.';
      }
    } catch (e) {
      _error = 'Gagal mengirim order ke server.';
    }

    _loading = false;
    notifyListeners();
    return false;
  }
}
