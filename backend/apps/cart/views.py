import uuid
from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer, AddToCartSerializer
from apps.catalog.models import ProductVariant

def get_or_create_cart(request):
    token = request.headers.get('X-Guest-Token', '') or request.query_params.get('guest_token', '')
    
    if request.user.is_authenticated:
        cart = Cart.objects.filter(user=request.user).first()
        if cart is None:
            cart = Cart.objects.create(user=request.user)
        # If there is also a guest cart with items, merge it!
        if token:
            try:
                guest_cart = Cart.objects.get(guest_token=token, user__isnull=True)
                for item in guest_cart.items.all():
                    existing_item = cart.items.filter(variant=item.variant).first()
                    if existing_item:
                        existing_item.quantity += item.quantity
                        existing_item.save()
                    else:
                        item.cart = cart
                        item.save()
                guest_cart.delete()
            except Cart.DoesNotExist:
                pass
        return cart, None

    # Guest user
    if not token:
        token = str(uuid.uuid4())
    cart = Cart.objects.filter(guest_token=token, user__isnull=True).first()
    if cart is None:
        cart = Cart.objects.create(guest_token=token, user=None)
    return cart, token

class CartView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart, token = get_or_create_cart(request)
        serializer = CartSerializer(cart)
        data = serializer.data
        if token:
            data['guest_token'] = token
        return Response(data)

    def post(self, request):
        # Add item to cart
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        variant_id = serializer.validated_data['variant_id']
        quantity = serializer.validated_data['quantity']

        variant = get_object_or_404(ProductVariant, id=variant_id, is_active=True)
        if variant.stock_quantity < quantity:
            return Response(
                {"error": f"Only {variant.stock_quantity} units available in stock."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, token = get_or_create_cart(request)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={'product': variant.product, 'quantity': quantity}
        )
        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > variant.stock_quantity:
                return Response(
                    {"error": f"Cannot add {quantity} more. Stock limit is {variant.stock_quantity}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = new_qty
            cart_item.save()

        res_data = CartSerializer(cart).data
        if token:
            res_data['guest_token'] = token
        return Response(res_data, status=status.HTTP_200_OK)

    def delete(self, request):
        cart, token = get_or_create_cart(request)
        cart.items.all().delete()
        res_data = CartSerializer(cart).data
        if token:
            res_data['guest_token'] = token
        return Response(res_data, status=status.HTTP_200_OK)

class CartItemDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, item_id):
        cart, token = get_or_create_cart(request)
        item = CartItem.objects.filter(id=item_id, cart=cart).first()
        if not item:
            res_data = CartSerializer(cart).data
            if token:
                res_data['guest_token'] = token
            return Response(res_data, status=status.HTTP_200_OK)

        quantity = int(request.data.get('quantity', 1))

        if quantity <= 0:
            item.delete()
        else:
            if quantity > item.variant.stock_quantity:
                return Response(
                    {"error": f"Only {item.variant.stock_quantity} units available in stock."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity = quantity
            item.save()

        res_data = CartSerializer(cart).data
        if token:
            res_data['guest_token'] = token
        return Response(res_data, status=status.HTTP_200_OK)

    def delete(self, request, item_id):
        cart, token = get_or_create_cart(request)
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        res_data = CartSerializer(cart).data
        if token:
            res_data['guest_token'] = token
        return Response(res_data, status=status.HTTP_200_OK)

