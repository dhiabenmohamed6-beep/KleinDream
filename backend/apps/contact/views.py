from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from .models import ContactMessage, NewsletterSubscriber
from .serializers import (
    ContactMessageSerializer, AdminContactMessageSerializer, NewsletterSubscriberSerializer
)
from apps.accounts.permissions import IsStaffOrAdmin

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

class NewsletterSubscribeView(generics.CreateAPIView):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({"error": "Valid email address is required."}, status=status.HTTP_400_BAD_REQUEST)
        sub, created = NewsletterSubscriber.objects.get_or_create(email=email)
        if not created and not sub.is_active:
            sub.is_active = True
            sub.save()
        return Response({"message": "Thank you for subscribing to KleinDream privileges."}, status=status.HTTP_201_CREATED)

class AdminContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = AdminContactMessageSerializer
    permission_classes = [IsStaffOrAdmin]

class AdminNewsletterListView(generics.ListAPIView):
    queryset = NewsletterSubscriber.objects.all().order_by('-created_at')
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [IsStaffOrAdmin]
