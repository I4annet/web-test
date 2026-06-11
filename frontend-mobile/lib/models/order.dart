import 'order_item.dart';

class Order {
  final int id;
  final int userId;
  final DateTime orderDate;
  final double totalAmount;
  final String status;
  final String shippingAddress;
  final String contactPhone;
  final List<OrderItem> orderItems;

  Order({
    required this.id,
    required this.userId,
    required this.orderDate,
    required this.totalAmount,
    required this.status,
    required this.shippingAddress,
    required this.contactPhone,
    required this.orderItems,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    var list = json['orderItems'] as List?;
    List<OrderItem> itemsList = list != null
        ? list.map((i) => OrderItem.fromJson(i)).toList()
        : [];

    return Order(
      id: json['id'] ?? 0,
      userId: json['userId'] ?? 0,
      orderDate: json['orderDate'] != null 
          ? DateTime.parse(json['orderDate']).toLocal() 
          : DateTime.now(),
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? '',
      shippingAddress: json['shippingAddress'] ?? '',
      contactPhone: json['contactPhone'] ?? '',
      orderItems: itemsList,
    );
  }
}
