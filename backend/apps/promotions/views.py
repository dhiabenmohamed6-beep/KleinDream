from rest_framework import viewsets, views, status, permissions
from rest_framework.response import Response
from .models import Coupon
from .serializers import CouponSerializer, CouponValidateSerializer
from apps.accounts.permissions import IsStaffOrAdmin

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [IsStaffOrAdmin]

class ValidateCouponView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code'].strip().upper()
        subtotal = serializer.validated_data['subtotal']

        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            return Response({"valid": False, "message": "Invalid coupon code."}, status=status.HTTP_404_NOT_FOUND)

        discount, message = coupon.calculate_discount(subtotal)
        is_valid, _ = coupon.is_valid(subtotal)

        if not is_valid:
            return Response({"valid": False, "message": message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "valid": True,
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value,
            "discount_amount": discount,
            "message": message
        })
