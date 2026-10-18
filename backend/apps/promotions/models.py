from django.db import models
from django.utils import timezone
from decimal import Decimal

class Coupon(models.Model):
    TYPE_PERCENTAGE = 'PERCENTAGE'
    TYPE_FIXED = 'FIXED'

    DISCOUNT_TYPES = [
        (TYPE_PERCENTAGE, 'Percentage (%)'),
        (TYPE_FIXED, 'Fixed Amount'),
    ]

    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default=TYPE_PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True, help_text="Total times coupon can be used")
    times_used = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == self.TYPE_PERCENTAGE else ' TND'})"

    def is_valid(self, subtotal=0):
        now = timezone.now()
        if not self.is_active:
            return False, "This coupon is not active."
        if self.start_date and now < self.start_date:
            return False, "This coupon has not started yet."
        if self.end_date and now > self.end_date:
            return False, "This coupon has expired."
        if self.usage_limit and self.times_used >= self.usage_limit:
            return False, "This coupon has reached its usage limit."
        if Decimal(str(subtotal)) < self.min_order_amount:
            return False, f"Minimum order amount of {self.min_order_amount} required for this coupon."
        return True, "Coupon is valid."

    def calculate_discount(self, subtotal):
        valid, msg = self.is_valid(subtotal)
        if not valid:
            return Decimal('0.00'), msg
        subtotal_dec = Decimal(str(subtotal))
        if self.discount_type == self.TYPE_PERCENTAGE:
            discount = (subtotal_dec * self.discount_value) / Decimal('100.00')
        else:
            discount = self.discount_value

        if self.max_discount_amount and discount > self.max_discount_amount:
            discount = self.max_discount_amount

        # Never let discount exceed subtotal
        if discount > subtotal_dec:
            discount = subtotal_dec

        return round(discount, 2), "Discount applied successfully."
