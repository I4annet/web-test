import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _loading = false;
  String? _error;

  User? get user => _user;
  bool get loading => _loading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/auth/login', {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        _user = User.fromJson(data);
        await ApiService.saveToken(_user!.token);
        _loading = false;
        notifyListeners();
        return true;
      } else {
        final Map<String, dynamic> data = jsonDecode(response.body);
        _error = data['message'] ?? 'Login gagal. Coba lagi.';
      }
    } catch (e) {
      _error = 'Koneksi gagal. Periksa server API Anda.';
    }

    _loading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register(String username, String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/auth/register', {
        'username': username,
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        _user = User.fromJson(data);
        await ApiService.saveToken(_user!.token);
        _loading = false;
        notifyListeners();
        return true;
      } else {
        final Map<String, dynamic> data = jsonDecode(response.body);
        _error = data['message'] ?? 'Registrasi gagal. Coba lagi.';
      }
    } catch (e) {
      _error = 'Koneksi gagal. Periksa server API Anda.';
    }

    _loading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await ApiService.removeToken();
    _user = null;
    notifyListeners();
  }

  Future<void> loadUser() async {
    final token = await ApiService.getToken();
    if (token == null) return;

    _loading = true;
    notifyListeners();

    try {
      final response = await ApiService.get('/auth/me');
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        _user = User.fromJson(data);
      } else {
        await ApiService.removeToken();
        _user = null;
      }
    } catch (e) {
      // In case of error (offline), keep token but don't crash
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
