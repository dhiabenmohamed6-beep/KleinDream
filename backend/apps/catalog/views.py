from rest_framework import generics, viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models, transaction
from django.db.models import Q, Min, Max, Count
from .models import Category, Product, ProductVariant, ProductImage, Collection, Review
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductVariantSerializer, ProductImageSerializer, CollectionSerializer, ReviewSerializer
)
from apps.accounts.permissions import IsStoreAdmin, IsStaffOrAdmin, IsAdminUserOrReadOnly

class CategoryViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    permission_classes = [IsAdminUserOrReadOnly]
    serializer_class = CategorySerializer

    def get_queryset(self):
        queryset = Category.objects.all()
        # If not staff, only show active categories
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.is_staff_member):
            queryset = queryset.filter(is_active=True)
            
        parent = self.request.query_params.get('parent', None)
        if parent == 'null' or parent == 'root':
            queryset = queryset.filter(parent__isnull=True)
        elif parent:
            queryset = queryset.filter(parent__slug=parent)

        audience = self.request.query_params.get('audience', None)
        if audience:
            queryset = queryset.filter(Q(audience=audience) | Q(audience=Category.AUDIENCE_ALL))

        return queryset.order_by('display_order', 'name')

class ProductViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    permission_classes = [IsAdminUserOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['list']:
            return ProductListSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        queryset = Product.objects.all().prefetch_related('images', 'variants', 'categories')
        
        # Public filtering: only active products
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.is_staff_member):
            queryset = queryset.filter(is_active=True)

        params = self.request.query_params

        # Search query across name, description, SKU
        search = params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(sku__icontains=search) |
                Q(short_description__icontains=search)
            )

        # Category filter (by slug or id)
        category_slug = params.get('category', None)
        if category_slug:
            queryset = queryset.filter(
                Q(categories__slug=category_slug) | Q(categories__parent__slug=category_slug)
            ).distinct()

        # Target audience
        audience = params.get('audience', None)
        if audience:
            queryset = queryset.filter(Q(audience=audience) | Q(audience=Product.AUDIENCE_ALL))

        # Price range
        min_price = params.get('min_price', None)
        if min_price:
            try:
                queryset = queryset.filter(regular_price__gte=float(min_price))
            except ValueError:
                pass

        max_price = params.get('max_price', None)
        if max_price:
            try:
                queryset = queryset.filter(regular_price__lte=float(max_price))
            except ValueError:
                pass

        # Sale filter
        on_sale = params.get('on_sale', None)
        if on_sale and on_sale.lower() in ['true', '1']:
            queryset = queryset.filter(sale_price__isnull=False, sale_price__lt=models.F('regular_price'))

        # New arrivals filter
        is_new = params.get('is_new', None)
        if is_new and is_new.lower() in ['true', '1']:
            queryset = queryset.filter(is_new=True)

        # Bestseller filter
        is_bestseller = params.get('is_bestseller', None)
        if is_bestseller and is_bestseller.lower() in ['true', '1']:
            queryset = queryset.filter(is_bestseller=True)

        # Size filter
        size = params.get('size', None)
        if size:
            sizes = [s.strip() for s in size.split(',')]
            queryset = queryset.filter(variants__size__in=sizes, variants__is_active=True).distinct()

        # In stock only
        in_stock = params.get('in_stock', None)
        if in_stock and in_stock.lower() in ['true', '1']:
            queryset = queryset.filter(variants__stock_quantity__gt=0, variants__is_active=True).distinct()

        # Sorting
        sort_by = params.get('sort', 'newest')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('regular_price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-regular_price')
        elif sort_by == 'bestseller':
            queryset = queryset.order_by('-is_bestseller', '-created_at')
        elif sort_by == 'name_asc':
            queryset = queryset.order_by('name')
        else: # newest
            queryset = queryset.order_by('-created_at')

        return queryset

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        product = self.get_object()
        related = Product.objects.filter(
            categories__in=product.categories.all(),
            is_active=True
        ).exclude(id=product.id).distinct()[:4]
        serializer = ProductListSerializer(related, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdmin])
    def add_image(self, request, slug=None):
        product = self.get_object()
        image = request.FILES.get('image', None)
        image_url = request.data.get('image_url', '')
        alt_text = request.data.get('alt_text', product.name)
        is_primary = request.data.get('is_primary', 'false').lower() == 'true'
        is_ai_generated = request.data.get('is_ai_generated', 'false').lower() == 'true'

        prod_image = ProductImage.objects.create(
            product=product,
            image=image,
            image_url=image_url,
            alt_text=alt_text,
            is_primary=is_primary,
            is_ai_generated=is_ai_generated
        )
        return Response(ProductImageSerializer(prod_image).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdmin])
    def add_variant(self, request, slug=None):
        product = self.get_object()
        data = request.data.copy()
        data['product'] = product.id
        serializer = ProductVariantSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CollectionViewSet(viewsets.ModelViewSet):
    queryset = Collection.objects.filter(is_active=True)
    serializer_class = CollectionSerializer
    lookup_field = 'slug'
    permission_classes = [IsAdminUserOrReadOnly]

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_slug = self.request.query_params.get('product', None)
        if product_slug:
            return Review.objects.filter(product__slug=product_slug, is_approved=True)
        return Review.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
