from django.db import models

class AnnouncementBar(models.Model):
    text = models.CharField(max_length=255, default="Enjoy complimentary shipping on orders over 150 TND | KleinDream Maison")
    link = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    background_color = models.CharField(max_length=30, default="#202124")
    text_color = models.CharField(max_length=30, default="#FFFFFF")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Announcement ({'Active' if self.is_active else 'Disabled'})"

class HeroBanner(models.Model):
    title = models.CharField(max_length=255, default="Find Your Style. Live Your Dream.")
    subtitle = models.TextField(default="Discover fashion, accessories, and everyday essentials curated for every style, every age, and every moment.")
    cta_text = models.CharField(max_length=50, default="Shop Women")
    cta_link = models.CharField(max_length=150, default="/shop?audience=WOMEN")
    secondary_cta_text = models.CharField(max_length=50, default="Shop Men")
    secondary_cta_link = models.CharField(max_length=150, default="/shop?audience=MEN")
    image = models.ImageField(upload_to='banners/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, default="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop")
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return self.title

class HomepageSection(models.Model):
    section_key = models.CharField(max_length=50, unique=True) # categories, new_arrivals, trending, bestsellers, campaign, trust_info, newsletter
    title = models.CharField(max_length=150)
    subtitle = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    extra_config = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.title} ({self.section_key})"
