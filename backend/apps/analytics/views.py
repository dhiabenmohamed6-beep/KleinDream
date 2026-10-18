from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order, OrderItem
from apps.catalog.models import Product, ProductVariant
from apps.accounts.models import User
from apps.accounts.permissions import IsStaffOrAdmin

class DashboardOverviewView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        now = timezone.now()
        start_date = now - timedelta(days=days)

        # Base orders query (excluding cancelled for revenue)
        valid_orders = Order.objects.exclude(status=Order.STATUS_CANCELLED)
        recent_period_orders = valid_orders.filter(created_at__gte=start_date)

        total_sales = recent_period_orders.aggregate(total=Sum('total'))['total'] or 0.00
        all_time_sales = valid_orders.aggregate(total=Sum('total'))['total'] or 0.00

        total_orders_count = Order.objects.count()
        period_orders_count = Order.objects.filter(created_at__gte=start_date).count()

        # Orders by status
        status_counts = {}
        for status_code, status_label in Order.STATUS_CHOICES:
            status_counts[status_code] = Order.objects.filter(status=status_code).count()

        total_customers = User.objects.filter(role=User.ROLE_CUSTOMER).count()
        active_products = Product.objects.filter(is_active=True).count()

        # Low stock and out of stock variants
        low_stock_count = ProductVariant.objects.filter(
            stock_quantity__lte=F('low_stock_threshold'),
            stock_quantity__gt=0,
            is_active=True
        ).count()
        out_of_stock_count = ProductVariant.objects.filter(
            stock_quantity__lte=0,
            is_active=True
        ).count()

        # Bestselling products
        top_items = OrderItem.objects.filter(order__created_at__gte=start_date)\
            .values('product_name', 'product__id', 'product__slug', 'image_url')\
            .annotate(units_sold=Sum('quantity'), revenue=Sum('line_total'))\
            .order_by('-units_sold')[:5]

        # Daily sales trend for the chart
        daily_trends = []
        for i in range(days - 1, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            day_orders = valid_orders.filter(created_at__gte=day_start, created_at__lt=day_end)
            day_sales = day_orders.aggregate(total=Sum('total'))['total'] or 0.00
            daily_trends.append({
                'date': day_start.strftime('%b %d'),
                'sales': float(day_sales),
                'orders': day_orders.count()
            })

        # Recent 5 orders
        recent_orders = []
        for o in Order.objects.all().order_by('-created_at')[:5]:
            recent_orders.append({
                'id': o.id,
                'order_number': o.order_number,
                'customer_name': o.customer_name,
                'customer_email': o.customer_email,
                'status': o.status,
                'status_display': o.get_status_display(),
                'total': float(o.total),
                'currency': o.currency,
                'created_at': o.created_at
            })

        return Response({
            'period_days': days,
            'total_sales': float(total_sales),
            'all_time_sales': float(all_time_sales),
            'period_orders_count': period_orders_count,
            'total_orders_count': total_orders_count,
            'total_customers': total_customers,
            'active_products': active_products,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
            'status_counts': status_counts,
            'top_products': list(top_items),
            'sales_trends': daily_trends,
            'recent_orders': recent_orders
        })
