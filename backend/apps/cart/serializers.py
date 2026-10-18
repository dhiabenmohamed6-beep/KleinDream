from rest_framework import serializers
from .models import Cart, CartItem
from apps.catalog.serializers import ProductImageSerializer
from apps.catalog.models import Product, ProductVariant

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_slug = serializers.ReadOnlyField(source='product.slug')
    variant_name = serializers.ReadOnlyField(source='variant.name')
    size = serializers.ReadOnlyField(source='variant.size')
    color_name = serializers.ReadOnlyField(source='variant.color_name')
    color_hex = serializers.ReadOnlyField(source='variant.color_hex')
    unit_price = serializers.ReadOnlyField()
    line_total = serializers.ReadOnlyField()
    stock_quantity = serializers.ReadOnlyField(source='variant.stock_quantity')
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_name', 'product_slug', 'variant',
            'variant_name', 'size', 'color_name', 'color_hex', 'quantity',
            'unit_price', 'line_total', 'stock_quantity', 'image_url'
        ]
        read_only_fields = ['id', 'product']

    def get_image_url(self, obj):
        img = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        if img:
            if img.image:
                return img.image.url
            return img.image_url
        return None

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'guest_token', 'items', 'total_items', 'subtotal', 'updated_at']

class AddToCartSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.IntegerField(default=1, min_value=1)

    def validate_variant_id(self, value):
        try:
            variant = ProductVariant.objects.get(id=value, is_active=True, product__is_active=True)
        except ProductVariant.DoesNotExist:
            raise serializers.ValidationError("Product variant not found or inactive.")
        return value
