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
} from '@heroicons/react/24/outline';

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
    </section>
  );
};

export default SeoPage;
