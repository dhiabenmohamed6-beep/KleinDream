/**
 * Image resolver utility for KleinDream.
 * 
 * On Vercel, local /media/ files don't exist. This utility:
 * 1. Returns `image_url` if it's a valid external HTTP/HTTPS URL
 * 2. Falls back to a curated Unsplash image based on product/category name
 * 3. Never returns local /media/ paths (which break on Vercel)
 */

// Curated Unsplash images by product category keyword
const UNSPLASH_FALLBACKS: Record<string, string> = {
  't-shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
  'tee': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
  'shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
  'blazer': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
  'suit': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
  'coat': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
  'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
  'dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
  'skirt': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop',
  'trousers': 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop',
  'pants': 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop',
  'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop',
  'sneaker': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
  'shoe': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
  'heel': 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?q=80&w=800&auto=format&fit=crop',
  'boot': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop',
  'bag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
  'tote': 'https://images.unsplash.com/photo-1554412933-514a83d2f3cd?q=80&w=800&auto=format&fit=crop',
  'handbag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
  'wallet': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
  'ceramic': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
  'perfume': 'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=800&auto=format&fit=crop',
  'fragrance': 'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=800&auto=format&fit=crop',
  'scarf': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=800&auto=format&fit=crop',
  'belt': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  'accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  'men': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
  'women': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
  'kids': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop',
};

// Default fallback image - luxury fashion
const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop';

/**
 * Determines if a URL is a local/relative path that won't work on Vercel.
 */
function isLocalPath(url: string): boolean {
  if (!url) return true;
  // Local paths start with /media/, relative paths, or don't have http/https
  return url.startsWith('/media/') || url.startsWith('./') || url.startsWith('../') || 
    (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//'));
}

/**
 * Gets the best fallback image for a product or category based on its name.
 */
export function getFallbackImage(name: string = ''): string {
  const lower = name.toLowerCase();
  for (const [keyword, url] of Object.entries(UNSPLASH_FALLBACKS)) {
    if (lower.includes(keyword)) {
      return url;
    }
  }
  return DEFAULT_FALLBACK;
}

/**
 * Resolves the best available image URL for a product image object.
 * Prefers external image_url, falls back to Unsplash if only a local path exists.
 */
export function resolveProductImage(
  image: { image?: string; image_url?: string } | null | undefined,
  productName: string = ''
): string {
  if (!image) return getFallbackImage(productName);
  
  // Prefer image_url if it's a valid external URL
  if (image.image_url && !isLocalPath(image.image_url)) {
    return image.image_url;
  }
  
  // Fall back to image if it's external
  if (image.image && !isLocalPath(image.image)) {
    return image.image;
  }
  
  // Both are local/empty → use Unsplash fallback based on product name
  return getFallbackImage(productName);
}

/**
 * Resolves the best available image URL for a category.
 */
export function resolveCategoryImage(
  category: { image?: string; image_url?: string; name?: string } | null | undefined
): string {
  if (!category) return DEFAULT_FALLBACK;
  
  if (category.image_url && !isLocalPath(category.image_url)) {
    return category.image_url;
  }
  
  if (category.image && !isLocalPath(category.image)) {
    return category.image;
  }
  
  return getFallbackImage(category.name || '');
}
