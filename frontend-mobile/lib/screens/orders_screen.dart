import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/order.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<Order> _orders = [];
  bool _loading = true;
  String? _error;
  int? _expandedOrderId;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await ApiService.get('/order');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _orders = data.map((json) => Order.fromJson(json)).toList();
        });
      } else {
        setState(() {
          _error = 'Gagal memuat riwayat belanja. Kode: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Koneksi gagal. Periksa koneksi internet Anda.';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  String _formatRupiah(double val) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(val);
  }

  String _formatDate(DateTime date) {
    return DateFormat('d MMMM yyyy, HH:mm', 'id_ID').format(date);
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Completed': return Colors.emerald;
      case 'Processing': return Colors.blue;
      case 'Cancelled': return Colors.red;
      default: return Colors.amber;
    }
  }

  String _translateStatus(String status) {
    switch (status) {
      case 'Completed': return 'Selesai';
      case 'Processing': return 'Diproses';
      case 'Cancelled': return 'Dibatalkan';
      default: return 'Menunggu';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.slate[50],
      appBar: AppBar(
        title: const Text('Riwayat Belanja'),
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.slate[800],
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _fetchOrders,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_error!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: _fetchOrders,
                          child: const Text('Coba Lagi'),
                        )
                      ],
                    ),
                  ),
                )
              : _orders.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.receipt_long_outlined, size: 64, color: Colors.slate[300]),
                          const SizedBox(height: 16),
                          Text(
                            'Belum ada transaksi',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.slate[600]),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _orders.length,
                      itemBuilder: (context, idx) {
                        final order = _orders[idx];
                        final isExpanded = _expandedOrderId == order.id;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.slate[100]!),
                          ),
                          child: Column(
                            children: [
                              ListTile(
                                title: Row(
                                  children: [
                                    Text(
                                      'INV/WRG-${order.id.toString().padLeft(5, '0')}',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: _getStatusColor(order.status).withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        _translateStatus(order.status),
                                        style: TextStyle(
                                          color: _getStatusColor(order.status),
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    )
                                  ],
                                ),
                                subtitle: Padding(
                                  padding: const EdgeInsets.only(top: 4.0),
                                  child: Text(
                                    _formatDate(order.orderDate),
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                ),
                                trailing: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text('Total Belanja', style: TextStyle(fontSize: 10, color: Colors.slate)),
                                    const SizedBox(height: 2),
                                    Text(
                                      _formatRupiah(order.totalAmount),
                                      style: TextStyle(
                                        fontWeight: FontWeight.extrabold,
                                        color: Colors.emerald[600],
                                        fontSize: 14,
                                      ),
                                    )
                                  ],
                                ),
                                onTap: () {
                                  setState(() {
                                    _expandedOrderId = isExpanded ? null : order.id;
                                  });
                                },
                              ),
                              if (isExpanded) ...[
                                const Divider(height: 1, indent: 16, endIndent: 16),
                                Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Address details
                                      Text(
                                        'Alamat Pengiriman:',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.slate[500]),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        order.shippingAddress,
                                        style: const TextStyle(fontSize: 13, color: Colors.slate),
                                      ),
                                      const SizedBox(height: 12),

                                      // Items header
                                      Text(
                                        'Daftar Belanjaan:',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.slate[500]),
                                      ),
                                      const SizedBox(height: 8),

                                      // Items list
                                      ...order.orderItems.map((item) => Padding(
                                            padding: const EdgeInsets.only(bottom: 6.0),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.between,
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    '${item.product?.name ?? 'Produk'} (x${item.quantity})',
                                                    style: const TextStyle(fontSize: 13, color: Colors.slate),
                                                  ),
                                                ),
                                                Text(
                                                  _formatRupiah(item.unitPrice * item.quantity),
                                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                                )
                                              ],
                                            ),
                                          )),
                                    ],
                                  ),
                                )
                              ]
                            ],
                          ),
                        );
                      },
                    ),
    );
  }
}
