from django.db import models
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserAddress

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    is_store_admin = serializers.ReadOnlyField()
    is_staff_member = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'avatar', 'is_email_verified',
            'is_store_admin', 'is_staff_member', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'role']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.CharField(required=False, write_only=True)
        self.fields['username'] = serializers.CharField(required=False, write_only=True)

    def validate(self, attrs):
        identifier = (attrs.get('email') or attrs.get('username') or '').strip()
        password = attrs.get('password')

        if not identifier:
            raise serializers.ValidationError({"email": "Email address or username is required."})
        if not password:
            raise serializers.ValidationError({"password": "Password is required."})

        # Match user by email or username (case-insensitive)
        user = User.objects.filter(
            models.Q(email__iexact=identifier) | models.Q(username__iexact=identifier)
        ).first()

        if user is None or not user.check_password(password):
            raise serializers.ValidationError({
                "detail": "Invalid credentials. Please verify your email and password."
            })

        if not user.is_active:
            raise serializers.ValidationError({
                "detail": "This account is inactive. Please contact concierge support."
            })

        self.user = user
        refresh = self.get_token(self.user)

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(self.user).data
        }
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'phone']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            role=User.ROLE_CUSTOMER
        )
        return user

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = [
            'id', 'title', 'full_name', 'phone', 'address_line_1',
            'address_line_2', 'city', 'state', 'postal_code',
            'country', 'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
