'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, X, ArrowUpDown, Box, Loader2 } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { Product, Category } from '@/lib/types';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false); // soft loading — keeps old products visible
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const isFirstLoad = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  // Filters from query params
  const categoryParam = searchParams.get('category') || '';
  const audienceParam = searchParams.get('audience') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const onSaleParam = searchParams.get('on_sale') === 'true';
  const inStockParam = searchParams.get('in_stock') === 'true';

  // Load categories once
  useEffect(() => {
    fetchCategories().then((res) => {
      setCategories(res.results || []);
    }).catch(() => {});
  }, []);

  // Load products on filter change
  useEffect(() => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    const params: Record<string, any> = {};
    if (categoryParam) params.category = categoryParam;
    if (audienceParam) params.audience = audienceParam;
    if (searchParam) params.search = searchParam;
    if (sortParam) params.sort = sortParam;
    if (onSaleParam) params.on_sale = 'true';
    if (inStockParam) params.in_stock = 'true';

    if (isFirstLoad.current) {
      // First load: show full skeleton
      setLoading(true);
    } else {
      // Subsequent filter changes: soft overlay — keep old products visible
      setFiltering(true);
    }

    fetchProducts(params)
      .then((res) => {
        setProducts(res.results || []);
        setTotalCount(res.count || 0);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          console.error(err);
        }
      })
      .finally(() => {
        setLoading(false);
        setFiltering(false);
        isFirstLoad.current = false;
      });
  }, [categoryParam, audienceParam, searchParam, sortParam, onSaleParam, inStockParam]);

  const updateParam = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    router.push(`/shop?${nextParams.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  const hasActiveFilters = Boolean(categoryParam || audienceParam || searchParam || onSaleParam || inStockParam);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-brand-border">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-brand-lavender font-semibold block mb-1">
            Atelier Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            {searchParam
              ? `Search Results for "${searchParam}"`
              : categoryParam
              ? `${categoryParam.toUpperCase()} Collection`
              : audienceParam
              ? `${audienceParam} Collection`
              : onSaleParam
              ? 'Private Sale Collection'
              : 'The Complete Collection'}
          </h1>
          <p className="text-xs text-brand-secondary mt-1 flex items-center gap-2">
            {filtering ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-brand-lavender" />
                <span>Updating collection…</span>
              </>
            ) : (
              <span>Showing {totalCount} {totalCount === 1 ? 'curated piece' : 'curated pieces'}</span>
            )}
          </p>
        </div>

        {/* Controls: Filter Button on Mobile & Sort Selector */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="md:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 border border-brand-border rounded-xl text-xs font-semibold text-brand-charcoal bg-white shadow-sm active:bg-brand-light"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-brand-lavender" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-brand-secondary font-medium hidden sm:inline">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-xs bg-white border border-brand-border rounded-xl px-3 py-2 text-brand-charcoal focus:outline-none focus:border-brand-lavender font-medium shadow-sm"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="bestseller">Bestselling</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {filterDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm transition-opacity"
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:max-w-xs">
            <div className="w-full bg-white shadow-2xl flex flex-col justify-between">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand-lavender" />
                  <h3 className="font-serif text-base font-semibold text-brand-charcoal">Filter Catalog</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1.5 text-brand-secondary hover:text-brand-charcoal rounded-lg"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Active Filter Clear */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                    <span className="text-xs font-semibold uppercase text-brand-charcoal">Active Filters</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearAllFilters();
                        setFilterDrawerOpen(false);
                      }}
                      className="text-xs text-brand-lavenderDark font-semibold hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {/* Audience */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">Audience</h4>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { label: 'All', value: '' },
                      { label: 'Women', value: 'WOMEN' },
                      { label: 'Men', value: 'MEN' },
                      { label: 'Kids', value: 'KIDS' },
                    ].map((aud) => (
                      <button
                        key={aud.value}
                        type="button"
                        onClick={() => updateParam('audience', aud.value || null)}
                        className={`py-2 px-3 rounded-lg text-left font-medium transition-colors border ${audienceParam === aud.value ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-brand-light text-brand-charcoal border-brand-border/60'}`}
                      >
                        {aud.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">Category</h4>
                  <div className="space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => updateParam('category', null)}
                      className={`block w-full text-left py-2 px-3 rounded-lg font-medium transition-colors ${!categoryParam ? 'bg-brand-light text-brand-lavenderDark font-bold' : 'text-brand-secondary'}`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => updateParam('category', cat.slug)}
                        className={`w-full flex items-center justify-between py-2 px-3 rounded-lg font-medium transition-colors ${categoryParam === cat.slug ? 'bg-brand-light text-brand-lavenderDark font-bold' : 'text-brand-secondary'}`}
                      >
                        <span>{cat.name}</span>
                        {cat.product_count > 0 && (
                          <span className="text-[11px] text-gray-400">({cat.product_count})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Refinements */}
                <div className="space-y-3 pt-3 border-t border-brand-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">Refinements</h4>
                  <div className="space-y-2.5 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockParam}
                        onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
                        className="rounded border-gray-300 text-brand-lavender focus:ring-brand-lavender h-4 w-4"
                      />
                      <span className="text-brand-charcoal font-medium">In Stock Only</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onSaleParam}
                        onChange={(e) => updateParam('on_sale', e.target.checked ? 'true' : null)}
                        className="rounded border-gray-300 text-brand-lavender focus:ring-brand-lavender h-4 w-4"
                      />
                      <span className="text-brand-charcoal font-medium">On Sale / Special Offer</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-brand-border bg-brand-light">
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="w-full py-3 bg-brand-charcoal text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-brand-lavender transition-colors"
                >
                  View {totalCount} Pieces
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 pt-6 sm:pt-8">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block space-y-8 pr-4">
          
          {/* Active Filter Clear button */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">Filters Applied</span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-brand-lavenderDark hover:underline font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Target Audience Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Audience</h3>
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'All Audiences', value: '' },
                { label: 'Women', value: 'WOMEN' },
                { label: 'Men', value: 'MEN' },
                { label: 'Kids', value: 'KIDS' },
              ].map((aud) => (
                <button
                  key={aud.value}
                  type="button"
                  onClick={() => updateParam('audience', aud.value || null)}
                  className={`block w-full text-left py-1.5 px-2 rounded-md transition-colors ${audienceParam === aud.value ? 'bg-brand-light font-semibold text-brand-lavenderDark' : 'text-brand-secondary hover:text-brand-charcoal'}`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Categories</h3>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => updateParam('category', null)}
                className={`block w-full text-left py-1.5 px-2 rounded-md transition-colors ${!categoryParam ? 'bg-brand-light font-semibold text-brand-lavenderDark' : 'text-brand-secondary hover:text-brand-charcoal'}`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateParam('category', cat.slug)}
                  className={`block w-full text-left py-1.5 px-2 rounded-md transition-colors ${categoryParam === cat.slug ? 'bg-brand-light font-semibold text-brand-lavenderDark' : 'text-brand-secondary hover:text-brand-charcoal'}`}
                >
                  <span>{cat.name}</span>
                  {cat.product_count > 0 && (
                    <span className="float-right text-gray-400 font-normal">({cat.product_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Availability & Offers */}
          <div className="space-y-3 pt-4 border-t border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Refinements</h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-brand-secondary hover:text-brand-charcoal">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
                  className="rounded border-gray-300 text-brand-lavender focus:ring-brand-lavender"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-brand-secondary hover:text-brand-charcoal">
                <input
                  type="checkbox"
                  checked={onSaleParam}
                  onChange={(e) => updateParam('on_sale', e.target.checked ? 'true' : null)}
                  className="rounded border-gray-300 text-brand-lavender focus:ring-brand-lavender"
                />
                <span>On Sale / Special Offer</span>
              </label>
            </div>
          </div>

        </aside>

        {/* Product Grid Area (2-column on mobile, 3-column on desktop) */}
        <div className="md:col-span-3">
          {loading ? (
            // Full skeleton on first load only
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse flex flex-col space-y-3">
                  <div className="aspect-[3/4] bg-gray-200 rounded-xl w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 && !filtering ? (
            <div className="text-center py-16 sm:py-20 px-4 space-y-4 bg-brand-light rounded-2xl border border-brand-border">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mx-auto text-brand-secondary shadow-subtle">
                <Box className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-normal text-brand-charcoal">No products match your criteria</h3>
              <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                Try clearing active filters or search terms to explore our full atelier catalogue.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-brand-charcoal text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-lavender transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            // Wrap products in a relative container to show a subtle overlay while filtering
            <div className={`relative transition-opacity duration-200 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
              {filtering && (
                <div className="absolute inset-0 z-10 flex items-start justify-center pt-16 pointer-events-none">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-card border border-brand-border text-xs font-medium text-brand-charcoal">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-lavender" />
                    <span>Loading collection…</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function ShopPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-charcoal border-t-brand-lavender rounded-full animate-spin"></div>
        </div>
      }
    >
      <ShopContent />
    </React.Suspense>
  );
}
