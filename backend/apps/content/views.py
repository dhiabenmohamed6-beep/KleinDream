from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import AnnouncementBar, HeroBanner, HomepageSection
from .serializers import AnnouncementBarSerializer, HeroBannerSerializer, HomepageSectionSerializer
from apps.accounts.permissions import IsStaffOrAdmin, IsAdminUserOrReadOnly

class AnnouncementBarViewSet(viewsets.ModelViewSet):
    queryset = AnnouncementBar.objects.all()
    serializer_class = AnnouncementBarSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def list(self, request, *args, **kwargs):
        active_bar = AnnouncementBar.objects.filter(is_active=True).first()
        if active_bar:
            return Response(AnnouncementBarSerializer(active_bar).data)
        return Response({})

class HeroBannerViewSet(viewsets.ModelViewSet):
    queryset = HeroBanner.objects.all()
    serializer_class = HeroBannerSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def get_queryset(self):
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.is_staff_member):
            return HeroBanner.objects.filter(is_active=True).order_by('display_order')
        return HeroBanner.objects.all().order_by('display_order')

class HomepageSectionViewSet(viewsets.ModelViewSet):
    queryset = HomepageSection.objects.all().order_by('display_order')
    serializer_class = HomepageSectionSerializer
    permission_classes = [IsAdminUserOrReadOnly]
