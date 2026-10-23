from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContactMessageCreateView, NewsletterSubscribeView,
    AdminContactMessageViewSet, AdminNewsletterListView
)

router = DefaultRouter(trailing_slash=False)
router.register(r'admin/messages', AdminContactMessageViewSet, basename='admin-contact-messages')

urlpatterns = [
    path('', ContactMessageCreateView.as_view(), name='contact-create'),
    path('newsletter/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    path('admin/subscribers/', AdminNewsletterListView.as_view(), name='admin-subscribers'),
    path('', include(router.urls)),
]
