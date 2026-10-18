from rest_framework import serializers
from .models import ContactMessage, NewsletterSubscriber

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'is_read', 'status', 'internal_notes', 'created_at']
        read_only_fields = ['id', 'is_read', 'status', 'internal_notes', 'created_at']

class AdminContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'is_active', 'created_at']
        read_only_fields = ['id', 'is_active', 'created_at']
