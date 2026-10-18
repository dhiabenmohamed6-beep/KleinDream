from rest_framework import serializers
from .models import AIJob, AssetLibrary, AISetting

class AIJobSerializer(serializers.ModelSerializer):
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AIJob
        fields = [
            'id', 'job_type', 'job_type_display', 'status', 'status_display',
            'prompt', 'negative_prompt', 'provider', 'model', 'input_image',
            'input_image_url', 'parameters', 'result_assets', 'output_3d_file',
            'error_message', 'duration_seconds', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'status', 'result_assets', 'error_message', 'duration_seconds', 'created_at', 'completed_at']

class AssetLibrarySerializer(serializers.ModelSerializer):
    asset_type_display = serializers.CharField(source='get_asset_type_display', read_only=True)
    display_url = serializers.ReadOnlyField()
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = AssetLibrary
        fields = [
            'id', 'title', 'asset_type', 'asset_type_display', 'file',
            'file_url', 'display_url', 'prompt', 'provider', 'model',
            'dimensions', 'file_size', 'is_ai_generated', 'product',
            'product_name', 'created_at'
        ]
        read_only_fields = ['id', 'display_url', 'created_at']

class AISettingSerializer(serializers.ModelSerializer):
    provider_name_display = serializers.CharField(source='get_provider_name_display', read_only=True)

    class Meta:
        model = AISetting
        fields = [
            'id', 'provider_name', 'provider_name_display', 'is_enabled',
            'default_model', 'monthly_budget_usd', 'current_month_usage_usd', 'updated_at'
        ]
