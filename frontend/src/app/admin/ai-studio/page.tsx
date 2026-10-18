'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles, Wand2, Box, Image as ImageIcon, Scissors,
  FileText, History, Settings, Check, ArrowRight, Download,
  Layers, RefreshCw, Plus, ExternalLink
} from 'lucide-react';
import ThreeDViewer from '@/components/ThreeDViewer';
import {
  enhanceAIPrompt, generateAITextToImage, extractProductBackground,
  analyzeProductWithVision, generateImagePackage, generateAI3DModel,
  fetchAIAssets, attachAIAsset, fetchAIHistory, fetchAISettingsStatus,
  fetchProducts, createAdminProduct, addProductVariant
} from '@/lib/api';
import { AIAsset, AIJob, Product } from '@/lib/types';

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState<'text2img' | 'extractor' | 'assistant' | '3d' | 'packages' | 'assets' | 'history' | 'settings'>('text2img');

  // Products list for "Attach to product"
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    fetchProducts({}).then((res) => setProducts(res.results || [])).catch(() => {});
  }, []);

  // 1. Text to Image state
  const [t2iPrompt, setT2iPrompt] = useState('Create a premium studio photograph of a luxury cashmere coat on a clean light-grey background, soft studio shadows');
  const [t2iAspectRatio, setT2iAspectRatio] = useState('1:1');
  const [t2iStyle, setT2iStyle] = useState('editorial');
  const [t2iLoading, setT2iLoading] = useState(false);
  const [t2iEnhancing, setT2iEnhancing] = useState(false);
  const [t2iResults, setT2iResults] = useState<any[]>([]);
  const [t2iSelectedProduct, setT2iSelectedProduct] = useState<number | ''>('');
  const [t2iActionMessage, setT2iActionMessage] = useState<string | null>(null);

  // 2. Extractor state
  const [extractorImageUrl, setExtractorImageUrl] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop');
  const [extractorBg, setExtractorBg] = useState('transparent');
  const [extractorLoading, setExtractorLoading] = useState(false);
  const [extractorResult, setExtractorResult] = useState<any>(null);

  // 3. Vision Assistant state
  const [visionImageUrl, setVisionImageUrl] = useState('https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop');
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionAnalysis, setVisionAnalysis] = useState<any>(null);
  const [draftCreated, setDraftCreated] = useState(false);

  // 4. 3D Studio state
  const [threeDImageUrl, setThreeDImageUrl] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop');
  const [threeDPrompt, setThreeDPrompt] = useState('Reconstruct luxury sneaker with clean geometric topology');
  const [threeDLoading, setThreeDLoading] = useState(false);
  const [threeDModelUrl, setThreeDModelUrl] = useState<string>('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb');
  const [threeDSelectedProduct, setThreeDSelectedProduct] = useState<number | ''>('');
  const [threeDAttachedMsg, setThreeDAttachedMsg] = useState<string | null>(null);

  // 5. Packages state
  const [pkgImageUrl, setPkgImageUrl] = useState('https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop');
  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkgResults, setPkgResults] = useState<any[]>([]);

  // 6. Asset Library state
  const [assets, setAssets] = useState<AIAsset[]>([]);
  const [assetFilter, setAssetFilter] = useState('');
  const [loadingAssets, setLoadingAssets] = useState(false);

  // 7. History state
  const [historyJobs, setHistoryJobs] = useState<AIJob[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 8. Settings state
  const [aiSettings, setAiSettings] = useState<any>(null);

  // Handlers
  const handleEnhancePrompt = async () => {
    if (!t2iPrompt.trim()) return;
    try {
      setT2iEnhancing(true);
      const res = await enhanceAIPrompt(t2iPrompt);
      if (res && res.enhanced_prompt) {
        setT2iPrompt(res.enhanced_prompt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setT2iEnhancing(false);
    }
  };

  const handleGenerateTextToImage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setT2iLoading(true);
      setT2iActionMessage(null);
      const res = await generateAITextToImage({
        prompt: t2iPrompt,
        aspect_ratio: t2iAspectRatio,
        style: t2iStyle,
        count: 2,
      });
      if (res && res.job && res.job.result_assets) {
        setT2iResults(res.job.result_assets);
      }
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setT2iLoading(false);
    }
  };

  const handleAttachT2IImage = async (imageUrl: string) => {
    if (!t2iSelectedProduct) {
      alert('Please select a product from the dropdown first.');
      return;
    }
    const targetProduct = products.find((p) => p.id === Number(t2iSelectedProduct));
    if (!targetProduct) return;

    try {
      await fetch(`/api/v1/catalog/products/${targetProduct.slug}/add_image/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
        },
        body: JSON.stringify({
          image_url: imageUrl,
          is_ai_generated: true,
          is_primary: false,
        }),
      });
      setT2iActionMessage(`Successfully attached to "${targetProduct.name}"!`);
      setTimeout(() => setT2iActionMessage(null), 3000);
    } catch (err: any) {
      alert('Failed to attach image');
    }
  };

  const handleExtractProduct = async () => {
    try {
      setExtractorLoading(true);
      const res = await extractProductBackground({
        image_url: extractorImageUrl,
        background: extractorBg,
      });
      setExtractorResult(res.results?.[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setExtractorLoading(false);
    }
  };

  const handleAnalyzeVision = async () => {
    try {
      setVisionLoading(true);
      setDraftCreated(false);
      const res = await analyzeProductWithVision(visionImageUrl);
      setVisionAnalysis(res.analysis || null);
    } catch (err) {
      console.error(err);
    } finally {
      setVisionLoading(false);
    }
  };

  const handleCreateDraftFromVision = async () => {
    if (!visionAnalysis) return;
    try {
      const sku = `KD-AI-${Date.now().toString().slice(-4)}`;
      const prod = await createAdminProduct({
        name: visionAnalysis.title,
        sku: sku,
        short_description: visionAnalysis.short_description || '',
        description: visionAnalysis.full_description || '',
        audience: visionAnalysis.audience || 'WOMEN',
        regular_price: Number(visionAnalysis.suggested_price || 280),
        seo_title: visionAnalysis.seo_title || '',
        seo_description: visionAnalysis.seo_description || '',
        is_active: false, // DRAFT status until approved!
      });

      // Add default variant
      await addProductVariant(prod.slug, {
        name: `Standard / ${visionAnalysis.visible_colors?.[0]?.name || 'Noir'}`,
        size: visionAnalysis.recommended_sizes?.[0] || 'M',
        color_name: visionAnalysis.visible_colors?.[0]?.name || 'Noir',
        color_hex: visionAnalysis.visible_colors?.[0]?.hex || '#202124',
        sku: `${sku}-M`,
        stock_quantity: 10,
      });

      // Attach analyzed image
      await fetch(`/api/v1/catalog/products/${prod.slug}/add_image/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
        },
        body: JSON.stringify({
          image_url: visionImageUrl,
          is_ai_generated: true,
          is_primary: true,
        }),
      });

      setDraftCreated(true);
    } catch (err: any) {
      alert(err.message || 'Failed to create product draft');
    }
  };

  const handleGenerate3D = async () => {
    try {
      setThreeDLoading(true);
      setThreeDAttachedMsg(null);
      const res = await generateAI3DModel(threeDImageUrl, threeDPrompt, 'GLB');
      if (res && res.model_3d && res.model_3d.model_url) {
        setThreeDModelUrl(res.model_3d.model_url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setThreeDLoading(false);
    }
  };

  const handleAttach3DToProduct = async () => {
    if (!threeDSelectedProduct) {
      alert('Please select a product first.');
      return;
    }
    const targetProduct = products.find((p) => p.id === Number(threeDSelectedProduct));
    if (!targetProduct) return;

    try {
      await fetch(`/api/v1/catalog/products/${targetProduct.slug}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('klein_access_token') || ''}`,
        },
        body: JSON.stringify({ model_3d_url: threeDModelUrl }),
      });
      setThreeDAttachedMsg(`3D model successfully attached to "${targetProduct.name}"!`);
      setTimeout(() => setThreeDAttachedMsg(null), 3500);
    } catch (err) {
      alert('Failed to attach 3D model');
    }
  };

  const handleGeneratePackages = async () => {
    try {
      setPkgLoading(true);
      const res = await generateImagePackage(pkgImageUrl);
      setPkgResults(res.package || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPkgLoading(false);
    }
  };

  // Tab Loaders
  useEffect(() => {
    if (activeTab === 'assets') {
      setLoadingAssets(true);
      fetchAIAssets(assetFilter || undefined)
        .then((res) => setAssets(res.results || []))
        .catch(() => {})
        .finally(() => setLoadingAssets(false));
    } else if (activeTab === 'history') {
      setLoadingHistory(true);
      fetchAIHistory()
        .then((res) => setHistoryJobs(res.results || []))
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    } else if (activeTab === 'settings') {
      fetchAISettingsStatus()
        .then((res) => setAiSettings(res))
        .catch(() => {});
    }
  }, [activeTab, assetFilter]);

  return (
    <div className="space-y-8">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender/20 border border-brand-lavender/40 text-xs font-semibold text-brand-lavenderDark tracking-wider uppercase mb-1">
            <Sparkles className="h-3.5 w-3.5 text-brand-lavender" />
            <span>Maison AI Creative Studio</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            Product Media & 3D Intelligence
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Empowering luxury fashion photography, neural background removal, vision drafts, and 3D generation.
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="font-semibold text-brand-charcoal block">Connected Providers:</span>
          <span className="text-brand-lavenderDark font-mono font-medium">
            OpenAI · Stability · Meshy 3D · Neural Engine
          </span>
        </div>
      </div>

      {/* Studio Workspace Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-border">
        {[
          { id: 'text2img', label: 'Image Generator', icon: ImageIcon },
          { id: 'extractor', label: 'Product Extractor', icon: Scissors },
          { id: 'assistant', label: 'Vision Assistant (Drafts)', icon: FileText },
          { id: '3d', label: 'Image-to-3D Studio', icon: Box },
          { id: 'packages', label: 'Image Packages', icon: Layers },
          { id: 'assets', label: 'Asset Library', icon: Sparkles },
          { id: 'history', label: 'Generation History', icon: History },
          { id: 'settings', label: 'AI Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${isActive ? 'bg-brand-charcoal text-white shadow-subtle' : 'bg-white text-brand-secondary hover:text-brand-charcoal border border-brand-border'}`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* WORKSPACE 1: Text to Image Generator */}
      {activeTab === 'text2img' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Panel (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-5 text-xs">
            <h3 className="font-serif text-lg text-brand-charcoal font-medium pb-2 border-b border-brand-border">
              Creative Prompt & Parameters
            </h3>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-brand-charcoal">Description / Prompt</label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={t2iEnhancing || !t2iPrompt.trim()}
                  className="text-brand-lavenderDark hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>{t2iEnhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={t2iPrompt}
                onChange={(e) => setT2iPrompt(e.target.value)}
                placeholder="Describe your desired luxury fashion piece, composition, and lighting..."
                className="w-full bg-brand-light border border-brand-border rounded-xl p-3 text-brand-charcoal focus:outline-none focus:border-brand-lavender"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-brand-charcoal block mb-1">Aspect Ratio</label>
                <select
                  value={t2iAspectRatio}
                  onChange={(e) => setT2iAspectRatio(e.target.value)}
                  className="w-full bg-brand-light border border-brand-border rounded-lg p-2 text-brand-charcoal"
                >
                  <option value="1:1">1:1 Square (Catalog)</option>
                  <option value="3:4">3:4 Portrait (Editorial)</option>
                  <option value="16:9">16:9 Landscape (Banner)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-brand-charcoal block mb-1">Aesthetic Preset</label>
                <select
                  value={t2iStyle}
                  onChange={(e) => setT2iStyle(e.target.value)}
                  className="w-full bg-brand-light border border-brand-border rounded-lg p-2 text-brand-charcoal"
                >
                  <option value="editorial">Minimalist Luxury Editorial</option>
                  <option value="studio">Pure Studio Seamless Light</option>
                  <option value="lifestyle">Atmospheric Lifestyle</option>
                  <option value="campaign">Seasonal Campaign</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateTextToImage}
              disabled={t2iLoading || !t2iPrompt.trim()}
              className="w-full py-3.5 bg-brand-charcoal hover:bg-brand-lavenderDark text-white font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-float flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {t2iLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Generating Luxury Visuals...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-brand-lavender" />
                  <span>Generate AI Images</span>
                </>
              )}
            </button>
          </div>

          {/* Results Gallery Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-brand-border">
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">
                Generated Visuals ({t2iResults.length})
              </h3>
              {t2iActionMessage && (
                <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  <span>{t2iActionMessage}</span>
                </span>
              )}
            </div>

            {t2iResults.length === 0 ? (
              <div className="py-24 text-center space-y-3 bg-brand-light rounded-xl border border-brand-border">
                <ImageIcon className="h-10 w-10 text-brand-secondary mx-auto stroke-[1.5]" />
                <p className="text-sm font-medium text-brand-charcoal">No images generated yet</p>
                <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                  Enter your prompt on the left and click "Generate AI Images" to create high-fashion catalog assets.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {t2iResults.map((item, idx) => (
                    <div key={idx} className="group relative rounded-xl overflow-hidden border border-brand-border bg-brand-light">
                      <div className="relative aspect-square w-full">
                        <Image src={item.url} alt={`Generated AI ${idx + 1}`} fill className="object-cover" />
                      </div>
                      <div className="p-3 bg-white space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-brand-secondary">
                          <span>{item.provider}</span>
                          <span>{item.dimensions || '1024x1024'}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAttachT2IImage(item.url)}
                            className="flex-1 py-1.5 px-2 bg-brand-charcoal hover:bg-brand-lavender text-white rounded text-[11px] font-semibold uppercase tracking-wider transition-colors"
                          >
                            Attach to Product
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 border border-brand-border rounded hover:bg-brand-light"
                            title="Download / View Full"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Attach to target product selector */}
                <div className="p-4 bg-brand-light rounded-xl border border-brand-border space-y-2 text-xs">
                  <label className="font-semibold text-brand-charcoal block">Target Product for Attachment:</label>
                  <select
                    value={t2iSelectedProduct}
                    onChange={(e) => setT2iSelectedProduct(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white border border-brand-border rounded-lg p-2 text-brand-charcoal font-medium"
                  >
                    <option value="">Select a product from catalog...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* WORKSPACE 2: Product Extractor */}
      {activeTab === 'extractor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-5 text-xs">
            <h3 className="font-serif text-lg text-brand-charcoal font-medium pb-2 border-b border-brand-border">
              Isolate Product & Background Removal
            </h3>
            <p className="text-brand-secondary">
              Upload or link a raw photograph. The neural segmentation engine removes background noise and isolates the garment.
            </p>

            <div>
              <label className="font-semibold text-brand-charcoal block mb-1">Image URL</label>
              <input
                type="url"
                value={extractorImageUrl}
                onChange={(e) => setExtractorImageUrl(e.target.value)}
                className="w-full bg-brand-light border border-brand-border rounded-lg p-2 text-brand-charcoal"
              />
            </div>

            <div>
              <label className="font-semibold text-brand-charcoal block mb-1">Output Backdrop</label>
              <select
                value={extractorBg}
                onChange={(e) => setExtractorBg(e.target.value)}
                className="w-full bg-brand-light border border-brand-border rounded-lg p-2 text-brand-charcoal"
              >
                <option value="transparent">Transparent PNG (Alpha Channel)</option>
                <option value="white">Pure White E-Commerce Catalog</option>
                <option value="grey">Minimalist Studio Concrete Grey</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleExtractProduct}
              disabled={extractorLoading}
              className="w-full py-3.5 bg-brand-charcoal hover:bg-brand-lavenderDark text-white font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-float flex items-center justify-center gap-2"
            >
              {extractorLoading ? <span>Processing Segmentation...</span> : (
                <>
                  <Scissors className="h-4 w-4" />
                  <span>Extract Product</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-4">
            <h3 className="font-serif text-lg text-brand-charcoal font-medium pb-2 border-b border-brand-border">
              Side-by-Side Comparison
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-brand-secondary uppercase block">Original Photo</span>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-light border border-brand-border">
                  <Image src={extractorImageUrl} alt="Original" fill className="object-cover" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-brand-lavenderDark uppercase block">Extracted Result</span>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#E5E7EB] border border-brand-border flex items-center justify-center">
                  {extractorResult ? (
                    <Image src={extractorResult.extracted_url} alt="Extracted" fill className="object-contain p-2" />
                  ) : (
                    <span className="text-xs text-brand-secondary">Click "Extract Product" to preview</span>
                  )}
                </div>
              </div>
            </div>

            {extractorResult && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-xs text-green-800 space-y-1">
                <p className="font-bold">✓ Product isolated with clean silhouette edge preservation.</p>
                <p>Saved automatically to your central Asset Library.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WORKSPACE 3: AI Product Vision Assistant & Drafts */}
      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-5 text-xs">
            <h3 className="font-serif text-lg text-brand-charcoal font-medium pb-2 border-b border-brand-border">
              Vision Understanding to Draft
            </h3>
            <p className="text-brand-secondary">
              Upload a photograph of any piece. AI vision extracts fabric, style tags, SEO metadata, and drafts the listing.
            </p>

            <div>
              <label className="font-semibold text-brand-charcoal block mb-1">Product Photo URL</label>
              <input
                type="url"
                value={visionImageUrl}
                onChange={(e) => setVisionImageUrl(e.target.value)}
                className="w-full bg-brand-light border border-brand-border rounded-lg p-2 text-brand-charcoal"
              />
            </div>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-brand-light border border-brand-border">
              <Image src={visionImageUrl} alt="Input" fill className="object-cover" />
            </div>

            <button
              type="button"
              onClick={handleAnalyzeVision}
              disabled={visionLoading}
              className="w-full py-3.5 bg-brand-charcoal hover:bg-brand-lavenderDark text-white font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-float flex items-center justify-center gap-2"
            >
              {visionLoading ? <span>Analyzing Fabric & Aesthetics...</span> : (
                <>
                  <Wand2 className="h-4 w-4 text-brand-lavender" />
                  <span>Analyze Product with AI</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-brand-border">
              <h3 className="font-serif text-lg text-brand-charcoal font-medium">
                AI Vision Suggestions
              </h3>
              {draftCreated && (
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  ✓ Created Unpublished Draft in Catalog
                </span>
              )}
            </div>

            {!visionAnalysis ? (
              <div className="py-20 text-center space-y-3 bg-brand-light rounded-xl border border-brand-border">
                <FileText className="h-10 w-10 text-brand-secondary mx-auto stroke-[1.5]" />
                <p className="text-sm font-medium text-brand-charcoal">No vision analysis yet</p>
                <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                  Click "Analyze Product with AI" on the left to extract titles, descriptions, and categories.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-brand-light rounded-xl space-y-2 border border-brand-border">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-secondary">Suggested Title</span>
                    <p className="font-serif text-base font-semibold text-brand-charcoal">{visionAnalysis.title}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-secondary">Short Overview</span>
                    <p className="text-brand-charcoal">{visionAnalysis.short_description}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-secondary">Category & Audience</span>
                    <p className="text-brand-charcoal font-medium">{visionAnalysis.category} · {visionAnalysis.audience}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-secondary">Suggested Price</span>
                    <p className="text-base font-bold text-brand-charcoal">{visionAnalysis.suggested_price} DT (Recommended)</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {visionAnalysis.style_tags?.map((tag: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-brand-lavender/15 text-brand-lavenderDark rounded-full text-[11px] font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCreateDraftFromVision}
                  disabled={draftCreated}
                  className="w-full py-3 bg-brand-charcoal hover:bg-brand-lavenderDark text-white font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{draftCreated ? 'Product Draft Added to Catalog' : 'Create Product Draft from Suggestions'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WORKSPACE 4: Image-to-3D Studio */}
      {activeTab === '3d' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-5 text-xs">
            <h3 className="font-serif text-lg text-brand-charcoal font-medium pb-2 border-b border-brand-border">
              3D Neural Reconstruction
            </h3>
            <p className="text-brand-secondary">
              Transforms 2D product photos into genuine interactive GLB 3D models with materials and geometry.
            </p>

            <div>
              <label className="font-semibold text-brand-charcoal block mb-1">Source Photo URL</label>
              <input
                type="url"
                value={threeDImageUrl}
                onChange={(e) => setThreeDImageUrl(e.target.value)}
                className="w-full bg-brand-light border border-brand-border rounded-lg p-2 text-brand-charcoal"
              />
            </div>

            <div>
              <label className="font-semibold text-brand-charcoal block mb-1">Reconstruction Guidance</label>
              <input
                type="text"
                value={threeDPrompt}
                onChange={(e) => setThreeDPrompt(e.target.value)}
                className="w-full bg-brand-light border border-brand-border rounded-lg p-2 text-brand-charcoal"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate3D}
              disabled={threeDLoading}
              className="w-full py-3.5 bg-brand-charcoal hover:bg-brand-lavenderDark text-white font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-float flex items-center justify-center gap-2"
            >
              {threeDLoading ? <span>Reconstructing 3D Mesh...</span> : (
                <>
                  <Box className="h-4 w-4 text-brand-lavender" />
                  <span>Generate 3D Model</span>
                </>
              )}
            </button>

            {/* Target product link */}
            <div className="pt-4 border-t border-brand-border space-y-2">
              <label className="font-semibold text-brand-charcoal block">Attach 3D Model to Storefront Product:</label>
              <div className="flex gap-2">
                <select
                  value={threeDSelectedProduct}
                  onChange={(e) => setThreeDSelectedProduct(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 bg-brand-light border border-brand-border rounded-lg p-2 text-brand-charcoal"
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAttach3DToProduct}
                  className="px-3 py-2 bg-brand-charcoal text-white rounded-lg font-semibold uppercase tracking-wider hover:bg-brand-lavender transition-colors"
                >
                  Attach
                </button>
              </div>
              {threeDAttachedMsg && <p className="text-xs text-green-700 font-semibold">{threeDAttachedMsg}</p>}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-4">
            <h3 className="font-serif text-lg text-brand-charcoal font-medium pb-2 border-b border-brand-border">
              Interactive 3D Viewport
            </h3>
            
            <ThreeDViewer modelUrl={threeDModelUrl} className="h-[460px] w-full" />
            <div className="flex justify-between items-center text-xs text-brand-secondary">
              <span>Format: Binary GLB (glTF 2.0)</span>
              <a
                href={threeDModelUrl}
                download
                className="text-brand-lavenderDark font-semibold hover:underline flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download GLB Asset</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE 5: Automatic Image Packages */}
      {activeTab === 'packages' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-brand-border shadow-subtle">
          <div className="max-w-xl space-y-4 text-xs">
            <h3 className="font-serif text-xl font-normal text-brand-charcoal">Automatic Image Package Suite</h3>
            <p className="text-brand-secondary">
              Generate a unified set of catalog white background, minimalist luxury editorial, and social campaign visuals from one reference photo.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={pkgImageUrl}
                onChange={(e) => setPkgImageUrl(e.target.value)}
                className="flex-1 bg-brand-light border border-brand-border rounded-lg p-2 text-brand-charcoal"
              />
              <button
                type="button"
                onClick={handleGeneratePackages}
                disabled={pkgLoading}
                className="px-6 py-2 bg-brand-charcoal hover:bg-brand-lavenderDark text-white rounded-lg font-semibold uppercase tracking-wider"
              >
                {pkgLoading ? 'Generating...' : 'Generate Suite'}
              </button>
            </div>
          </div>

          {pkgResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-brand-border">
              {pkgResults.map((pkg, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-brand-border space-y-2 p-3 bg-brand-light">
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white">
                    <Image src={pkg.url} alt={pkg.type} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-brand-charcoal">{pkg.type}</h4>
                    <p className="text-[11px] text-brand-secondary">{pkg.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE 6: Asset Library */}
      {activeTab === 'assets' && (
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-brand-border">
            <h3 className="font-serif text-xl font-normal text-brand-charcoal">Central Asset Library</h3>
            <div className="flex gap-2">
              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="bg-brand-light border border-brand-border rounded-lg px-3 py-1.5 text-xs text-brand-charcoal font-medium"
              >
                <option value="">All Asset Formats</option>
                <option value="IMAGE">Photography</option>
                <option value="MODEL_3D">3D Models</option>
                <option value="SEGMENTED_PNG">Segmented PNGs</option>
              </select>
            </div>
          </div>

          {loadingAssets ? (
            <div className="py-16 text-center text-xs text-brand-secondary animate-pulse">Loading assets...</div>
          ) : assets.length === 0 ? (
            <div className="py-16 text-center text-xs text-brand-secondary">No assets found in library.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="rounded-xl border border-brand-border overflow-hidden bg-brand-light p-3 space-y-2 text-xs">
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white">
                    {asset.asset_type === 'MODEL_3D' ? (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-brand-charcoal text-white">
                        <Box className="h-10 w-10 text-brand-lavender mb-2" />
                        <span className="text-[10px] font-mono uppercase font-bold">3D Model</span>
                      </div>
                    ) : (
                      <Image src={asset.display_url || asset.file_url} alt={asset.title} fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-serif font-medium text-brand-charcoal line-clamp-1">{asset.title}</p>
                    <p className="text-[10px] text-brand-secondary">{asset.asset_type_display} · {asset.provider || 'AI'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE 7: Generation History */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-4">
          <h3 className="font-serif text-xl font-normal text-brand-charcoal pb-3 border-b border-brand-border">
            AI Task Queue & Generation History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-light text-brand-secondary uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Task ID</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Prompt / Input</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {historyJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-brand-light/40">
                    <td className="py-3 px-4 font-mono text-brand-charcoal">{String(job.id).slice(0, 8)}...</td>
                    <td className="py-3 px-4 font-semibold text-brand-charcoal">{job.job_type_display}</td>
                    <td className="py-3 px-4 text-brand-secondary max-w-xs truncate">{job.prompt || 'Binary image input'}</td>
                    <td className="py-3 px-4 font-mono">{job.duration_seconds}s</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {job.status_display}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-secondary text-right">
                      {new Date(job.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WORKSPACE 8: AI Settings & API Providers */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-subtle space-y-6 text-xs max-w-2xl">
          <h3 className="font-serif text-xl font-normal text-brand-charcoal pb-3 border-b border-brand-border">
            Connected AI Provider Ecosystem
          </h3>
          <p className="text-brand-secondary">
            KleinDream features a modular multi-provider architecture. If external API keys are configured in backend <code className="bg-brand-light px-1 py-0.5 rounded font-mono">.env</code>, live calls are made directly to OpenAI, Stability AI, Replicate, and Meshy 3D.
          </p>

          <div className="space-y-3">
            {[
              { name: 'OpenAI (DALL-E 3 & GPT-4o Vision)', envKey: 'OPENAI_API_KEY', status: aiSettings?.configured_api_keys?.openai },
              { name: 'Stability AI (SD3 / Core)', envKey: 'STABILITY_API_KEY', status: aiSettings?.configured_api_keys?.stability },
              { name: 'Replicate (Flux / Rembg)', envKey: 'REPLICATE_API_TOKEN', status: aiSettings?.configured_api_keys?.replicate },
              { name: 'Meshy AI (Image-to-3D GLB Engine)', envKey: 'MESHY_API_KEY', status: aiSettings?.configured_api_keys?.meshy },
            ].map((p, i) => (
              <div key={i} className="flex justify-between items-center p-3.5 bg-brand-light rounded-xl border border-brand-border">
                <div>
                  <span className="font-semibold text-brand-charcoal block">{p.name}</span>
                  <span className="text-[11px] font-mono text-brand-secondary">Environment: {p.envKey}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${p.status ? 'bg-green-100 text-green-700' : 'bg-brand-lavender/15 text-brand-lavenderDark'}`}>
                  {p.status ? 'Live API Key Active' : 'Neural Studio Engine Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
