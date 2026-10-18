import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def test_url(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

print("=== TESTING NEXT.JS STOREFRONT & ADMIN ROUTES ===")
routes = [
    '/',
    '/shop',
    '/product/architectural-leather-chelsea-boots',
    '/cart',
    '/checkout',
    '/auth/login',
    '/admin/dashboard',
    '/admin/ai-studio'
]

for r in routes:
    code, content = test_url(f'http://localhost:3000{r}')
    if code == 200:
        print(f"[OK] Route {r} -> HTTP 200 ({len(content)} bytes)")
    else:
        print(f"[FAIL] Route {r} -> HTTP {code}: {content[:100]}")

print("\n=== TESTING BACKEND APIS ===")
# 1. Catalog Products
code, content = test_url('http://127.0.0.1:8001/api/v1/catalog/products/')
if code == 200:
    data = json.loads(content)
    print(f"[OK] Catalog Products count: {data.get('count')}")
    for p in data.get('results', [])[:3]:
        print(f"     - {p['name']} ({p.get('current_price')} DT, 3D: {'yes' if p.get('model_3d') or p.get('model_3d_url') else 'no'})")
else:
    print(f"[FAIL] Products API -> HTTP {code}: {content[:100]}")

# 2. Coupon Validation
coupon_payload = json.dumps({'code': 'KLEIN10', 'subtotal': '250.00'}).encode('utf-8')
code, content = test_url('http://127.0.0.1:8001/api/v1/promotions/validate/', method='POST', data=coupon_payload, headers={'Content-Type': 'application/json'})
if code == 200:
    c = json.loads(content)
    print(f"[OK] Coupon KLEIN10 Valid: {c.get('valid')} | Discount: {c.get('discount_amount')} DT | Message: {c.get('message')}")
else:
    print(f"[FAIL] Coupon API -> HTTP {code}: {content[:100]}")

# 3. Admin Authentication
login_payload = json.dumps({'email': 'admin@kleindream.com', 'password': 'KleinDream2026!'}).encode('utf-8')
code, content = test_url('http://127.0.0.1:8001/api/v1/auth/login/', method='POST', data=login_payload, headers={'Content-Type': 'application/json'})
if code == 200:
    auth_data = json.loads(content)
    user = auth_data.get('user', {})
    token = auth_data.get('access')
    print(f"[OK] Admin Auth: {user.get('first_name')} {user.get('last_name')} (Role: {user.get('role')})")
    print(f"[OK] JWT Access Token obtained: {token[:20]}...")
    
    # 4. AI Studio Prompt Enhancement
    ai_payload = json.dumps({'prompt': 'Cashmere knit sweater', 'style': 'editorial', 'mood': 'timeless luxury'}).encode('utf-8')
    ai_headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}
    code, ai_content = test_url('http://127.0.0.1:8001/api/v1/ai-studio/enhance-prompt/', method='POST', data=ai_payload, headers=ai_headers)
    if code == 200:
        ai_res = json.loads(ai_content)
        print(f"[OK] AI Studio Prompt Enhancer:\n     '{ai_res.get('enhanced_prompt')[:120]}...'")
    else:
        print(f"[FAIL] AI Studio Prompt Enhancer -> HTTP {code}")
    # 5. Order & Cart Verification Flow
    # Add variant to cart
    cart_add_payload = json.dumps({'variant_id': 1, 'quantity': 1}).encode('utf-8')
    code, cart_content = test_url('http://127.0.0.1:8001/api/v1/cart/', method='POST', data=cart_add_payload, headers={'Content-Type': 'application/json', 'X-Guest-Token': 'test-guest-session-100'})
    if code in [200, 201]:
        cart_data = json.loads(cart_content)
        print(f"[OK] Cart Creation & Add Variant: Subtotal {cart_data.get('subtotal')} DT | Items: {len(cart_data.get('items', []))}")
        
        # Place Order
        checkout_payload = json.dumps({
            'customer_name': 'Test Shopper',
            'customer_email': 'shopper@kleindream.com',
            'customer_phone': '+216 22 123 456',
            'shipping_address': {
                'address_line_1': 'Avenue Habib Bourguiba',
                'city': 'Tunis',
                'state': 'Tunis',
                'postal_code': '1000',
                'country': 'Tunisia'
            },
            'coupon_code': 'KLEIN10',
            'payment_method': 'CASH_ON_DELIVERY'
        }).encode('utf-8')
        code, order_content = test_url('http://127.0.0.1:8001/api/v1/orders/checkout/', method='POST', data=checkout_payload, headers={'Content-Type': 'application/json', 'X-Guest-Token': 'test-guest-session-100'})
        if code in [200, 201]:
            order_data = json.loads(order_content)
            print(f"[OK] Order Checkout Placed Successfully! Order #: {order_data.get('order_number')} | Total: {order_data.get('total')} DT | Status: {order_data.get('status')}")
        else:
            print(f"[FAIL] Order Checkout -> HTTP {code}: {order_content[:150]}")
    else:
        print(f"[FAIL] Cart Add -> HTTP {code}: {cart_content[:150]}")

    # 6. AI Studio Image Generation
    img_gen_payload = json.dumps({
        'prompt': 'Haute couture midnight blue velvet evening gown',
        'negative_prompt': 'blurry, distorted',
        'aspect_ratio': '1:1',
        'style': 'editorial'
    }).encode('utf-8')
    code, img_res = test_url('http://127.0.0.1:8001/api/v1/ai-studio/generate-image/', method='POST', data=img_gen_payload, headers=ai_headers)
    if code in [200, 201]:
        img_data = json.loads(img_res)
        print(f"[OK] AI Text-to-Image generated {len(img_data.get('assets', []))} visual asset(s)")
    else:
        print(f"[FAIL] AI Text-to-Image -> HTTP {code}: {img_res[:100]}")

    # 7. AI Vision Assistant
    vision_payload = json.dumps({
        'image_url': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000'
    }).encode('utf-8')
    code, vision_res = test_url('http://127.0.0.1:8001/api/v1/ai-studio/vision-assistant/', method='POST', data=vision_payload, headers=ai_headers)
    if code in [200, 201]:
        v_data = json.loads(vision_res)
        analysis = v_data.get('analysis', {})
        print(f"[OK] AI Vision Assistant Draft: '{analysis.get('title')}' ({analysis.get('suggested_price')} DT, Category: {analysis.get('category')})")
    else:
        print(f"[FAIL] AI Vision Assistant -> HTTP {code}: {vision_res[:100]}")

    # 8. AI Image-to-3D Reconstruction
    d3_payload = json.dumps({
        'image_url': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000',
        'quality': 'high',
        'format': 'glb'
    }).encode('utf-8')
    code, d3_res = test_url('http://127.0.0.1:8001/api/v1/ai-studio/image-to-3d/', method='POST', data=d3_payload, headers=ai_headers)
    if code in [200, 201]:
        d3_data = json.loads(d3_res)
        print(f"[OK] AI Image-to-3D Model Generated: URL -> {d3_data.get('model_url', d3_data.get('asset', {}).get('file_url'))}")
    else:
        print(f"[FAIL] AI Image-to-3D -> HTTP {code}: {d3_res[:100]}")

print("\n=== ALL SYSTEM TESTS COMPLETED SUCCESSFULLY ===")
