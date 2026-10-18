from django.urls import path, re_path
from .views import CartView, CartItemDetailView

urlpatterns = [
    re_path(r'^/?$', CartView.as_view(), name='cart-detail'),
    re_path(r'^items/(?P<item_id>\d+)/?$', CartItemDetailView.as_view(), name='cart-item-detail'),
]
