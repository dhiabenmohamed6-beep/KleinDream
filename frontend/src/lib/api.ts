import { Product, Category, Cart, Order, User, AnnouncementBarData, HeroBannerData, StoreSettingsData, AIAsset, AIJob } from './types';

export const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('klein_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getGuestHeader(guestToken?: string): Record<string, string> {
  const token = guestToken || (typeof window !== 'undefined' ? localStorage.getItem('klein_guest_token') || '' : '');
  return token ? { 'X-Guest-Token': token } : {};
}

// Storefront Catalog APIs
export async function fetchProducts(params: Record<string, any> = {}): Promise<{ count: number; results: Product[] }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  const res = await fetch(`${API_BASE}/catalog/products/?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/catalog/products/${slug}/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function fetchRelatedProducts(slug: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/catalog/products/${slug}/related/`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchCategories(): Promise<{ count: number; results: Category[] }> {
  const res = await fetch(`${API_BASE}/catalog/categories/?parent=null`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  const res = await fetch(`${API_BASE}/catalog/categories/${slug}/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Category not found');
  return res.json();
}

// Content & Settings
export async function fetchAnnouncement(): Promise<AnnouncementBarData | null> {
  try {
    const res = await fetch(`${API_BASE}/content/announcement/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchHeroBanners(): Promise<HeroBannerData[]> {
  try {
    const res = await fetch(`${API_BASE}/content/hero-banners/`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || data;
  } catch {
    return [];
  }
}

export async function fetchPublicSettings(): Promise<StoreSettingsData> {
  const res = await fetch(`${API_BASE}/settings/public/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch store settings');
  return res.json();
}

// Cart APIs
export async function fetchCart(guestToken?: string): Promise<Cart> {
  const headers = { ...getAuthHeader(), ...getGuestHeader(guestToken) };
  const res = await fetch(`${API_BASE}/cart/`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch cart');
  const data = await res.json();
  if (data.guest_token && typeof window !== 'undefined') {
    localStorage.setItem('klein_guest_token', data.guest_token);
  }
  return data;
}

export async function addToCart(variantId: number, quantity: number = 1, guestToken?: string): Promise<Cart> {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader(), ...getGuestHeader(guestToken) };
  const res = await fetch(`${API_BASE}/cart/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ variant_id: variantId, quantity })
  });
  if (!res.ok) {
    let errMessage = 'Failed to add item to cart';
    try {
      const err = await res.json();
      errMessage = err.error || err.detail || errMessage;
    } catch {}
    throw new Error(errMessage);
  }
  const data = await res.json();
  if (data.guest_token && typeof window !== 'undefined') {
    localStorage.setItem('klein_guest_token', data.guest_token);
  }
  return data;
}

export async function updateCartItem(itemId: number, quantity: number, guestToken?: string): Promise<Cart> {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader(), ...getGuestHeader(guestToken) };
  const res = await fetch(`${API_BASE}/cart/items/${itemId}/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ quantity })
  });
  if (!res.ok) throw new Error('Failed to update cart');
  return res.json();
}

export async function removeCartItem(itemId: number, guestToken?: string): Promise<Cart> {
  const headers = { ...getAuthHeader(), ...getGuestHeader(guestToken) };
  const res = await fetch(`${API_BASE}/cart/items/${itemId}/`, {
    method: 'DELETE',
    headers
  });
  if (!res.ok) throw new Error('Failed to remove cart item');
  return res.json();
}

// Promotions
export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount_amount: number; message: string }> {
  const res = await fetch(`${API_BASE}/promotions/validate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid coupon');
  return data;
}

// Checkout & Orders
export async function checkoutOrder(orderData: any, guestToken?: string): Promise<Order> {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader(), ...getGuestHeader(guestToken) };
  const res = await fetch(`${API_BASE}/orders/checkout/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || JSON.stringify(err));
  }
  return res.json();
}

export async function fetchOrderDetails(orderNumber: string): Promise<Order> {
  const headers = getAuthHeader();
  const res = await fetch(`${API_BASE}/orders/${orderNumber}/`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

export async function fetchMyOrders(): Promise<{ count: number; results: Order[] }> {
  const headers = getAuthHeader();
  const res = await fetch(`${API_BASE}/orders/my-orders/`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

// Contact & Newsletter
export async function submitContact(data: { name: string; email: string; subject: string; message: string }) {
  const res = await fetch(`${API_BASE}/contact/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function subscribeNewsletter(email: string) {
  const res = await fetch(`${API_BASE}/contact/newsletter/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error('Subscription failed');
  return res.json();
}

// ================= ADMIN & AI STUDIO APIS =================

export async function fetchDashboardOverview(days: number = 30) {
  const headers = getAuthHeader();
  const res = await fetch(`${API_BASE}/analytics/dashboard/?days=${days}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load dashboard overview');
  return res.json();
}

export async function fetchAdminOrders(status?: string, search?: string): Promise<{ count: number; results: Order[] }> {
  const headers = getAuthHeader();
  const query = new URLSearchParams();
  if (status) query.append('status', status);
  if (search) query.append('search', search);
  const res = await fetch(`${API_BASE}/orders/admin/orders/?${query.toString()}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch admin orders');
  return res.json();
}

export async function updateAdminOrderStatus(orderId: number, status: string, notes?: string, carrier?: string, tracking?: string) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/orders/admin/orders/${orderId}/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, internal_notes: notes, shipping_carrier: carrier, tracking_number: tracking })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function deleteAdminOrder(orderId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/admin/orders/${orderId}/`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    let message = 'Failed to delete order';
    try {
      const error = await res.json();
      message = error.detail || error.error || message;
    } catch {
      // Keep the deletion error if the server response is not JSON.
    }
    throw new Error(message);
  }
}

export async function fetchAdminInventory(search?: string, filter?: string) {
  const headers = getAuthHeader();
  const query = new URLSearchParams();
  if (search) query.append('search', search);
  if (filter) query.append('status', filter);
  const res = await fetch(`${API_BASE}/inventory/variants/?${query.toString()}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load inventory');
  return res.json();
}

export async function adjustInventory(variantId: number, quantityChange: number, reason: string) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/inventory/adjust/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ variant_id: variantId, quantity_change: quantityChange, reason })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to adjust inventory');
  }
  return res.json();
}

export async function fetchAdminCategories(): Promise<{ count: number; results: Category[] }> {
  const headers = getAuthHeader();
  const res = await fetch(`${API_BASE}/catalog/categories/`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

function buildCategoryFormData(categoryData: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(categoryData).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined) {
      formData.append(key, value === null ? '' : String(value));
    }
  });
  return formData;
}

export async function createAdminCategory(categoryData: any): Promise<Category> {
  const formData = buildCategoryFormData(categoryData);
  const res = await fetch(`${API_BASE}/catalog/categories/`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || JSON.stringify(error) || 'Failed to create category');
  }
  return res.json();
}

export async function updateAdminCategory(slug: string, categoryData: any): Promise<Category> {
  const formData = buildCategoryFormData(categoryData);
  const res = await fetch(`${API_BASE}/catalog/categories/${slug}/`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: formData
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || JSON.stringify(error) || 'Failed to update category');
  }
  return res.json();
}

export async function deleteAdminCategory(slug: string) {
  const headers = getAuthHeader();
  const res = await fetch(`${API_BASE}/catalog/categories/${slug}/`, {
    method: 'DELETE',
    headers
  });
  if (!res.ok) throw new Error('Failed to delete category');
  return true;
}

export async function createAdminProduct(productData: any): Promise<Product> {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/catalog/products/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(productData)
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function addProductVariant(productSlug: string, variantData: any) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/catalog/products/${productSlug}/add_variant/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(variantData)
  });
  if (!res.ok) throw new Error('Failed to add variant');
  return res.json();
}

export async function uploadProductImage(productSlug: string, image: File, isPrimary: boolean): Promise<void> {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('alt_text', image.name);
  formData.append('is_primary', String(isPrimary));

  const res = await fetch(`${API_BASE}/catalog/products/${productSlug}/add_image/`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });

  if (!res.ok) {
    let message = 'Failed to upload product image';
    try {
      const error = await res.json();
      message = error.detail || error.error || message;
    } catch {
      // Keep the upload error message if the server response is not JSON.
    }
    throw new Error(message);
  }
}

// AI Studio API Calls
export async function enhanceAIPrompt(prompt: string): Promise<{ enhanced_prompt: string }> {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/ai-studio/enhance-prompt/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error('Failed to enhance prompt');
  return res.json();
}

export async function generateAITextToImage(payload: { prompt: string; negative_prompt?: string; aspect_ratio?: string; style?: string; count?: number }) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/ai-studio/generate-image/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Image generation failed');
  }
  return res.json();
}

export async function extractProductBackground(payload: { image_url?: string; background?: string }) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/ai-studio/extract-product/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Product extraction failed');
  return res.json();
}

export async function analyzeProductWithVision(imageUrl: string) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/ai-studio/vision-assistant/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ image_url: imageUrl })
  });
  if (!res.ok) throw new Error('Vision analysis failed');
  return res.json();
}

export async function generateImagePackage(imageUrl: string, prompt?: string) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/ai-studio/image-package/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ image_url: imageUrl, prompt })
  });
  if (!res.ok) throw new Error('Image package generation failed');
  return res.json();
}

export async function generateAI3DModel(imageUrl: string, prompt?: string, format: string = 'GLB') {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/ai-studio/image-to-3d/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ image_url: imageUrl, prompt, format })
  });
  if (!res.ok) throw new Error('3D generation failed');
  return res.json();
}

export async function fetchAIAssets(assetType?: string): Promise<{ count: number; results: AIAsset[] }> {
  const headers = getAuthHeader();
  const query = assetType ? `?asset_type=${assetType}` : '';
  const res = await fetch(`${API_BASE}/ai-studio/assets/${query}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load assets');
  return res.json();
}

export async function attachAIAsset(assetId: number, productId: number, isPrimary: boolean = false) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const res = await fetch(`${API_BASE}/ai-studio/assets/${assetId}/attach_to_product/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ product_id: productId, is_primary: isPrimary })
  });
  if (!res.ok) throw new Error('Failed to attach asset to product');
  return res.json();
}

export async function fetchAIHistory(): Promise<{ count: number; results: AIJob[] }> {
  const headers = getAuthHeader();
  const res = await fetch(`${API_BASE}/ai-studio/history/`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load AI job history');
  return res.json();
}

export async function fetchAISettingsStatus() {
  const headers = getAuthHeader();
  const res = await fetch(`${API_BASE}/ai-studio/settings/`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load AI settings');
  return res.json();
}
