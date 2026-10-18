from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnnouncementBarViewSet, HeroBannerViewSet, HomepageSectionViewSet

router = DefaultRouter()
router.register(r'announcement', AnnouncementBarViewSet, basename='announcement')
router.register(r'hero-banners', HeroBannerViewSet, basename='hero-banner')
router.register(r'sections', HomepageSectionViewSet, basename='homepage-section')

urlpatterns = [
    path('', include(router.urls)),
]
