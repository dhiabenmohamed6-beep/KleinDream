import uuid
from django.db import models
from django.conf import settings
from apps.catalog.models import Product

class AIJob(models.Model):
    TYPE_TEXT_TO_IMAGE = 'TEXT_TO_IMAGE'
    TYPE_IMAGE_TO_IMAGE = 'IMAGE_TO_IMAGE'
    TYPE_EXTRACT_PRODUCT = 'EXTRACT_PRODUCT'
    TYPE_PRODUCT_ASSISTANT = 'PRODUCT_ASSISTANT'
    TYPE_IMAGE_PACKAGE = 'IMAGE_PACKAGE'
    TYPE_CAMPAIGN_CREATOR = 'CAMPAIGN_CREATOR'
    TYPE_IMAGE_TO_3D = 'IMAGE_TO_3D'

    JOB_TYPES = [
        (TYPE_TEXT_TO_IMAGE, 'Text to Image Generation'),
        (TYPE_IMAGE_TO_IMAGE, 'Image to Image Transformation'),
        (TYPE_EXTRACT_PRODUCT, 'Product Extractor / Background Isolation'),
        (TYPE_PRODUCT_ASSISTANT, 'AI Product Vision Assistant'),
        (TYPE_IMAGE_PACKAGE, 'Automatic Product Image Package'),
        (TYPE_CAMPAIGN_CREATOR, 'Marketing Campaign Visual Creator'),
        (TYPE_IMAGE_TO_3D, 'Image to 3D Model Generation'),
    ]

    STATUS_QUEUED = 'QUEUED'
    STATUS_PROCESSING = 'PROCESSING'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_FAILED = 'FAILED'

    STATUS_CHOICES = [
        (STATUS_QUEUED, 'Queued'),
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_FAILED, 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='ai_jobs', on_delete=models.SET_NULL, null=True)
    job_type = models.CharField(max_length=40, choices=JOB_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_QUEUED)
    
    prompt = models.TextField(blank=True)
    negative_prompt = models.TextField(blank=True)
    provider = models.CharField(max_length=50, default='klein-ai-engine')
    model = models.CharField(max_length=100, blank=True)
    
    input_image = models.ImageField(upload_to='ai_studio/inputs/', blank=True, null=True)
    input_image_url = models.URLField(max_length=500, blank=True)
    
    parameters = models.JSONField(default=dict, blank=True)
    result_assets = models.JSONField(default=list, blank=True) # list of generated assets
    output_3d_file = models.FileField(upload_to='ai_studio/3d_models/', blank=True, null=True)
    
    error_message = models.TextField(blank=True)
    duration_seconds = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_job_type_display()} [{self.status}] - {self.id}"

class AssetLibrary(models.Model):
    TYPE_IMAGE = 'IMAGE'
    TYPE_SEGMENTED_PNG = 'SEGMENTED_PNG'
    TYPE_MODEL_3D = 'MODEL_3D'
    TYPE_BANNER = 'BANNER'

    ASSET_TYPES = [
        (TYPE_IMAGE, 'Product / Studio Image'),
        (TYPE_SEGMENTED_PNG, 'Extracted Product (Transparent PNG)'),
        (TYPE_MODEL_3D, '3D Interactive Model (GLB)'),
        (TYPE_BANNER, 'Campaign Marketing Banner'),
    ]

    title = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=30, choices=ASSET_TYPES, default=TYPE_IMAGE)
    file = models.FileField(upload_to='ai_studio/assets/', blank=True, null=True)
    file_url = models.URLField(max_length=600, blank=True)
    
    prompt = models.TextField(blank=True)
    provider = models.CharField(max_length=50, blank=True)
    model = models.CharField(max_length=100, blank=True)
    dimensions = models.CharField(max_length=50, blank=True)
    file_size = models.CharField(max_length=50, blank=True)
    
    is_ai_generated = models.BooleanField(default=True)
    product = models.ForeignKey(Product, related_name='ai_assets', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_asset_type_display()})"

    @property
    def display_url(self):
        if self.file:
            return self.file.url
        return self.file_url

class AISetting(models.Model):
    PROVIDER_OPENAI = 'OPENAI'
    PROVIDER_STABILITY = 'STABILITY'
    PROVIDER_REPLICATE = 'REPLICATE'
    PROVIDER_MESHY = 'MESHY'
    PROVIDER_HUGGINGFACE = 'HUGGINGFACE'

    PROVIDER_CHOICES = [
        (PROVIDER_OPENAI, 'OpenAI (DALL-E 3 & GPT-4o)'),
        (PROVIDER_STABILITY, 'Stability AI (SD3 / Core / Inpainting)'),
        (PROVIDER_REPLICATE, 'Replicate (Flux / Rembg / 3D)'),
        (PROVIDER_MESHY, 'Meshy AI (Image-to-3D GLB Engine)'),
        (PROVIDER_HUGGINGFACE, 'Hugging Face Inference API'),
    ]

    provider_name = models.CharField(max_length=40, choices=PROVIDER_CHOICES, unique=True)
    is_enabled = models.BooleanField(default=True)
    default_model = models.CharField(max_length=100, blank=True)
    monthly_budget_usd = models.DecimalField(max_digits=8, decimal_places=2, default=50.00)
    current_month_usage_usd = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_provider_name_display()} ({'Enabled' if self.is_enabled else 'Disabled'})"
