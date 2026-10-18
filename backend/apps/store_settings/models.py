from django.db import models
from decimal import Decimal

class StoreSetting(models.Model):
    store_name = models.CharField(max_length=100, default="KleinDream")
    tagline = models.CharField(max_length=200, default="Modern Fashion & Lifestyle Maison")
    contact_email = models.EmailField(default="concierge@kleindream.com")
    contact_phone = models.CharField(max_length=50, default="+216 71 890 123")
    address = models.CharField(max_length=255, default="Les Berges du Lac II, Tunis, Tunisia")
    currency = models.CharField(max_length=10, default="TND")
    currency_symbol = models.CharField(max_length=10, default="DT")
    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('150.00'))
    flat_shipping_rate = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('7.00'))
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    maintenance_mode = models.BooleanField(default=False)
    
    # Social links
    social_instagram = models.URLField(blank=True, default="https://instagram.com/kleindream")
    social_facebook = models.URLField(blank=True, default="https://facebook.com/kleindream")
    social_tiktok = models.URLField(blank=True, default="https://tiktok.com/@kleindream")
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.store_name} Settings ({self.currency})"

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj
