from rest_framework import serializers
from .models import StoreSetting

class StoreSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSetting
        fields = '__all__'

class PublicStoreSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSetting
        fields = [
            'store_name', 'tagline', 'contact_email', 'contact_phone',
            'address', 'currency', 'currency_symbol', 'free_shipping_threshold',
            'flat_shipping_rate', 'tax_rate', 'social_instagram', 'social_facebook',
            'social_tiktok'
        ]
