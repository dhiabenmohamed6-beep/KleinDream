'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit2, Sparkles, Box, Check, X, Filter } from 'lucide-react';
import { fetchProducts, fetchAdminCategories, createAdminProduct, addProductVariant, uploadProductImage } from '@/lib/api';
import { Product, Category } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    short_description: '',
    description: '',
    audience: 'WOMEN',
    regular_price: '',
    sale_price: '',
    category_ids: [] as number[],
    model_3d_url: '',
    image_url: '',
    is_featured: false,
    is_new: true,
    is_bestseller: false,
    // Initial variant
    size: 'M',
    color_name: 'Noir Charcoal',
    color_hex: '#202124',
    initial_stock: 10,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchProducts({ search }),
      fetchAdminCategories(),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.results || []);
        setCategories(catRes.results || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const productPayload = {
        name: formData.name,
        sku: formData.sku.toUpperCase(),
        short_description: formData.short_description,
        description: formData.description,
        audience: formData.audience,
        regular_price: Number(formData.regular_price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        category_ids: formData.category_ids,
        model_3d_url: formData.model_3d_url || null,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        is_bestseller: formData.is_bestseller,
      };

      const createdProd = await createAdminProduct(productPayload);

      // Add initial variant
      if (createdProd && createdProd.slug) {
        await addProductVariant(createdProd.slug, {
          name: `${formData.size} / ${formData.color_name}`,
          size: formData.size,
          color_name: formData.color_name,
          color_hex: formData.color_hex,
          sku: `${formData.sku}-${formData.size}`.toUpperCase(),
          stock_quantity: Number(formData.initial_stock),
        });

        for (let index = 0; index < imageFiles.length; index += 1) {
          await uploadProductImage(createdProd.slug, imageFiles[index], index === 0);
        }

        // If image provided, add image
        if (formData.image_url) {
          await fetch(`/api/v1/catalog/products/${createdProd.slug}/add_image/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
            },
            body: JSON.stringify({
              image_url: formData.image_url,
              is_primary: true,
            }),
          });
        }
      }

      setCreateModalOpen(false);
      setImageFiles([]);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavenderDark block mb-1">
            Storefront Catalog
          </span>
          <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
            Product Management
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Create, price, and customize products with variants, luxury photography, and 3D assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/ai-studio"
            className="px-4 py-2.5 bg-brand-light hover:bg-brand-lavender/10 text-brand-lavenderDark border border-brand-border rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4 text-brand-lavender" />
            <span>Generate with AI Studio</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setFormData({
                name: '',
                sku: `KD-${Date.now().toString().slice(-4)}`,
                short_description: '',
                description: '',
                audience: 'WOMEN',
                regular_price: '',
                sale_price: '',
                category_ids: categories[0]?.id ? [categories[0].id] : [],
                model_3d_url: '',
                image_url: '',
                is_featured: false,
                is_new: true,
                is_bestseller: false,
                size: 'M',
                color_name: 'Noir Charcoal',
                color_hex: '#202124',
                initial_stock: 10,
              });
              setImageFiles([]);
              setError(null);
              setCreateModalOpen(true);
            }}
            className="px-5 py-2.5 bg-brand-charcoal hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-subtle flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & List Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        
        <div className="p-4 border-b border-brand-border flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 text-brand-secondary absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, SKU, or description..."
              className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
            />
          </div>
          <span className="text-xs text-brand-secondary font-medium">
            {products.length} products listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-light text-brand-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Piece</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Media Assets</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-secondary animate-pulse">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-secondary">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const img = prod.primary_image?.image_url || prod.primary_image?.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop';
                  const has3D = Boolean(prod.model_3d || prod.model_3d_url);
                  return (
                    <tr key={prod.id} className="hover:bg-brand-light/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-brand-charcoal flex items-center gap-3">
                        <div className="relative h-11 w-9 rounded-lg overflow-hidden bg-brand-light border border-brand-border flex-shrink-0">
                          <Image src={img} alt={prod.name} fill className="object-cover" />
                        </div>
                        <div>
                          <Link href={`/product/${prod.slug}`} target="_blank" className="font-serif text-sm hover:text-brand-lavender block line-clamp-1">
                            {prod.name}
                          </Link>
                          <div className="flex items-center gap-1 mt-0.5">
                            {prod.is_new && <span className="text-[9px] bg-brand-charcoal text-white px-1.5 py-0.2 rounded font-bold uppercase">New</span>}
                            {prod.is_bestseller && <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold uppercase">Best</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-brand-secondary">
                        {prod.sku}
                      </td>

                      <td className="py-3 px-4 text-brand-secondary font-medium">
                        {prod.categories?.[0]?.name || 'Unassigned'}
                      </td>

                      <td className="py-3 px-4 font-medium text-brand-charcoal">
                        {prod.audience}
                      </td>

                      <td className="py-3 px-4 font-bold text-brand-charcoal">
                        {prod.current_price} DT
                        {prod.sale_price && Number(prod.sale_price) < Number(prod.regular_price) && (
                          <span className="block text-[10px] text-brand-lavenderDark line-through font-normal">
                            {prod.regular_price} DT
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${prod.total_stock > 5 ? 'bg-green-100 text-green-700' : prod.total_stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {prod.total_stock} units
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {has3D && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-brand-lavenderDark bg-brand-lavender/15 px-2 py-0.5 rounded">
                              <Box className="h-3 w-3" />
                              <span>3D Model</span>
                            </span>
                          )}
                          <span className="text-[10px] text-brand-secondary">
                            {prod.images?.length || 1} photo(s)
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/admin/ai-studio?product_id=${prod.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-light hover:bg-brand-lavender hover:text-white rounded text-[11px] font-medium text-brand-charcoal transition-colors"
                          title="Generate images or 3D for this piece with AI Studio"
                        >
                          <Sparkles className="h-3 w-3 text-brand-lavender" />
                          <span>AI Media</span>
                        </Link>
                        <Link
                          href={`/product/${prod.slug}`}
                          target="_blank"
                          className="inline-block p-1 text-brand-secondary hover:text-brand-charcoal transition-colors"
                          title="View on Storefront"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Product Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-brand-border">
              <h3 className="font-serif text-xl font-normal text-brand-charcoal">
                Create New Luxury Piece
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-400 hover:text-brand-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sculptural Trench Coat"
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                  />
                </div>
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">SKU Reference *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="KD-TR-001"
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-mono uppercase focus:outline-none focus:border-brand-lavender"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Audience</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                  >
                    <option value="WOMEN">Women</option>
                    <option value="MEN">Men</option>
                    <option value="KIDS">Kids</option>
                    <option value="ALL">All / Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Regular Price (DT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.regular_price}
                    onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                    placeholder="280.00"
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                  />
                </div>
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    placeholder="230.00"
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Categories (Hold Ctrl to select multiple)</label>
                <select
                  multiple
                  value={formData.category_ids.map(String)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                    setFormData({ ...formData, category_ids: selected });
                  }}
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal h-20"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.audience})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Short Description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Double-breasted tailored trench coat in midnight noir."
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                />
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Full Description & Details</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed material composition, craftsmanship, and styling guidance..."
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                />
              </div>

              {/* Product media */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-brand-border">
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Product Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1 file:text-xs"
                  />
                  <p className="mt-1 text-[10px] text-brand-secondary">Select one or more images from your device. The first image will be the main photo.</p>
                  {imageFiles.length > 0 && (
                    <p className="mt-1 text-[10px] text-brand-charcoal">
                      {imageFiles.map((image) => image.name).join(', ')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">3D Model Link (GLB format)</label>
                  <input
                    type="url"
                    value={formData.model_3d_url}
                    onChange={(e) => setFormData({ ...formData, model_3d_url: e.target.value })}
                    placeholder="https://.../model.glb"
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                  />
                </div>
              </div>

              {/* Initial Variant Information */}
              <div className="p-3 bg-brand-light rounded-xl border border-brand-border space-y-2">
                <span className="font-semibold text-brand-charcoal block">Initial Stock Variant:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block">Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full bg-white border border-brand-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block">Color Name</label>
                    <input
                      type="text"
                      value={formData.color_name}
                      onChange={(e) => setFormData({ ...formData, color_name: e.target.value })}
                      className="w-full bg-white border border-brand-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block">Color Hex</label>
                    <div className="flex gap-1">
                      <input
                        type="color"
                        aria-label="Choose variant color"
                        value={/^#[0-9a-fA-F]{6}$/.test(formData.color_hex) ? formData.color_hex : '#202124'}
                        onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                        className="h-7 w-9 shrink-0 cursor-pointer rounded border border-brand-border bg-white p-0.5"
                      />
                      <input
                        type="text"
                        required
                        pattern="^#[0-9A-Fa-f]{6}$"
                        title="Enter a color in #RRGGBB format"
                        value={formData.color_hex}
                        onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                        className="min-w-0 w-full bg-white border border-brand-border rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block">Stock Qty</label>
                    <input
                      type="number"
                      value={formData.initial_stock}
                      onChange={(e) => setFormData({ ...formData, initial_stock: Number(e.target.value) })}
                      className="w-full bg-white border border-brand-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-brand-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brand-charcoal hover:bg-brand-lavenderDark text-white rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
