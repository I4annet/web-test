import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class ProductProvider with ChangeNotifier {
  List<Product> _products = [];
  bool _loading = false;
  String? _error;

  List<Product> get products => _products;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> fetchProducts([String? category]) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final endpoint = category != null && category != 'Semua'
          ? '/product?category=${Uri.encodeComponent(category)}'
          : '/product';

      final response = await ApiService.get(endpoint);

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        _products = data.map((json) => Product.fromJson(json)).toList();
      } else {
        _error = 'Gagal memuat produk. Kode: ${response.statusCode}';
      }
    } catch (e) {
      _error = 'Gagal terhubung ke server API.';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
