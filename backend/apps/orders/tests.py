from django.test import TestCase
from decimal import Decimal
from apps.promotions.models import Coupon
from apps.catalog.models import Product, ProductVariant
from apps.orders.models import Order, OrderItem
from apps.inventory.models import StockMovement

class OrderAndCouponTests(TestCase):
    def setUp(self):
        self.coupon = Coupon.objects.create(
            code="SAVE20",
            discount_type=Coupon.TYPE_PERCENTAGE,
            discount_value=Decimal('20.00'),
            min_order_amount=Decimal('100.00'),
            is_active=True
        )
        self.product = Product.objects.create(
            name="Cashmere Knit",
            sku="KD-KNT-01",
            regular_price=Decimal('150.00')
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            name="S / Ivory",
            sku="KD-KNT-01-S",
            stock_quantity=5
        )

    def test_coupon_discount_calculation(self):
        discount, msg = self.coupon.calculate_discount(Decimal('150.00'))
        self.assertEqual(discount, Decimal('30.00')) # 20% of 150 = 30

        # Below minimum order
        valid, msg = self.coupon.is_valid(Decimal('50.00'))
        self.assertFalse(valid)

    def test_stock_deduction(self):
        prev = self.variant.stock_quantity
        self.variant.stock_quantity -= 2
        self.variant.save()
        StockMovement.objects.create(
            variant=self.variant,
            movement_type=StockMovement.TYPE_SALE,
            quantity_change=-2,
            previous_quantity=prev,
            new_quantity=self.variant.stock_quantity,
            reason="Test checkout deduction"
        )
        self.assertEqual(self.variant.stock_quantity, 3)
        self.assertEqual(StockMovement.objects.count(), 1)
