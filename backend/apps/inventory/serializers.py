from rest_framework import serializers
from .models import StockMovement
from apps.catalog.models import ProductVariant

class StockMovementSerializer(serializers.ModelSerializer):
    variant_name = serializers.ReadOnlyField(source='variant.name')
    product_name = serializers.ReadOnlyField(source='variant.product.name')
    sku = serializers.ReadOnlyField(source='variant.sku')
    staff_email = serializers.ReadOnlyField(source='staff_user.email')

    class Meta:
        model = StockMovement
        fields = [
            'id', 'variant', 'variant_name', 'product_name', 'sku',
            'movement_type', 'quantity_change', 'previous_quantity',
            'new_quantity', 'reason', 'staff_user', 'staff_email', 'created_at'
        ]
        read_only_fields = ['id', 'previous_quantity', 'new_quantity', 'created_at']

class InventoryVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_id = serializers.ReadOnlyField(source='product.id')
    product_slug = serializers.ReadOnlyField(source='product.slug')

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product_id', 'product_name', 'product_slug', 'name',
            'sku', 'size', 'color_name', 'stock_quantity',
            'low_stock_threshold', 'is_active'
        ]
