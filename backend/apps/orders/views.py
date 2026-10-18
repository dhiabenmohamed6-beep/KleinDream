from rest_framework import generics, viewsets, permissions, status, views
from rest_framework.response import Response
from django.db import transaction, models
from django.shortcuts import get_object_or_404
from decimal import Decimal
from .models import Order, OrderItem
from .serializers import OrderSerializer, CheckoutSerializer
from apps.cart.views import get_or_create_cart
from apps.cart.models import Cart
from apps.catalog.models import ProductVariant
from apps.inventory.models import StockMovement
from apps.promotions.models import Coupon
from apps.accounts.permissions import IsStaffOrAdmin, IsStoreAdmin

class CheckoutView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = get_or_create_cart(request)
        cart_items = cart.items.select_related('product', 'variant').all()
        if not cart_items.exists():
            return Response({"error": "Your shopping cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Lock and check stock for all variants
        subtotal = Decimal('0.00')
        locked_variants = {}
        for item in cart_items:
            # select_for_update to avoid overselling
            variant = ProductVariant.objects.select_for_update().get(id=item.variant.id)
            if variant.stock_quantity < item.quantity:
                return Response(
                    {"error": f"Insufficient stock for '{item.product.name} ({variant.name})'. Only {variant.stock_quantity} left."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            locked_variants[item.variant.id] = variant
            subtotal += Decimal(str(item.unit_price)) * item.quantity

        # 2. Coupon validation
        discount_amount = Decimal('0.00')
        coupon_obj = None
        coupon_code = serializer.validated_data.get('coupon_code', '').strip().upper()
        if coupon_code:
            try:
                coupon_obj = Coupon.objects.select_for_update().get(code__iexact=coupon_code)
                is_valid, msg = coupon_obj.is_valid(subtotal)
                if is_valid:
                    discount_amount, _ = coupon_obj.calculate_discount(subtotal)
            except Coupon.DoesNotExist:
                pass

        # 3. Shipping fee calculation (Free over 150 TND, otherwise 7.00 TND flat)
        free_shipping_threshold = Decimal('150.00')
        shipping_fee = Decimal('0.00') if subtotal >= free_shipping_threshold else Decimal('7.00')

        total = subtotal - discount_amount + shipping_fee
        if total < Decimal('0.00'):
            total = Decimal('0.00')

        # 4. Create Order
        user = request.user if request.user.is_authenticated else None
        order = Order.objects.create(
            user=user,
            customer_email=serializer.validated_data['customer_email'],
            customer_name=serializer.validated_data['customer_name'],
            customer_phone=serializer.validated_data['customer_phone'],
            shipping_address=serializer.validated_data['shipping_address'],
            shipping_method=serializer.validated_data.get('shipping_method', 'Standard Courier'),
            payment_method=serializer.validated_data['payment_method'],
            subtotal=subtotal,
            discount_amount=discount_amount,
            shipping_fee=shipping_fee,
            total=total,
            coupon_code=coupon_code if coupon_obj else '',
            notes=serializer.validated_data.get('notes', ''),
        )

        # 5. Create OrderItems, deduct stock, and log StockMovements
        for item in cart_items:
            variant = locked_variants[item.variant.id]
            prev_qty = variant.stock_quantity
            new_qty = prev_qty - item.quantity

            # Update variant stock
            variant.stock_quantity = new_qty
            variant.save(update_fields=['stock_quantity'])

            # Log stock movement
            StockMovement.objects.create(
                variant=variant,
                movement_type=StockMovement.TYPE_SALE,
                quantity_change=-item.quantity,
                previous_quantity=prev_qty,
                new_quantity=new_qty,
                reason=f"Order #{order.order_number}",
                staff_user=None
            )

            # Get image URL snapshot
            img = item.product.images.filter(is_primary=True).first() or item.product.images.first()
            img_url = ""
            if img:
                img_url = img.image.url if img.image else img.image_url

            OrderItem.objects.create(
                order=order,
                product=item.product,
                variant=variant,
                product_name=item.product.name,
                variant_name=variant.name,
                sku=variant.sku,
                unit_price=item.unit_price,
                quantity=item.quantity,
                line_total=item.line_total,
                image_url=img_url
            )

        # 6. Increment coupon usage
        if coupon_obj:
            coupon_obj.times_used += 1
            coupon_obj.save(update_fields=['times_used'])

        # 7. Clear cart
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class CustomerOrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class OrderDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number)
        # Security: if authenticated, must belong to user or user is staff
        if request.user.is_authenticated:
            if not request.user.is_staff_member and order.user != request.user:
                return Response({"error": "Not authorized to view this order."}, status=status.HTTP_403_FORBIDDEN)
        return Response(OrderSerializer(order).data)

class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related('items').order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [IsStaffOrAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(order_number__icontains=search) |
                models.Q(customer_name__icontains=search) |
                models.Q(customer_email__icontains=search) |
                models.Q(customer_phone__icontains=search)
            )
        return queryset

    @transaction.atomic
    def perform_update(self, serializer):
        prev_status = serializer.instance.status
        instance = serializer.save()
        # If cancelled, restore variant stock!
        if prev_status != Order.STATUS_CANCELLED and instance.status == Order.STATUS_CANCELLED:
            self._restore_order_stock(instance, f"Cancelled Order #{instance.order_number}")

    def _restore_order_stock(self, order, reason):
        for item in order.items.all():
            if item.variant:
                variant = ProductVariant.objects.select_for_update().get(id=item.variant.id)
                previous_quantity = variant.stock_quantity
                new_quantity = previous_quantity + item.quantity
                variant.stock_quantity = new_quantity
                variant.save(update_fields=['stock_quantity'])

                StockMovement.objects.create(
                    variant=variant,
                    movement_type=StockMovement.TYPE_CANCEL,
                    quantity_change=item.quantity,
                    previous_quantity=previous_quantity,
                    new_quantity=new_quantity,
                    reason=reason,
                    staff_user=self.request.user
                )

    @transaction.atomic
    def perform_destroy(self, instance):
        if instance.status != Order.STATUS_CANCELLED:
            self._restore_order_stock(instance, f"Deleted Order #{instance.order_number}")
        instance.delete()
