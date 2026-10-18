from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomLoginView, RegisterView, ProfileView, AddressViewSet,
    AdminCustomerListView, AdminStaffListView
)

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    re_path(r'^login/?$', CustomLoginView.as_view(), name='auth-login'),
    re_path(r'^refresh/?$', TokenRefreshView.as_view(), name='auth-refresh'),
    re_path(r'^register/?$', RegisterView.as_view(), name='auth-register'),
    re_path(r'^profile/?$', ProfileView.as_view(), name='auth-profile'),
    path('', include(router.urls)),
    # Admin staff & customer management
    path('admin/customers/', AdminCustomerListView.as_view(), name='admin-customers'),
    path('admin/staff/', AdminStaffListView.as_view(), name='admin-staff'),
]
