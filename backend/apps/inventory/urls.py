from django.urls import path
from .views import StockMovementListView, InventoryVariantListView, StockAdjustmentView

urlpatterns = [
    path('variants/', InventoryVariantListView.as_view(), name='inventory-variants'),
    path('movements/', StockMovementListView.as_view(), name='inventory-movements'),
    path('adjust/', StockAdjustmentView.as_view(), name='inventory-adjust'),
]
