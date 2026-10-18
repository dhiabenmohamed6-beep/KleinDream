from django.db import models
from django.conf import settings
from apps.catalog.models import ProductVariant

class StockMovement(models.Model):
    TYPE_RESTOCK = 'RESTOCK'
    TYPE_ADJUSTMENT = 'MANUAL_ADJUSTMENT'
    TYPE_SALE = 'ORDER_SALE'
    TYPE_CANCEL = 'ORDER_CANCEL'
    TYPE_RETURN = 'RETURN'

    MOVEMENT_TYPES = [
        (TYPE_RESTOCK, 'Restock'),
        (TYPE_ADJUSTMENT, 'Manual Adjustment'),
        (TYPE_SALE, 'Order Sale Deduction'),
        (TYPE_CANCEL, 'Order Cancel Restoration'),
        (TYPE_RETURN, 'Customer Return Restoration'),
    ]

    variant = models.ForeignKey(ProductVariant, related_name='stock_movements', on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=30, choices=MOVEMENT_TYPES)
    quantity_change = models.IntegerField(help_text="Positive for addition, negative for deduction")
    previous_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    reason = models.CharField(max_length=255, blank=True)
    staff_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='stock_adjustments', on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.variant} - {self.get_movement_type_display()} ({self.quantity_change}) at {self.created_at}"
