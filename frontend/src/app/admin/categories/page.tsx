'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, FolderTree, Check, X, Search, Sparkles } from 'lucide-react';
import { fetchAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '@/lib/api';
import { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '' as string | number,
    audience: 'ALL',
    display_order: 0,
    is_active: true,
    is_featured: false,
    seo_title: '',
    seo_description: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = () => {
    setLoading(true);
    fetchAdminCategories()
      .then((res) => setCategories(res.results || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent: '',
      audience: 'ALL',
      display_order: 0,
      is_active: true,
      is_featured: false,
      seo_title: '',
      seo_description: '',
    });
    setImageFile(null);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parent: cat.parent || '',
      audience: cat.audience,
      display_order: cat.display_order,
      is_active: cat.is_active,
      is_featured: cat.is_featured,
      seo_title: cat.seo_title || '',
      seo_description: cat.seo_description || '',
    });
    setImageFile(null);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        ...formData,
        parent: formData.parent ? Number(formData.parent) : null,
      };

      if (editingCategory) {
        await updateAdminCategory(editingCategory.slug, { ...payload, ...(imageFile ? { image: imageFile } : {}) });
      } else {
        await createAdminCategory({ ...payload, ...(imageFile ? { image: imageFile } : {}) });
      }

      setModalOpen(false);
      setImageFile(null);
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slug: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? Products in this category will remain intact.`)) {
      return;
    }
    try {
      await deleteAdminCategory(slug);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavenderDark block mb-1">
            Dynamic Taxonomy
          </span>
          <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
            Category & Subcategory Management
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Create, reorder, and activate categories dynamically. Changes instantly propagate to storefront navigation.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-brand-charcoal hover:bg-brand-lavenderDark text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-subtle flex items-center gap-2 self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search and Table Area */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        
        {/* Table Top Controls */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 text-brand-secondary absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories by name or slug..."
              className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
            />
          </div>
          <span className="text-xs text-brand-secondary font-medium">
            {filteredCategories.length} categories found
          </span>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-light text-brand-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Parent Level</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-secondary animate-pulse">
                    Loading category taxonomy...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-secondary">
                    No categories found. Click "Add New Category" above to create one.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-brand-light/40 transition-colors">
                    
                    <td className="py-3.5 px-4 font-semibold text-brand-charcoal flex items-center gap-3">
                      {(cat.image_url || cat.image) && (
                        <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-brand-border">
                          <Image src={cat.image_url || cat.image || ''} alt={cat.name} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <span className="block font-serif text-sm">{cat.name}</span>
                        {cat.is_featured && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                            Featured Tile
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-brand-secondary">
                      /{cat.slug}
                    </td>

                    <td className="py-3.5 px-4">
                      {cat.parent_name ? (
                        <span className="inline-flex items-center gap-1 text-brand-lavenderDark font-medium">
                          <FolderTree className="h-3 w-3" />
                          <span>{cat.parent_name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 font-mono text-[11px]">Root Category</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-brand-charcoal">
                      {cat.audience}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-brand-charcoal">
                      {cat.product_count}
                    </td>

                    <td className="py-3.5 px-4 text-brand-secondary font-mono">
                      {cat.display_order}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-brand-secondary hover:text-brand-charcoal rounded hover:bg-gray-100 transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.slug, cat.name)}
                        className="p-1.5 text-brand-secondary hover:text-red-600 rounded hover:bg-gray-100 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Create / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-center pb-3 border-b border-brand-border">
              <h3 className="font-serif text-xl font-normal text-brand-charcoal">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Silk Scarves"
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                  />
                </div>
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Slug (Optional)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. silk-scarves"
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Parent Category</label>
                  <select
                    value={formData.parent}
                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                  >
                    <option value="">None (Top-Level Root)</option>
                    {categories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Audience Association</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                  >
                    <option value="ALL">All Audiences</option>
                    <option value="WOMEN">Women</option>
                    <option value="MEN">Men</option>
                    <option value="KIDS">Kids</option>
                    <option value="UNISEX">Unisex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1 file:text-xs"
                />
                {imageFile ? (
                  <p className="mt-1 text-[10px] text-brand-secondary">Selected: {imageFile.name}</p>
                ) : editingCategory?.image_url || editingCategory?.image ? (
                  <p className="mt-1 text-[10px] text-brand-secondary">Choose a file to replace the current image.</p>
                ) : null}
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of this product category..."
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal focus:outline-none focus:border-brand-lavender"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 items-center pt-2">
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-1.5 text-brand-charcoal"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-brand-lavender"
                  />
                  <label htmlFor="is_active" className="cursor-pointer font-medium text-brand-charcoal">
                    Active
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded text-brand-lavender"
                  />
                  <label htmlFor="is_featured" className="cursor-pointer font-medium text-brand-charcoal">
                    Homepage Tile
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-brand-secondary hover:text-brand-charcoal font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-brand-charcoal hover:bg-brand-lavenderDark text-white rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
