from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),
    
    # REST API v1
    re_path(r'^api/v1/auth/', include('apps.accounts.urls')),
    re_path(r'^api/v1/catalog/', include('apps.catalog.urls')),
    re_path(r'^api/v1/inventory/', include('apps.inventory.urls')),
    re_path(r'^api/v1/promotions/', include('apps.promotions.urls')),
    re_path(r'^api/v1/cart/?', include('apps.cart.urls')),
    re_path(r'^api/v1/orders/', include('apps.orders.urls')),
    re_path(r'^api/v1/content/', include('apps.content.urls')),
    re_path(r'^api/v1/contact/', include('apps.contact.urls')),
    re_path(r'^api/v1/settings/', include('apps.store_settings.urls')),
    re_path(r'^api/v1/analytics/', include('apps.analytics.urls')),
    re_path(r'^api/v1/ai-studio/', include('apps.ai_studio.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
