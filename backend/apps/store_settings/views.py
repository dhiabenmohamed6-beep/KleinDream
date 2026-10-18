from rest_framework import views, permissions, status
from rest_framework.response import Response
from .models import StoreSetting
from .serializers import StoreSettingSerializer, PublicStoreSettingSerializer
from apps.accounts.permissions import IsStoreAdmin

class PublicStoreSettingView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings = StoreSetting.get_settings()
        return Response(PublicStoreSettingSerializer(settings).data)

class AdminStoreSettingView(views.APIView):
    permission_classes = [IsStoreAdmin]

    def get(self, request):
        settings = StoreSetting.get_settings()
        return Response(StoreSettingSerializer(settings).data)

    def put(self, request):
        settings = StoreSetting.get_settings()
        serializer = StoreSettingSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
