from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CheckoutView, CustomerOrderListView, OrderDetailView, AdminOrderViewSet

router = DefaultRouter()
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-order')

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('my-orders/', CustomerOrderListView.as_view(), name='customer-orders'),
    path('<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),
    path('', include(router.urls)),
]
