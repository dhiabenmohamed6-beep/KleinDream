from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage, Collection, Review
from apps.accounts.serializers import UserSerializer

class SubCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'image_url',
            'audience', 'display_order', 'is_active', 'is_featured',
            'product_count'
        ]

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()
    parent_name = serializers.ReadOnlyField(source='parent.name')

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'image_url', 'banner',
            'parent', 'parent_name', 'audience', 'display_order', 'is_active',
            'is_featured', 'seo_title', 'seo_description', 'subcategories', 'product_count'
        ]

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            'id', 'image', 'image_url', 'alt_text', 'display_order',
            'is_primary', 'is_ai_generated', 'created_at'
        ]

class ProductVariantSerializer(serializers.ModelSerializer):
    price = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'name', 'size', 'color_name', 'color_hex',
            'sku', 'price_override', 'price', 'stock_quantity',
            'low_stock_threshold', 'is_active', 'is_in_stock'
        ]

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'user_name', 'rating', 'title',
            'comment', 'is_verified_purchase', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'is_verified_purchase', 'created_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

class ProductListSerializer(serializers.ModelSerializer):
    categories = SubCategorySerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    total_stock = serializers.ReadOnlyField()
    available_colors = serializers.SerializerMethodField()
    available_sizes = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'short_description', 'categories',
            'audience', 'regular_price', 'sale_price', 'current_price',
            'discount_percent', 'is_active', 'is_featured', 'is_bestseller',
            'is_new', 'total_stock', 'primary_image', 'model_3d', 'model_3d_url',
            'variants', 'available_colors', 'available_sizes', 'created_at'
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            return ProductImageSerializer(img).data
        return None

    def get_available_colors(self, obj):
        colors = []
        seen = set()
        for variant in obj.variants.filter(is_active=True):
            if variant.color_hex and variant.color_hex not in seen:
                seen.add(variant.color_hex)
                colors.append({
                    'name': variant.color_name,
                    'hex': variant.color_hex
                })
        return colors

    def get_available_sizes(self, obj):
        sizes = []
        seen = set()
        for variant in obj.variants.filter(is_active=True):
            if variant.size and variant.size not in seen:
                seen.add(variant.size)
                sizes.append(variant.size)
        return sizes

class ProductDetailSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Category.objects.all(), source='categories', write_only=True, required=False
    )
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    current_price = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    total_stock = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'barcode', 'short_description',
            'description', 'categories', 'category_ids', 'audience',
            'regular_price', 'sale_price', 'cost_price', 'current_price',
            'discount_percent', 'is_active', 'is_featured', 'is_bestseller',
            'is_new', 'weight', 'dimensions', 'model_3d', 'model_3d_url',
            'seo_title', 'seo_description', 'images', 'variants', 'reviews',
            'total_stock', 'average_rating', 'created_at', 'updated_at'
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return 5.0

class CollectionSerializer(serializers.ModelSerializer):
    products = ProductListSerializer(many=True, read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Product.objects.all(), source='products', write_only=True, required=False
    )

    class Meta:
        model = Collection
        fields = ['id', 'name', 'slug', 'description', 'image', 'image_url', 'products', 'product_ids', 'is_active']
