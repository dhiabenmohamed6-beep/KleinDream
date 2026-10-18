from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PromptEnhanceView, TextToImageView, ProductExtractorView,
    ProductAssistantVisionView, ImagePackageView, ImageTo3DView,
    AssetLibraryViewSet, AIJobHistoryListView, AISettingsStatusView
)

router = DefaultRouter()
router.register(r'assets', AssetLibraryViewSet, basename='ai-asset')

urlpatterns = [
    path('enhance-prompt/', PromptEnhanceView.as_view(), name='ai-enhance-prompt'),
    path('generate-image/', TextToImageView.as_view(), name='ai-generate-image'),
    path('extract-product/', ProductExtractorView.as_view(), name='ai-extract-product'),
    path('vision-assistant/', ProductAssistantVisionView.as_view(), name='ai-vision-assistant'),
    path('image-package/', ImagePackageView.as_view(), name='ai-image-package'),
    path('image-to-3d/', ImageTo3DView.as_view(), name='ai-image-to-3d'),
    path('history/', AIJobHistoryListView.as_view(), name='ai-job-history'),
    path('settings/', AISettingsStatusView.as_view(), name='ai-settings-status'),
    path('', include(router.urls)),
]
