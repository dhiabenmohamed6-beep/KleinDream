from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Category(models.Model):
    AUDIENCE_ALL = 'ALL'
    AUDIENCE_WOMEN = 'WOMEN'
    AUDIENCE_MEN = 'MEN'
    AUDIENCE_KIDS = 'KIDS'
    AUDIENCE_UNISEX = 'UNISEX'

    AUDIENCE_CHOICES = [
        (AUDIENCE_ALL, 'All Audiences'),
        (AUDIENCE_WOMEN, 'Women'),
        (AUDIENCE_MEN, 'Men'),
        (AUDIENCE_KIDS, 'Kids'),
        (AUDIENCE_UNISEX, 'Unisex'),
    ]

    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True)
    banner = models.ImageField(upload_to='categories/banners/', blank=True, null=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories'
    )
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default=AUDIENCE_ALL)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    seo_title = models.CharField(max_length=150, blank=True)
    seo_description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

class Product(models.Model):
    AUDIENCE_ALL = 'ALL'
    AUDIENCE_WOMEN = 'WOMEN'
    AUDIENCE_MEN = 'MEN'
    AUDIENCE_KIDS = 'KIDS'
    AUDIENCE_UNISEX = 'UNISEX'

    AUDIENCE_CHOICES = [
        (AUDIENCE_ALL, 'All Audiences'),
        (AUDIENCE_WOMEN, 'Women'),
        (AUDIENCE_MEN, 'Men'),
        (AUDIENCE_KIDS, 'Kids'),
        (AUDIENCE_UNISEX, 'Unisex'),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    sku = models.CharField(max_length=80, unique=True)
    barcode = models.CharField(max_length=100, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    categories = models.ManyToManyField(Category, related_name='products')
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default=AUDIENCE_WOMEN)
    
    regular_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)
    
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Weight in kg")
    dimensions = models.CharField(max_length=100, blank=True, help_text="L x W x H in cm")
    
    # 3D Model file (GLB or glTF)
    model_3d = models.FileField(upload_to='products/3d_models/', blank=True, null=True)
    model_3d_url = models.URLField(max_length=500, blank=True, help_text="External or CDN GLB link")

    seo_title = models.CharField(max_length=150, blank=True)
    seo_description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.sku})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def current_price(self):
        if self.sale_price and self.sale_price < self.regular_price:
            return self.sale_price
        return self.regular_price

    @property
    def discount_percent(self):
        if self.sale_price and self.sale_price < self.regular_price:
            diff = self.regular_price - self.sale_price
            return int((diff / self.regular_price) * 100)
        return 0

    @property
    def total_stock(self):
        variants = self.variants.filter(is_active=True)
        if variants.exists():
            return sum(v.stock_quantity for v in variants)
        return 0

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    name = models.CharField(max_length=100) # e.g. "Size M / Noir"
    size = models.CharField(max_length=30, blank=True)
    color_name = models.CharField(max_length=50, blank=True)
    color_hex = models.CharField(max_length=20, blank=True, default="#202124")
    sku = models.CharField(max_length=100, unique=True)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['size', 'color_name']

    def __str__(self):
        return f"{self.product.name} - {self.name}"

    @property
    def price(self):
        if self.price_override is not None:
            return self.price_override
        return self.product.current_price

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/images/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    display_order = models.IntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    is_ai_generated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', '-is_primary', 'id']

    def __str__(self):
        return f"Image {self.id} for {self.product.name}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

class Collection(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='collections/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True)
    products = models.ManyToManyField(Product, related_name='collections', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviews', on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, f"{i} Stars") for i in range(1, 6)])
    title = models.CharField(max_length=150, blank=True)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}* by {self.user.email} on {self.product.name}"
