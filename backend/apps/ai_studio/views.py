import time
from rest_framework import views, viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import AIJob, AssetLibrary, AISetting
from .serializers import AIJobSerializer, AssetLibrarySerializer, AISettingSerializer
from .services.ai_engine import AIEngine
from apps.catalog.models import Product, ProductImage
from apps.accounts.permissions import IsStaffOrAdmin

class PromptEnhanceView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        raw_prompt = request.data.get('prompt', '').strip()
        if not raw_prompt:
            return Response({"error": "Prompt cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        
        enhanced = AIEngine.enhance_prompt(raw_prompt)
        return Response({
            "original_prompt": raw_prompt,
            "enhanced_prompt": enhanced
        })

class TextToImageView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        if not prompt:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

        negative_prompt = request.data.get('negative_prompt', '')
        aspect_ratio = request.data.get('aspect_ratio', '1:1')
        style = request.data.get('style', 'editorial')
        count = int(request.data.get('count', 1))

        start_time = time.time()
        job = AIJob.objects.create(
            user=request.user,
            job_type=AIJob.TYPE_TEXT_TO_IMAGE,
            status=AIJob.STATUS_PROCESSING,
            prompt=prompt,
            negative_prompt=negative_prompt,
            parameters={'aspect_ratio': aspect_ratio, 'style': style, 'count': count}
        )

        try:
            results = AIEngine.generate_text_to_image(
                prompt=prompt,
                negative_prompt=negative_prompt,
                aspect_ratio=aspect_ratio,
                style=style,
                count=count
            )
            duration = round(time.time() - start_time, 2)
            
            job.status = AIJob.STATUS_COMPLETED
            job.result_assets = results
            job.duration_seconds = duration
            job.completed_at = timezone.now()
            job.save()

            # Save generated results to Asset Library
            created_assets = []
            for item in results:
                asset = AssetLibrary.objects.create(
                    title=f"AI Visual - {prompt[:40]}...",
                    asset_type=AssetLibrary.TYPE_IMAGE,
                    file_url=item['url'],
                    prompt=prompt,
                    provider=item.get('provider', 'AI Engine'),
                    dimensions=item.get('dimensions', '1024x1024')
                )
                created_assets.append(AssetLibrarySerializer(asset).data)

            return Response({
                "job": AIJobSerializer(job).data,
                "assets": created_assets
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            job.status = AIJob.STATUS_FAILED
            job.error_message = str(e)
            job.save()
            return Response({"error": str(e), "job_id": job.id}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProductExtractorView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        image_url = request.data.get('image_url', '')
        image_file = request.FILES.get('image', None)
        background_type = request.data.get('background', 'transparent')

        start_time = time.time()
        job = AIJob.objects.create(
            user=request.user,
            job_type=AIJob.TYPE_EXTRACT_PRODUCT,
            status=AIJob.STATUS_PROCESSING,
            input_image=image_file,
            input_image_url=image_url,
            parameters={'background': background_type}
        )

        results = AIEngine.extract_product(image_url=image_url or (job.input_image.url if job.input_image else ''), background_type=background_type)
        duration = round(time.time() - start_time, 2)

        job.status = AIJob.STATUS_COMPLETED
        job.result_assets = results
        job.duration_seconds = duration
        job.completed_at = timezone.now()
        job.save()

        asset = AssetLibrary.objects.create(
            title="Extracted Product Isolation",
            asset_type=AssetLibrary.TYPE_SEGMENTED_PNG,
            file_url=results[0]['extracted_url'],
            provider='KleinVision Extractor'
        )

        return Response({
            "job": AIJobSerializer(job).data,
            "asset": AssetLibrarySerializer(asset).data,
            "results": results
        })

class ProductAssistantVisionView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        image_url = request.data.get('image_url', '')
        image_file = request.FILES.get('image', None)

        job = AIJob.objects.create(
            user=request.user,
            job_type=AIJob.TYPE_PRODUCT_ASSISTANT,
            status=AIJob.STATUS_PROCESSING,
            input_image=image_file,
            input_image_url=image_url
        )

        effective_url = image_url or (job.input_image.url if job.input_image else '')
        analysis = AIEngine.analyze_product_vision(effective_url)

        job.status = AIJob.STATUS_COMPLETED
        job.result_assets = [analysis]
        job.completed_at = timezone.now()
        job.save()

        return Response({
            "job_id": job.id,
            "analysis": analysis,
            "draft_ready": True
        })

class ImagePackageView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        image_url = request.data.get('image_url', '')
        prompt = request.data.get('prompt', '')

        package = AIEngine.generate_image_package(image_url=image_url, prompt=prompt)
        
        job = AIJob.objects.create(
            user=request.user,
            job_type=AIJob.TYPE_IMAGE_PACKAGE,
            status=AIJob.STATUS_COMPLETED,
            prompt=prompt,
            result_assets=package,
            completed_at=timezone.now()
        )

        return Response({
            "job_id": job.id,
            "package": package
        })

class ImageTo3DView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        image_url = request.data.get('image_url', '')
        prompt = request.data.get('prompt', '')
        format_type = request.data.get('format', 'GLB')

        start_time = time.time()
        job = AIJob.objects.create(
            user=request.user,
            job_type=AIJob.TYPE_IMAGE_TO_3D,
            status=AIJob.STATUS_PROCESSING,
            prompt=prompt,
            input_image_url=image_url,
            parameters={'format': format_type}
        )

        result_3d = AIEngine.generate_3d_model(image_url=image_url, prompt=prompt, format=format_type)
        duration = round(time.time() - start_time, 2)

        job.status = AIJob.STATUS_COMPLETED
        job.result_assets = [result_3d]
        job.duration_seconds = duration
        job.completed_at = timezone.now()
        job.save()

        # Save to Asset Library
        asset = AssetLibrary.objects.create(
            title=result_3d.get('title', '3D Model Reconstruction'),
            asset_type=AssetLibrary.TYPE_MODEL_3D,
            file_url=result_3d['model_url'],
            prompt=prompt,
            provider=result_3d.get('provider', '3D Neural Engine'),
            file_size=result_3d.get('file_size', '3.2 MB')
        )

        return Response({
            "job": AIJobSerializer(job).data,
            "asset": AssetLibrarySerializer(asset).data,
            "model_3d": result_3d
        }, status=status.HTTP_201_CREATED)

class AssetLibraryViewSet(viewsets.ModelViewSet):
    queryset = AssetLibrary.objects.all().order_by('-created_at')
    serializer_class = AssetLibrarySerializer
    permission_classes = [IsStaffOrAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        asset_type = self.request.query_params.get('asset_type', None)
        if asset_type:
            queryset = queryset.filter(asset_type=asset_type)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset

    @action(detail=True, methods=['post'])
    def attach_to_product(self, request, pk=None):
        asset = self.get_object()
        product_id = request.data.get('product_id')
        is_primary = request.data.get('is_primary', False)

        product = get_object_or_404(Product, id=product_id)
        asset.product = product
        asset.save(update_fields=['product'])

        if asset.asset_type == AssetLibrary.TYPE_MODEL_3D:
            product.model_3d_url = asset.file_url
            product.save(update_fields=['model_3d_url'])
        else:
            ProductImage.objects.create(
                product=product,
                image_url=asset.file_url,
                alt_text=asset.title,
                is_primary=is_primary,
                is_ai_generated=asset.is_ai_generated
            )

        return Response({"message": f"Asset successfully linked to product '{product.name}'."})

class AIJobHistoryListView(generics.ListAPIView):
    queryset = AIJob.objects.all().order_by('-created_at')
    serializer_class = AIJobSerializer
    permission_classes = [IsStaffOrAdmin]

class AISettingsStatusView(views.APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        providers = AIEngine.get_configured_providers()
        settings_objs = AISetting.objects.all()
        return Response({
            "configured_api_keys": providers,
            "settings": AISettingSerializer(settings_objs, many=True).data
        })
