from rest_framework import serializers
from .models import Order, OrderItem
from apps.accounts.serializers import UserSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'variant', 'product_name', 'variant_name',
            'sku', 'unit_price', 'quantity', 'line_total', 'image_url'
        ]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'customer_email', 'customer_name',
            'customer_phone', 'status', 'status_display', 'payment_status',
            'payment_status_display', 'payment_method', 'payment_method_display',
            'shipping_address', 'shipping_method', 'shipping_carrier',
            'tracking_number', 'currency', 'subtotal', 'discount_amount',
            'shipping_fee', 'tax_amount', 'total', 'coupon_code', 'notes',
            'internal_notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'currency', 'subtotal',
            'discount_amount', 'shipping_fee', 'tax_amount', 'total',
            'created_at', 'updated_at'
        ]

class CheckoutSerializer(serializers.Serializer):
    customer_email = serializers.EmailField()
    customer_name = serializers.CharField(max_length=150)
    customer_phone = serializers.CharField(max_length=30)
    shipping_address = serializers.DictField()
    shipping_method = serializers.CharField(max_length=100, default='Standard Courier')
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES, default=Order.METHOD_COD)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
