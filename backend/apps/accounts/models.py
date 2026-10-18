from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CUSTOMER = 'CUSTOMER'
    ROLE_ADMIN = 'ADMIN'
    ROLE_STAFF = 'STAFF'
    ROLE_INVENTORY = 'INVENTORY_MGR'
    ROLE_SUPPORT = 'SUPPORT'

    ROLE_CHOICES = [
        (ROLE_CUSTOMER, 'Customer'),
        (ROLE_ADMIN, 'Administrator / Store Owner'),
        (ROLE_STAFF, 'Staff Member'),
        (ROLE_INVENTORY, 'Inventory Manager'),
        (ROLE_SUPPORT, 'Customer Support'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_CUSTOMER)
    phone = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_store_admin(self):
        return self.is_superuser or self.role == self.ROLE_ADMIN

    @property
    def is_staff_member(self):
        return self.is_superuser or self.role in [
            self.ROLE_ADMIN, self.ROLE_STAFF, self.ROLE_INVENTORY, self.ROLE_SUPPORT
        ]

class UserAddress(models.Model):
    user = models.ForeignKey(User, related_name='addresses', on_delete=models.CASCADE)
    title = models.CharField(max_length=50, default='Home')
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='Tunisia')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.full_name}, {self.city}"

    def save(self, *args, **kwargs):
        if self.is_default:
            UserAddress.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
