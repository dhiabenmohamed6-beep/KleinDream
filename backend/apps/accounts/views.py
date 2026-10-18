from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import UserAddress
from .serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer, AddressSerializer
)
from .permissions import IsStoreAdmin, IsStaffOrAdmin

User = get_user_model()

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

# Admin endpoints
class AdminCustomerListView(generics.ListAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.filter(role=User.ROLE_CUSTOMER).order_by('-created_at')
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                models.Q(email__icontains=search) |
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search)
            )
        return queryset

class AdminStaffListView(generics.ListCreateAPIView):
    permission_classes = [IsStoreAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.exclude(role=User.ROLE_CUSTOMER).order_by('-created_at')
