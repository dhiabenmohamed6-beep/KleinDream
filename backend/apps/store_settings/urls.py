from django.urls import path
from .views import PublicStoreSettingView, AdminStoreSettingView

urlpatterns = [
    path('public/', PublicStoreSettingView.as_view(), name='settings-public'),
    path('admin/', AdminStoreSettingView.as_view(), name='settings-admin'),
]
