from django.test import TestCase
from decimal import Decimal
from apps.catalog.models import Category, Product, ProductVariant

class CatalogTests(TestCase):
    def setUp(self):
        self.cat_women = Category.objects.create(name="Women", slug="women")
        self.cat_dresses = Category.objects.create(name="Dresses", slug="dresses", parent=self.cat_women)
        self.product = Product.objects.create(
            name="Test Silk Gown",
            sku="KD-TEST-01",
            regular_price=Decimal('200.00'),
            sale_price=Decimal('150.00'),
            audience=Product.AUDIENCE_WOMEN
        )
        self.product.categories.add(self.cat_women, self.cat_dresses)
        self.variant = ProductVariant.objects.create(
            product=self.product,
            name="M / Noir",
            size="M",
            color_name="Noir",
            sku="KD-TEST-01-M-BLK",
            stock_quantity=10
        )

    def test_pricing_and_discount(self):
        self.assertEqual(self.product.current_price, Decimal('150.00'))
        self.assertEqual(self.product.discount_percent, 25)

    def test_stock_calculation(self):
        self.assertEqual(self.product.total_stock, 10)
        self.assertTrue(self.variant.is_in_stock)

    def test_category_hierarchy(self):
        self.assertEqual(str(self.cat_dresses), "Women > Dresses")
        self.assertEqual(self.cat_dresses.parent, self.cat_women)
