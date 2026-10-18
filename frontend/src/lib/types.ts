export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  image_url?: string;
  audience: 'ALL' | 'WOMEN' | 'MEN' | 'KIDS' | 'UNISEX';
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  product_count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  image_url?: string;
  banner?: string;
  parent?: number;
  parent_name?: string;
  audience: 'ALL' | 'WOMEN' | 'MEN' | 'KIDS' | 'UNISEX';
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  subcategories: Subcategory[];
  product_count: number;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: number;
  product?: number;
  name: string;
  size: string;
  color_name: string;
  color_hex: string;
  sku: string;
  price_override?: string | number | null;
  price: string | number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_in_stock: boolean;
}

export interface ProductImage {
  id: number;
  image?: string;
  image_url?: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  is_ai_generated: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  product: number;
  user: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  short_description: string;
  description: string;
  categories: Category[];
  audience: 'ALL' | 'WOMEN' | 'MEN' | 'KIDS' | 'UNISEX';
  regular_price: string | number;
  sale_price?: string | number | null;
  current_price: string | number;
  discount_percent: number;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  weight?: string | number | null;
  dimensions?: string;
  model_3d?: string | null;
  model_3d_url?: string | null;
  seo_title?: string;
  seo_description?: string;
  images: ProductImage[];
  primary_image?: ProductImage;
  variants: ProductVariant[];
  reviews?: Review[];
  total_stock: number;
  average_rating?: number;
  available_colors?: ProductColor[];
  available_sizes?: string[];
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: number;
  product: number;
  product_name: string;
  product_slug: string;
  variant: number;
  variant_name: string;
  size: string;
  color_name: string;
  color_hex: string;
  quantity: number;
  unit_price: string | number;
  line_total: string | number;
  stock_quantity: number;
  image_url?: string;
}

export interface Cart {
  id: number;
  guest_token?: string;
  items: CartItem[];
  total_items: number;
  subtotal: string | number;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'INVENTORY_MGR' | 'SUPPORT';
  phone?: string;
  avatar?: string;
  is_store_admin: boolean;
  is_staff_member: boolean;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product?: number;
  variant?: number;
  product_name: string;
  variant_name: string;
  sku: string;
  unit_price: string | number;
  quantity: number;
  line_total: string | number;
  image_url?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  status_display: string;
  payment_status: 'UNPAID' | 'PAID' | 'REFUNDED';
  payment_status_display: string;
  payment_method: 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'ONLINE_GATEWAY';
  payment_method_display: string;
  shipping_address: {
    address_line_1: string;
    city: string;
    postal_code: string;
    state?: string;
    country: string;
    notes?: string;
  };
  shipping_method: string;
  shipping_carrier?: string;
  tracking_number?: string;
  currency: string;
  subtotal: string | number;
  discount_amount: string | number;
  shipping_fee: string | number;
  tax_amount: string | number;
  total: string | number;
  coupon_code?: string;
  notes?: string;
  internal_notes?: string;
  items: OrderItem[];
  created_at: string;
}

export interface AnnouncementBarData {
  id: number;
  text: string;
  link?: string;
  is_active: boolean;
  background_color: string;
  text_color: string;
}

export interface HeroBannerData {
  id: number;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text?: string;
  secondary_cta_link?: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface StoreSettingsData {
  store_name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  currency_symbol: string;
  free_shipping_threshold: string | number;
  flat_shipping_rate: string | number;
  social_instagram?: string;
  social_facebook?: string;
  social_tiktok?: string;
}

export interface AIAsset {
  id: number;
  title: string;
  asset_type: 'IMAGE' | 'SEGMENTED_PNG' | 'MODEL_3D' | 'BANNER';
  asset_type_display: string;
  file_url: string;
  display_url: string;
  prompt?: string;
  provider?: string;
  dimensions?: string;
  file_size?: string;
  is_ai_generated: boolean;
  product?: number;
  product_name?: string;
  created_at: string;
}

export interface AIJob {
  id: string;
  job_type: string;
  job_type_display: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  status_display: string;
  prompt?: string;
  parameters: Record<string, any>;
  result_assets: any[];
  duration_seconds: number;
  error_message?: string;
  created_at: string;
}
