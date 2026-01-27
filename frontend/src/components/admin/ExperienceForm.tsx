"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import AdminModal from '@/components/admin/AdminModal';
import { useToast } from '@/components/ui/toast';
import { ExperienceBase, ExperienceResponse } from '@/services/api';

interface ExperienceFormProps {
  experience?: ExperienceResponse | null;
  onSave: (experience: ExperienceBase) => void;
  onCancel: () => void;
}

const titleOptions = [
  'Software Engineer',
  'Full-Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'UI/UX Designer',
  'Product Designer',
  'AI Engineer',
  'Other',
];

const ExperienceForm: React.FC<ExperienceFormProps> = ({ experience, onSave, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ExperienceBase>({
    title: '',
    company: '',
    location: '',
    period: '',
    description: '',
    company_logo_url: '',
    is_current: false,
    display_order: 0,
  });
  const [titlePreset, setTitlePreset] = useState('');
  const [titleCustom, setTitleCustom] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');

  useEffect(() => {
    if (experience) {
      const preset = titleOptions.includes(experience.title) ? experience.title : 'Other';
      setFormData({
        title: experience.title || '',
        company: experience.company || '',
        location: experience.location || '',
        period: experience.period || '',
        description: experience.description || '',
        company_logo_url: experience.company_logo_url || '',
        is_current: experience.is_current || false,
        display_order: experience.display_order || 0,
      });
      setTitlePreset(preset);
      setTitleCustom(preset === 'Other' ? (experience.title || '') : '');
    }
  }, [experience]);

  const formatMonthLabel = (value: string) => {
    if (!value) return '';
    const [year, month] = value.split('-').map(Number);
    if (!year || !month) return '';
    return new Date(year, month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };

  const buildPeriod = (start: string, end: string, isCurrent: boolean) => {
    const startLabel = formatMonthLabel(start);
    if (!startLabel) return '';
    if (isCurrent) return `${startLabel} — Present`;
    const endLabel = formatMonthLabel(end);
    return endLabel ? `${startLabel} — ${endLabel}` : startLabel;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    const nextPeriod = buildPeriod(startMonth, endMonth, checked);
    setFormData((prev) => ({
      ...prev,
      is_current: checked,
      period: nextPeriod || prev.period,
    }));
  };

  const handleTitlePresetChange = (value: string) => {
    setTitlePreset(value);
    if (value !== 'Other') {
      setFormData((prev) => ({ ...prev, title: value }));
      setTitleCustom('');
    } else {
      setFormData((prev) => ({ ...prev, title: titleCustom }));
    }
  };

  const handleTitleCustomChange = (value: string) => {
    setTitleCustom(value);
    setFormData((prev) => ({ ...prev, title: value }));
  };

  const handleStartMonthChange = (value: string) => {
    setStartMonth(value);
    const periodValue = buildPeriod(value, endMonth, formData.is_current);
    setFormData((prev) => ({ ...prev, period: periodValue || prev.period }));
  };

  const handleEndMonthChange = (value: string) => {
    setEndMonth(value);
    const periodValue = buildPeriod(startMonth, value, formData.is_current);
    setFormData((prev) => ({ ...prev, period: periodValue || prev.period }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.location || !formData.period || !formData.description) {
      toast({
        title: 'Missing required fields',
        description: 'Please complete all required fields before saving.',
        variant: 'error',
      });
      return;
    }
    onSave(formData);
  };

  return (
    <AdminModal
      title={experience ? 'Edit Experience' : 'Add New Experience'}
      description="Keep experience entries concise and ordered by relevance."
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-700">Title *</Label>
            <select
              id="title"
              value={titlePreset || 'Other'}
              onChange={(e) => handleTitlePresetChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              required
            >
              {titleOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {titlePreset === 'Other' && (
              <Input
                id="title_custom"
                value={titleCustom}
                onChange={(e) => handleTitleCustomChange(e.target.value)}
                placeholder="e.g., Senior Backend Engineer"
                className="mt-2"
                required
              />
            )}
          </div>
          <div>
            <Label htmlFor="company" className="text-gray-700">Company *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="e.g., Stripe"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-700">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="e.g., Remote · Jakarta"
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Label className="text-gray-700">Period *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start_month" className="text-xs text-gray-500">Start Month</Label>
                <Input
                  id="start_month"
                  type="month"
                  value={startMonth}
                  onChange={(e) => handleStartMonthChange(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end_month" className="text-xs text-gray-500">End Month</Label>
                <Input
                  id="end_month"
                  type="month"
                  value={endMonth}
                  onChange={(e) => handleEndMonthChange(e.target.value)}
                  disabled={formData.is_current}
                  className="mt-1"
                />
              </div>
            </div>
            <Input
              id="period"
              value={formData.period}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="e.g., Jan 2022 — Present"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-700">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1"
              placeholder="Summarize scope, impact, and achievements"
            />
          </div>
          <div>
            <Label htmlFor="company_logo_url" className="text-gray-700">Company Logo URL (Optional)</Label>
            <Input
              id="company_logo_url"
              value={formData.company_logo_url || ''}
              onChange={handleChange}
              className="mt-1"
              placeholder="https://..."
            />
            {formData.company_logo_url ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Image
                  src={formData.company_logo_url}
                  alt="Company logo preview"
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 rounded-md object-contain bg-white"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Logo preview</p>
                  <p className="text-xs text-gray-500">Check aspect ratio and clarity.</p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_current" checked={formData.is_current} onCheckedChange={handleCheckboxChange} />
            <Label htmlFor="is_current" className="text-gray-700">Current Role</Label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Experience</Button>
          </div>
      </form>
    </AdminModal>
  );
};

export default ExperienceForm;
