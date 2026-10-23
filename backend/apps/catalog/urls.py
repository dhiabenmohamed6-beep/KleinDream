from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, CollectionViewSet, ReviewViewSet

router_no_slash = DefaultRouter(trailing_slash=False)
router_no_slash.register(r'categories', CategoryViewSet, basename='category-no-slash')
router_no_slash.register(r'products', ProductViewSet, basename='product-no-slash')
router_no_slash.register(r'collections', CollectionViewSet, basename='collection-no-slash')
router_no_slash.register(r'reviews', ReviewViewSet, basename='review-no-slash')

router_slash = DefaultRouter(trailing_slash=True)
router_slash.register(r'categories', CategoryViewSet, basename='category')
router_slash.register(r'products', ProductViewSet, basename='product')
router_slash.register(r'collections', CollectionViewSet, basename='collection')
router_slash.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router_slash.urls)),
    path('', include(router_no_slash.urls)),
]
