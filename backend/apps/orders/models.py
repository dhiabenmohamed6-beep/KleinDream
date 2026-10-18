import uuid
from django.db import models
from django.conf import settings
from decimal import Decimal
from apps.catalog.models import Product, ProductVariant

class Order(models.Model):
    STATUS_PENDING = 'PENDING'
    STATUS_CONFIRMED = 'CONFIRMED'
    STATUS_PROCESSING = 'PROCESSING'
    STATUS_SHIPPED = 'SHIPPED'
    STATUS_DELIVERED = 'DELIVERED'
    STATUS_CANCELLED = 'CANCELLED'
    STATUS_RETURNED = 'RETURNED'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending Review'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_SHIPPED, 'Shipped'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_RETURNED, 'Returned'),
    ]

    PAYMENT_UNPAID = 'UNPAID'
    PAYMENT_PAID = 'PAID'
    PAYMENT_REFUNDED = 'REFUNDED'

    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_UNPAID, 'Unpaid'),
        (PAYMENT_PAID, 'Paid'),
        (PAYMENT_REFUNDED, 'Refunded'),
    ]

    METHOD_COD = 'CASH_ON_DELIVERY'
    METHOD_BANK = 'BANK_TRANSFER'
    METHOD_ONLINE = 'ONLINE_GATEWAY'

    PAYMENT_METHOD_CHOICES = [
        (METHOD_COD, 'Cash on Delivery'),
        (METHOD_BANK, 'Bank Wire Transfer'),
        (METHOD_ONLINE, 'Credit Card / Online Gateway'),
    ]

    order_number = models.CharField(max_length=40, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='orders', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Guest customer info if not logged in
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=30)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_PENDING)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default=PAYMENT_UNPAID)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default=METHOD_COD)

    # Shipping Address snapshot
    shipping_address = models.JSONField(default=dict)
    shipping_method = models.CharField(max_length=100, default='Standard Courier')
    shipping_carrier = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)

    # Server-calculated financial amounts
    currency = models.CharField(max_length=10, default='TND')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=12, decimal_places=2)

    coupon_code = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True, help_text="Customer order notes")
    internal_notes = models.TextField(blank=True, help_text="Admin internal notes")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} ({self.total} {self.currency}) - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            uid = uuid.uuid4().hex[:6].upper()
            from django.utils import timezone
            date_prefix = timezone.now().strftime('%y%m%d')
            self.order_number = f"KD-{date_prefix}-{uid}"
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.SET_NULL, null=True)
    variant = models.ForeignKey(ProductVariant, related_name='order_items', on_delete=models.SET_NULL, null=True)
    
    # Immutable snapshot fields
    product_name = models.CharField(max_length=255)
    variant_name = models.CharField(max_length=150)
    sku = models.CharField(max_length=100)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} ({self.variant_name}) in {self.order.order_number}"
