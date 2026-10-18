from rest_framework import generics, status, views
from rest_framework.response import Response
from django.db import models, transaction
from django.shortcuts import get_object_or_404
from .models import StockMovement
from .serializers import StockMovementSerializer, InventoryVariantSerializer
from apps.catalog.models import ProductVariant
from apps.accounts.permissions import IsStaffOrAdmin

class StockMovementListView(generics.ListAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = StockMovementSerializer

    def get_queryset(self):
        queryset = StockMovement.objects.all().select_related('variant', 'variant__product', 'staff_user')
        variant_id = self.request.query_params.get('variant_id', None)
        if variant_id:
            queryset = queryset.filter(variant_id=variant_id)
        return queryset

class InventoryVariantListView(generics.ListAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = InventoryVariantSerializer

    def get_queryset(self):
        queryset = ProductVariant.objects.all().select_related('product')
        status_filter = self.request.query_params.get('status', None)
        if status_filter == 'low_stock':
            queryset = queryset.filter(stock_quantity__lte=models.F('low_stock_threshold'), stock_quantity__gt=0)
        elif status_filter == 'out_of_stock':
            queryset = queryset.filter(stock_quantity__lte=0)
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                models.Q(sku__icontains=search) |
                models.Q(name__icontains=search) |
                models.Q(product__name__icontains=search)
            )
        return queryset.order_by('stock_quantity')

class StockAdjustmentView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    @transaction.atomic
    def post(self, request):
        variant_id = request.data.get('variant_id')
        quantity_change = int(request.data.get('quantity_change', 0))
        movement_type = request.data.get('movement_type', StockMovement.TYPE_ADJUSTMENT)
        reason = request.data.get('reason', '')

        if quantity_change == 0:
            return Response({"error": "Quantity change must not be zero."}, status=status.HTTP_400_BAD_REQUEST)

        # Select with lock to prevent race conditions
        variant = get_object_or_404(ProductVariant.objects.select_for_update(), id=variant_id)
        prev_qty = variant.stock_quantity
        new_qty = prev_qty + quantity_change

        if new_qty < 0:
            return Response(
                {"error": f"Cannot deduct {abs(quantity_change)} units. Current stock is only {prev_qty}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        variant.stock_quantity = new_qty
        variant.save(update_fields=['stock_quantity'])

        movement = StockMovement.objects.create(
            variant=variant,
            movement_type=movement_type,
            quantity_change=quantity_change,
            previous_quantity=prev_qty,
            new_quantity=new_qty,
            reason=reason,
            staff_user=request.user
        )

        return Response(StockMovementSerializer(movement).data, status=status.HTTP_201_CREATED)
