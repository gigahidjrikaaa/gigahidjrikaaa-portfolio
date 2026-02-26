"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, SeoSettingsResponse } from "@/services/api";
import { useToast } from "@/components/ui/toast";
import {
  GlobeAltIcon,
  ShareIcon,
  PhotoIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const CHANGE_FREQS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'] as const;
type ChangeFreq = typeof CHANGE_FREQS[number];

interface SitemapRowProps {
  label: string;
  path: string;
  enabled: boolean;
  disableToggle?: boolean;
  priority: number;
  changefreq: string;
  onToggle?: () => void;
  onPriorityChange: (v: number) => void;
  onFreqChange: (v: string) => void;
}

function SitemapRow({ label, path, enabled, disableToggle, priority, changefreq, onToggle, onPriorityChange, onFreqChange }: SitemapRowProps) {
  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_100px_120px] items-center rounded-lg border p-3 transition-opacity ${
      enabled || disableToggle ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50/50 opacity-60'
    }`}>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="font-mono text-xs text-gray-400">{path}</p>
      </div>
      <div className="flex items-center">
        {disableToggle ? (
          <span className="text-xs text-gray-400">Always on</span>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            role="switch"
            aria-checked={enabled}
            className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </button>
        )}
      </div>
      <div>
        <input
          type="number"
          min={0}
          max={1}
          step={0.1}
          value={priority}
          onChange={(e) => onPriorityChange(parseFloat(e.target.value) || 0)}
          disabled={!enabled && !disableToggle}
          className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>
      <div>
        <select
          value={changefreq}
          onChange={(e) => onFreqChange(e.target.value)}
          disabled={!enabled && !disableToggle}
          className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {CHANGE_FREQS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
    </div>
  );
}

const copy = {
  title: "SEO Settings",
  description: "Optimize your site's search engine visibility and social sharing appearance.",
  fields: {
    siteTitle: "Site Title",
    siteTitleDesc: "The main title displayed in search results and browser tabs (recommended: 50-60 characters)",
    siteDescription: "Site Description",
    siteDescriptionDesc: "Brief description for search results (recommended: 150-160 characters)",
    keywords: "Keywords",
    keywordsDesc: "Comma-separated keywords for search engines",
    ogImage: "Open Graph Image",
    ogImageDesc: "Image shown when your site is shared on social media (recommended: 1200x630px)",
    canonicalUrl: "Canonical URL",
    canonicalUrlDesc: "Preferred URL for search engines (e.g., https://yourdomain.com)",
  },
  save: "Save Changes",
  saving: "Saving...",
  saved: "Saved!",
  error: "Failed to save",
  preview: "Preview",
  previewTitle: "Google Search Preview",
  previewDescription: "Open Graph Preview",
};

const SeoPage = () => {
  const [seo, setSeo] = useState<Partial<SeoSettingsResponse>>({
    site_title: '',
    site_description: '',
    keywords: '',
    og_image_url: '',
    canonical_url: '',
    sitemap_home_priority: 1.0,
    sitemap_home_changefreq: 'daily',
    sitemap_blog_enabled: true,
    sitemap_blog_priority: 0.9,
    sitemap_blog_changefreq: 'daily',
    sitemap_posts_enabled: true,
    sitemap_posts_priority: 0.8,
    sitemap_posts_changefreq: 'monthly',
    sitemap_custom_pages: '[]',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        const data = await adminApi.getSeoSettings();
        setSeo(data);
      } catch (error) {
        console.error('Failed to fetch SEO settings', error);
        toast({
          title: 'Error',
          description: 'Failed to load SEO settings.',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeoSettings();
  }, [toast]);

  const handleChange = (field: keyof SeoSettingsResponse, value: string) => {
    setSeo(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBoolToggle = (field: keyof SeoSettingsResponse) => {
    setSeo(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
    setHasChanges(true);
  };

  const handleNumChange = (field: keyof SeoSettingsResponse, value: number) => {
    setSeo(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Custom pages helpers
  type CustomPage = { url: string; priority: number; changefreq: ChangeFreq };
  const parsedCustomPages = (): CustomPage[] => {
    try { return JSON.parse(seo.sitemap_custom_pages || '[]'); }
    catch { return []; }
  };
  const updateCustomPages = (pages: CustomPage[]) => {
    setSeo(prev => ({ ...prev, sitemap_custom_pages: JSON.stringify(pages) }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSeoSettings(seo);
      toast({
        title: 'Success',
        description: 'SEO settings saved successfully.',
        variant: 'success',
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save SEO settings', error);
      toast({
        title: 'Error',
        description: 'Failed to save SEO settings.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const getCharacterCount = (text: string) => text.length;
  const getWordCount = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-200 border-t-gray-900" />
          <p className="mt-4 text-sm text-gray-600">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 pb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{copy.title}</CardTitle>
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
            >
              {saving ? copy.saving : copy.save}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{copy.description}</p>
        </CardContent>
      </Card>

      {/* Site Title */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5 text-gray-500" />
            {copy.fields.siteTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site_title">{copy.fields.siteTitle}</Label>
            <Input
              id="site_title"
              value={seo.site_title || ''}
              onChange={(e) => handleChange('site_title', e.target.value)}
              placeholder="Giga Hidjrika - Blockchain Developer & Software Engineer"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">{copy.fields.siteTitleDesc}</p>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Characters: {getCharacterCount(seo.site_title || '')}
              </span>
              {getCharacterCount(seo.site_title || '') >= 50 && getCharacterCount(seo.site_title || '') <= 60 ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Good length
                </span>
              ) : getCharacterCount(seo.site_title || '') > 60 ? (
                <span className="flex items-center gap-1 text-amber-600">
                  <XCircleIcon className="h-3.5 w-3.5" />
                  Too long
                </span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShareIcon className="h-5 w-5 text-gray-500" />
            {copy.fields.siteDescription}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site_description">{copy.fields.siteDescription}</Label>
            <Textarea
              id="site_description"
              value={seo.site_description || ''}
              onChange={(e) => handleChange('site_description', e.target.value)}
              placeholder="Personal portfolio showcasing projects in AI, Blockchain, and Web Development."
              rows={3}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">{copy.fields.siteDescriptionDesc}</p>
            <div className="mt-1 flex items-center justify-between text-xs">
              <div className="space-x-4">
                <span className="text-gray-500">
                  Characters: {getCharacterCount(seo.site_description || '')}
                </span>
                <span className="text-gray-500">
                  Words: {getWordCount(seo.site_description || '')}
                </span>
              </div>
              {getCharacterCount(seo.site_description || '') >= 150 && getCharacterCount(seo.site_description || '') <= 160 ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Good length
                </span>
              ) : getCharacterCount(seo.site_description || '') > 160 ? (
                <span className="flex items-center gap-1 text-amber-600">
                  <XCircleIcon className="h-3.5 w-3.5" />
                  Too long
                </span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-gray-500" />
            {copy.fields.keywords}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="keywords">{copy.fields.keywords}</Label>
            <Textarea
              id="keywords"
              value={seo.keywords || ''}
              onChange={(e) => handleChange('keywords', e.target.value)}
              placeholder="blockchain, web3, ai, python, react, next.js"
              rows={3}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">{copy.fields.keywordsDesc}</p>
            <div className="mt-1">
              {seo.keywords && (
                <div className="flex flex-wrap gap-2">
                  {seo.keywords.split(',').map((keyword, index) => {
                    const trimmed = keyword.trim();
                    if (!trimmed) return null;
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                      >
                        <TagIcon className="h-3 w-3" />
                        {trimmed}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhotoIcon className="h-5 w-5 text-gray-500" />
            {copy.fields.ogImage}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="og_image_url">{copy.fields.ogImage}</Label>
            <Input
              id="og_image_url"
              value={seo.og_image_url || ''}
              onChange={(e) => handleChange('og_image_url', e.target.value)}
              placeholder="https://yourdomain.com/og-image.jpg"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">{copy.fields.ogImageDesc}</p>
            {seo.og_image_url && (
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src={seo.og_image_url}
                  alt="Open Graph Preview"
                  width={200}
                  height={105}
                  className="h-auto w-full max-w-[200px] rounded object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Canonical URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5 text-gray-500" />
            {copy.fields.canonicalUrl}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="canonical_url">{copy.fields.canonicalUrl}</Label>
            <Input
              id="canonical_url"
              value={seo.canonical_url || ''}
              onChange={(e) => handleChange('canonical_url', e.target.value)}
              placeholder="https://gigahidjrika.com"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">{copy.fields.canonicalUrlDesc}</p>
          </div>
        </CardContent>
      </Card>

      {/* Google Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{copy.previewTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-1">
              <h3 className="flex items-center gap-1 text-lg font-semibold text-blue-700 hover:underline cursor-pointer">
                {seo.site_title || 'Your Site Title'}
              </h3>
              <p className="flex items-center gap-1 text-sm text-gray-600">
                <span>https://yoursite.com/</span>
                <span className="text-emerald-700">•</span>
                <span className="text-gray-500">
                  {seo.site_description || 'Your site description will appear here...'}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{copy.previewDescription}</CardTitle>
        </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200">
              {seo.og_image_url ? (
                <Image
                  src={seo.og_image_url}
                  alt="Open Graph Preview"
                  width={1200}
                  height={630}
                  className="h-auto w-full object-cover"
                  style={{ maxHeight: '300px' }}
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-500">
                <PhotoIcon className="h-12 w-12" />
              </div>
            )}
            <div className="border-t border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900">
                {seo.site_title || 'Your Site Title'}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {seo.site_description || 'Your site description will appear here...'}
              </p>
              <p className="mt-1 text-xs text-gray-500">yoursite.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sitemap Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
            Sitemap Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-500">
            Configure which pages appear in <span className="font-mono text-gray-700">/sitemap.xml</span> and
            their crawl priority. Changes take effect on the next site build / revalidation (1 hour cache).
          </p>

          {/* Column headers */}
          <div className="hidden grid-cols-[1fr_auto_100px_120px] gap-3 px-3 sm:grid">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Page</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Enabled</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Priority</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Frequency</span>
          </div>

          <div className="space-y-2">
            <SitemapRow
              label="Homepage"
              path="/"
              enabled
              disableToggle
              priority={seo.sitemap_home_priority ?? 1.0}
              changefreq={seo.sitemap_home_changefreq ?? 'daily'}
              onPriorityChange={(v) => handleNumChange('sitemap_home_priority', v)}
              onFreqChange={(v) => handleChange('sitemap_home_changefreq', v)}
            />
            <SitemapRow
              label="Blog index"
              path="/blog"
              enabled={seo.sitemap_blog_enabled ?? true}
              priority={seo.sitemap_blog_priority ?? 0.9}
              changefreq={seo.sitemap_blog_changefreq ?? 'daily'}
              onToggle={() => handleBoolToggle('sitemap_blog_enabled')}
              onPriorityChange={(v) => handleNumChange('sitemap_blog_priority', v)}
              onFreqChange={(v) => handleChange('sitemap_blog_changefreq', v)}
            />
            <SitemapRow
              label="Blog posts"
              path="/blog/:slug (all published)"
              enabled={seo.sitemap_posts_enabled ?? true}
              priority={seo.sitemap_posts_priority ?? 0.8}
              changefreq={seo.sitemap_posts_changefreq ?? 'monthly'}
              onToggle={() => handleBoolToggle('sitemap_posts_enabled')}
              onPriorityChange={(v) => handleNumChange('sitemap_posts_priority', v)}
              onFreqChange={(v) => handleChange('sitemap_posts_changefreq', v)}
            />
          </div>

          {/* Custom pages */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Custom Pages</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateCustomPages([...parsedCustomPages(), { url: '', priority: 0.7, changefreq: 'monthly' as ChangeFreq }])}
              >
                <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
                Add page
              </Button>
            </div>
            {parsedCustomPages().length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                No custom pages. Click &ldquo;Add page&rdquo; to include extra URLs in your sitemap.
              </p>
            ) : (
              <div className="space-y-2">
                {parsedCustomPages().map((page, i) => {
                  const pages = parsedCustomPages();
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <input
                        type="text"
                        value={page.url}
                        placeholder="/about or https://..."
                        onChange={(e) => {
                          pages[i] = { ...pages[i], url: e.target.value };
                          updateCustomPages(pages);
                        }}
                        className="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.1}
                        value={page.priority}
                        onChange={(e) => {
                          pages[i] = { ...pages[i], priority: parseFloat(e.target.value) || 0 };
                          updateCustomPages(pages);
                        }}
                        className="w-20 rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={page.changefreq}
                        onChange={(e) => {
                          pages[i] = { ...pages[i], changefreq: e.target.value as ChangeFreq };
                          updateCustomPages(pages);
                        }}
                        className="rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CHANGE_FREQS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const next = parsedCustomPages().filter((_, idx) => idx !== i);
                          updateCustomPages(next);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default SeoPage;
