import os
import sys
import django
from decimal import Decimal

# Configure Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kleindream.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps'))
django.setup()

from django.contrib.auth import get_user_model
from apps.catalog.models import Category, Product, ProductVariant, ProductImage, Collection, Review
from apps.content.models import AnnouncementBar, HeroBanner, HomepageSection
from apps.store_settings.models import StoreSetting
from apps.promotions.models import Coupon
from apps.inventory.models import StockMovement
from apps.ai_studio.models import AssetLibrary, AISetting

User = get_user_model()

def seed():
    print("[*] Starting KleinDream Luxury Seeding...")

    # 1. Store Administrator
    admin_user, created = User.objects.get_or_create(
        email='admin@kleindream.com',
        defaults={
            'username': 'klein_admin',
            'first_name': 'Maison',
            'last_name': 'Administrator',
            'role': User.ROLE_ADMIN,
            'is_staff': True,
            'is_superuser': True,
            'is_email_verified': True
        }
    )
    if created:
        admin_user.set_password('KleinDream2026!')
        admin_user.save()
        print("[OK] Created Super Administrator: admin@kleindream.com / KleinDream2026!")

    # 2. Demo Customer
    cust_user, created = User.objects.get_or_create(
        email='customer@kleindream.com',
        defaults={
            'username': 'sophie_laurent',
            'first_name': 'Sophie',
            'last_name': 'Laurent',
            'role': User.ROLE_CUSTOMER,
            'is_email_verified': True
        }
    )
    if created:
        cust_user.set_password('Customer2026!')
        cust_user.save()
        print("[OK] Created Demo Customer: customer@kleindream.com / Customer2026!")

    # 3. Store Settings
    settings = StoreSetting.get_settings()
    settings.store_name = "KleinDream"
    settings.tagline = "Modern Fashion & Lifestyle Maison"
    settings.currency = "TND"
    settings.currency_symbol = "DT"
    settings.contact_email = "concierge@kleindream.com"
    settings.contact_phone = "+216 71 890 123"
    settings.address = "Les Berges du Lac II, Tunis, Tunisia"
    settings.free_shipping_threshold = Decimal('150.00')
    settings.flat_shipping_rate = Decimal('7.00')
    settings.save()
    print("[OK] Configured Store Settings (Currency: TND / DT)")

    # 4. Announcement Bar & Hero Banners
    AnnouncementBar.objects.all().delete()
    AnnouncementBar.objects.create(
        text="Complimentary delivery across Tunisia on all orders over 150 DT | Discover Autumn/Winter Maison Collection",
        link="/shop?audience=WOMEN",
        is_active=True,
        background_color="#202124",
        text_color="#FFFFFF"
    )

    HeroBanner.objects.all().delete()
    HeroBanner.objects.create(
        title="Find Your Style. Live Your Dream.",
        subtitle="Discover fashion, accessories, and everyday essentials for every style, every age, and every moment.",
        cta_text="Shop Women",
        cta_link="/shop?audience=WOMEN",
        secondary_cta_text="Shop Men",
        secondary_cta_link="/shop?audience=MEN",
        image_url="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
        display_order=0,
        is_active=True
    )
    HeroBanner.objects.create(
        title="The Atelier Sneaker Series",
        subtitle="Architectural comfort meets artisanal craftsmanship in our latest monochrome release.",
        cta_text="Explore 3D Shoes",
        cta_link="/shop?category=shoes",
        secondary_cta_text="View Lookbook",
        secondary_cta_link="/shop",
        image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
        display_order=1,
        is_active=True
    )
    print("[OK] Created Announcement & Hero Banners")

    # 5. Dynamic Categories
    Category.objects.all().delete()

    cat_women = Category.objects.create(
        name="Women", slug="women", audience=Category.AUDIENCE_WOMEN, display_order=1,
        description="Contemporary womenswear, tailored coats, refined dresses, and signature essentials.",
        image_url="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
        is_featured=True
    )
    cat_men = Category.objects.create(
        name="Men", slug="men", audience=Category.AUDIENCE_MEN, display_order=2,
        description="Modern menswear, structured tailoring, leather goods, and refined casualwear.",
        image_url="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
        is_featured=True
    )
    cat_kids = Category.objects.create(
        name="Kids", slug="kids", audience=Category.AUDIENCE_KIDS, display_order=3,
        description="Premium, comfortable, and vibrant clothing designed for playful elegance.",
        image_url="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1000&auto=format&fit=crop",
        is_featured=True
    )
    cat_shoes = Category.objects.create(
        name="Shoes", slug="shoes", audience=Category.AUDIENCE_ALL, display_order=4,
        description="Architectural footwear, luxury leather sneakers, and timeless boots.",
        image_url="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop",
        is_featured=True
    )
    cat_bags = Category.objects.create(
        name="Bags & Leather", slug="bags", audience=Category.AUDIENCE_ALL, display_order=5,
        description="Handcrafted Italian leather totes, structured shoulder bags, and luxury weekenders.",
        image_url="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
        is_featured=True
    )
    cat_accessories = Category.objects.create(
        name="Accessories", slug="accessories", audience=Category.AUDIENCE_ALL, display_order=6,
        description="Sculptural jewelry, silk scarves, minimal watches, and handcrafted eyewear.",
        image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
        is_featured=True
    )

    # Subcategories
    cat_dresses = Category.objects.create(name="Dresses", slug="dresses", parent=cat_women, audience=Category.AUDIENCE_WOMEN, display_order=1)
    cat_coats = Category.objects.create(name="Coats & Outerwear", slug="coats", parent=cat_women, audience=Category.AUDIENCE_WOMEN, display_order=2)
    cat_men_jackets = Category.objects.create(name="Jackets & Blazers", slug="men-jackets", parent=cat_men, audience=Category.AUDIENCE_MEN, display_order=1)
    cat_men_shirts = Category.objects.create(name="Shirts & Polos", slug="men-shirts", parent=cat_men, audience=Category.AUDIENCE_MEN, display_order=2)

    print("[OK] Created 10 Dynamic Hierarchical Categories")

    # 6. Sample Products
    Product.objects.all().delete()

    products_data = [
        {
            'name': "KleinDream Signature Atelier Coat",
            'slug': "signature-atelier-coat",
            'sku': "KD-CT-001",
            'short_description': "Double-breasted virgin wool and cashmere overcoat in midnight noir.",
            'description': "Crafted from a blend of Italian virgin wool and ethically sourced Mongolian cashmere, the Signature Atelier Coat exemplifies modern architectural tailoring. Features horn buttons, interior silk lining, and discreet welt pockets.",
            'audience': Product.AUDIENCE_WOMEN,
            'regular_price': Decimal('380.00'),
            'sale_price': Decimal('320.00'),
            'cost_price': Decimal('160.00'),
            'is_featured': True,
            'is_bestseller': True,
            'is_new': True,
            'categories': [cat_women, cat_coats],
            'model_3d_url': "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb",
            'images': [
                "https://images.unsplash.com/photo-1539533018447-63fcce667883?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop"
            ],
            'variants': [
                {'size': 'S', 'color_name': 'Noir Charcoal', 'color_hex': '#202124', 'stock': 12, 'sku': 'KD-CT-001-S-BLK'},
                {'size': 'M', 'color_name': 'Noir Charcoal', 'color_hex': '#202124', 'stock': 15, 'sku': 'KD-CT-001-M-BLK'},
                {'size': 'L', 'color_name': 'Noir Charcoal', 'color_hex': '#202124', 'stock': 8, 'sku': 'KD-CT-001-L-BLK'},
                {'size': 'S', 'color_name': 'Lavender Mist', 'color_hex': '#8975D9', 'stock': 6, 'sku': 'KD-CT-001-S-LAV'},
                {'size': 'M', 'color_name': 'Lavender Mist', 'color_hex': '#8975D9', 'stock': 10, 'sku': 'KD-CT-001-M-LAV'},
            ]
        },
        {
            'name': "Minimalist Sculptural Leather Tote",
            'slug': "minimalist-sculptural-tote",
            'sku': "KD-BG-002",
            'short_description': "Structured calfskin tote with brushed silver hardware and suede lining.",
            'description': "Engineered with clean architectural lines, this calfskin tote balances spacious utility with unmistakable luxury. Holds up to a 15-inch laptop with dedicated padded sleeve and magnetic snap closure.",
            'audience': Product.AUDIENCE_WOMEN,
            'regular_price': Decimal('290.00'),
            'sale_price': None,
            'cost_price': Decimal('110.00'),
            'is_featured': True,
            'is_bestseller': True,
            'is_new': False,
            'categories': [cat_women, cat_bags],
            'images': [
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop"
            ],
            'variants': [
                {'size': 'One Size', 'color_name': 'Cognac Tan', 'color_hex': '#8B4513', 'stock': 14, 'sku': 'KD-BG-002-TAN'},
                {'size': 'One Size', 'color_name': 'Charcoal Noir', 'color_hex': '#202124', 'stock': 9, 'sku': 'KD-BG-002-BLK'},
            ]
        },
        {
            'name': "Maison Orbit Leather Sneaker (3D Preview)",
            'slug': "maison-orbit-leather-sneaker",
            'sku': "KD-SH-003",
            'short_description': "Low-top court sneaker in full-grain white Italian leather.",
            'description': "Experience our signature Orbit sneaker in full 3D interactive view. Handcrafted in Monastir using Italian full-grain nappa leather, cushioned memory insole, and vulcanized rubber sole.",
            'audience': Product.AUDIENCE_MEN,
            'regular_price': Decimal('210.00'),
            'sale_price': Decimal('185.00'),
            'cost_price': Decimal('75.00'),
            'is_featured': True,
            'is_bestseller': True,
            'is_new': True,
            'categories': [cat_men, cat_shoes],
            'model_3d_url': "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb",
            'images': [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1200&auto=format&fit=crop"
            ],
            'variants': [
                {'size': '41', 'color_name': 'Clean White', 'color_hex': '#FFFFFF', 'stock': 8, 'sku': 'KD-SH-003-41-WHT'},
                {'size': '42', 'color_name': 'Clean White', 'color_hex': '#FFFFFF', 'stock': 14, 'sku': 'KD-SH-003-42-WHT'},
                {'size': '43', 'color_name': 'Clean White', 'color_hex': '#FFFFFF', 'stock': 11, 'sku': 'KD-SH-003-43-WHT'},
                {'size': '44', 'color_name': 'Clean White', 'color_hex': '#FFFFFF', 'stock': 5, 'sku': 'KD-SH-003-44-WHT'},
            ]
        },
        {
            'name': "Structured Tailored Blazer",
            'slug': "structured-tailored-blazer",
            'sku': "KD-MB-004",
            'short_description': "Single-breasted lightweight wool blazer in navy charcoal.",
            'description': "A versatile tailored jacket engineered for effortless day-to-evening dressing. Half-canvassed construction with natural shoulder drape and horn buttons.",
            'audience': Product.AUDIENCE_MEN,
            'regular_price': Decimal('310.00'),
            'sale_price': None,
            'cost_price': Decimal('120.00'),
            'is_featured': True,
            'is_bestseller': False,
            'is_new': True,
            'categories': [cat_men, cat_men_jackets],
            'images': [
                "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop"
            ],
            'variants': [
                {'size': '48', 'color_name': 'Midnight Navy', 'color_hex': '#1B2A4A', 'stock': 7, 'sku': 'KD-MB-004-48-NVY'},
                {'size': '50', 'color_name': 'Midnight Navy', 'color_hex': '#1B2A4A', 'stock': 9, 'sku': 'KD-MB-004-50-NVY'},
                {'size': '52', 'color_name': 'Midnight Navy', 'color_hex': '#1B2A4A', 'stock': 4, 'sku': 'KD-MB-004-52-NVY'},
            ]
        },
        {
            'name': "Fluid Silk Evening Slip Dress",
            'slug': "fluid-silk-evening-dress",
            'sku': "KD-DR-005",
            'short_description': "Floor-length bias-cut mulberry silk dress with delicate straps.",
            'description': "Cut on the bias for a graceful fluid drape that naturally skims the body. Featuring 19-momme grade 6A mulberry silk with gentle luminescence.",
            'audience': Product.AUDIENCE_WOMEN,
            'regular_price': Decimal('260.00'),
            'sale_price': Decimal('220.00'),
            'cost_price': Decimal('90.00'),
            'is_featured': True,
            'is_bestseller': True,
            'is_new': True,
            'categories': [cat_women, cat_dresses],
            'images': [
                "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1200&auto=format&fit=crop"
            ],
            'variants': [
                {'size': 'XS', 'color_name': 'Lavender Mist', 'color_hex': '#8975D9', 'stock': 5, 'sku': 'KD-DR-005-XS-LAV'},
                {'size': 'S', 'color_name': 'Lavender Mist', 'color_hex': '#8975D9', 'stock': 8, 'sku': 'KD-DR-005-S-LAV'},
                {'size': 'M', 'color_name': 'Lavender Mist', 'color_hex': '#8975D9', 'stock': 6, 'sku': 'KD-DR-005-M-LAV'},
                {'size': 'S', 'color_name': 'Deep Noir', 'color_hex': '#202124', 'stock': 7, 'sku': 'KD-DR-005-S-BLK'},
                {'size': 'M', 'color_name': 'Deep Noir', 'color_hex': '#202124', 'stock': 10, 'sku': 'KD-DR-005-M-BLK'},
            ]
        },
        {
            'name': "Little Maison Organic Cotton Set",
            'slug': "little-maison-organic-set",
            'sku': "KD-KD-006",
            'short_description': "Two-piece organic ribbed cotton sweater and jogger set.",
            'description': "Hypoallergenic, ultra-soft GOTS certified organic cotton tailored for children. Designed for all-day active play and soft tactile comfort.",
            'audience': Product.AUDIENCE_KIDS,
            'regular_price': Decimal('95.00'),
            'sale_price': None,
            'cost_price': Decimal('32.00'),
            'is_featured': True,
            'is_bestseller': False,
            'is_new': True,
            'categories': [cat_kids],
            'images': [
                "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1200&auto=format&fit=crop"
            ],
            'variants': [
                {'size': '4Y', 'color_name': 'Oatmeal Heather', 'color_hex': '#E5E7EB', 'stock': 8, 'sku': 'KD-KD-006-4Y-OAT'},
                {'size': '6Y', 'color_name': 'Oatmeal Heather', 'color_hex': '#E5E7EB', 'stock': 12, 'sku': 'KD-KD-006-6Y-OAT'},
                {'size': '8Y', 'color_name': 'Oatmeal Heather', 'color_hex': '#E5E7EB', 'stock': 6, 'sku': 'KD-KD-006-8Y-OAT'},
            ]
        },
        {
            'name': "Chronograph Horizon Ceramic Watch",
            'slug': "chronograph-horizon-watch",
            'sku': "KD-AC-007",
            'short_description': "Minimalist ceramic timepiece with sapphire crystal face and Swiss movement.",
            'description': "A study in monochromatic refinement. Matte high-tech ceramic case, scratch-resistant sapphire crystal glass, 5 ATM water resistance, and Milanese mesh bracelet.",
            'audience': Product.AUDIENCE_ALL,
            'regular_price': Decimal('340.00'),
            'sale_price': Decimal('290.00'),
            'cost_price': Decimal('130.00'),
            'is_featured': True,
            'is_bestseller': True,
            'is_new': True,
            'categories': [cat_accessories],
            'images': [
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop"
            ],
            'variants': [
                {'size': '40mm', 'color_name': 'Obsidian Ceramic', 'color_hex': '#202124', 'stock': 15, 'sku': 'KD-AC-007-40-BLK'},
                {'size': '36mm', 'color_name': 'Ivory Ceramic', 'color_hex': '#F4F4F6', 'stock': 10, 'sku': 'KD-AC-007-36-WHT'},
            ]
        }
    ]

    for pdata in products_data:
        cats = pdata.pop('categories')
        imgs = pdata.pop('images')
        variants = pdata.pop('variants')

        product = Product.objects.create(**pdata)
        product.categories.set(cats)

        # Images
        for i, img_url in enumerate(imgs):
            ProductImage.objects.create(
                product=product,
                image_url=img_url,
                alt_text=f"{product.name} view {i+1}",
                is_primary=(i == 0),
                display_order=i
            )

        # Variants & Stock
        for v in variants:
            pv = ProductVariant.objects.create(
                product=product,
                name=f"{v['size']} / {v['color_name']}",
                size=v['size'],
                color_name=v['color_name'],
                color_hex=v['color_hex'],
                sku=v['sku'],
                stock_quantity=v['stock'],
                low_stock_threshold=5,
                is_active=True
            )
            # Log initial restock movement
            StockMovement.objects.create(
                variant=pv,
                movement_type=StockMovement.TYPE_RESTOCK,
                quantity_change=v['stock'],
                previous_quantity=0,
                new_quantity=v['stock'],
                reason="Initial Atelier Launch Stock",
                staff_user=admin_user
            )

        # Reviews
        Review.objects.create(
            product=product,
            user=cust_user,
            rating=5,
            title="Exceptional luxury finish",
            comment="The drape and fabric feel are on par with Paris fashion houses. Fast delivery to Tunis and elegant packaging.",
            is_verified_purchase=True,
            is_approved=True
        )

    print(f"[OK] Created {len(products_data)} Luxury Products with Variants, Stock, and 3D Models")

    # 7. Promotional Coupons
    Coupon.objects.all().delete()
    Coupon.objects.create(
        code="KLEIN10",
        description="10% welcome discount on entire collection",
        discount_type=Coupon.TYPE_PERCENTAGE,
        discount_value=Decimal('10.00'),
        min_order_amount=Decimal('50.00'),
        is_active=True
    )
    Coupon.objects.create(
        code="DREAM20",
        description="20% luxury discount on orders over 150 DT",
        discount_type=Coupon.TYPE_PERCENTAGE,
        discount_value=Decimal('20.00'),
        min_order_amount=Decimal('150.00'),
        is_active=True
    )
    Coupon.objects.create(
        code="PRIVILEGE50",
        description="50 DT off VIP order above 250 DT",
        discount_type=Coupon.TYPE_FIXED,
        discount_value=Decimal('50.00'),
        min_order_amount=Decimal('250.00'),
        is_active=True
    )
    print("[OK] Created 3 Promotional Coupons (KLEIN10, DREAM20, PRIVILEGE50)")

    # 8. AI Studio Asset Library
    AssetLibrary.objects.all().delete()
    AssetLibrary.objects.create(
        title="KleinDream Signature Luxury Shoe (3D Asset)",
        asset_type=AssetLibrary.TYPE_MODEL_3D,
        file_url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb",
        prompt="Image to 3D Neural Reconstruction of luxury leather sneaker",
        provider="Meshy 3D / Klein Neural",
        file_size="3.2 MB",
        is_ai_generated=True
    )
    AssetLibrary.objects.create(
        title="Editorial Autumn/Winter Campaign Visual",
        asset_type=AssetLibrary.TYPE_IMAGE,
        file_url="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
        prompt="Luxury fashion editorial in architectural concrete setting with soft lavender lighting",
        provider="AI Engine",
        dimensions="1024x1024",
        is_ai_generated=True
    )
    print("[OK] Initialized AI Asset Library with 3D Models and Visuals")

    print("[SUCCESS] KleinDream Seeding Completed Successfully!")

if __name__ == '__main__':
    seed()
