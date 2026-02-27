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
import { EducationBase, EducationResponse } from '@/services/api';

interface EducationFormProps {
  education?: EducationResponse | null;
  onSave: (education: EducationBase) => void;
  onCancel: () => void;
}

const degreeOptions = [
  'High School Diploma',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate (PhD)',
  'Bootcamp',
  'Other',
];

const EducationForm: React.FC<EducationFormProps> = ({ education, onSave, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EducationBase>({
    degree: '',
    institution: '',
    location: '',
    period: '',
    description: '',
    gpa: '',
    institution_logo_url: '',
    institution_background_url: '',
    is_current: false,
    display_order: 0,
  });
  const [degreePreset, setDegreePreset] = useState('');
  const [degreeCustom, setDegreeCustom] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');

  useEffect(() => {
    if (education) {
      const preset = degreeOptions.includes(education.degree) ? education.degree : 'Other';
      setFormData({
        degree: education.degree || '',
        institution: education.institution || '',
        location: education.location || '',
        period: education.period || '',
        description: education.description || '',
        gpa: education.gpa || '',
        institution_logo_url: education.institution_logo_url || '',
        institution_background_url: education.institution_background_url || '',
        is_current: education.is_current || false,
        display_order: education.display_order || 0,
      });
      setDegreePreset(preset);
      setDegreeCustom(preset === 'Other' ? (education.degree || '') : '');
    }
  }, [education]);

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

  const handleDegreePresetChange = (value: string) => {
    setDegreePreset(value);
    if (value !== 'Other') {
      setFormData((prev) => ({ ...prev, degree: value }));
      setDegreeCustom('');
    } else {
      setFormData((prev) => ({ ...prev, degree: degreeCustom }));
    }
  };

  const handleDegreeCustomChange = (value: string) => {
    setDegreeCustom(value);
    setFormData((prev) => ({ ...prev, degree: value }));
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
    if (!formData.degree || !formData.institution || !formData.location || !formData.period || !formData.description) {
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
      title={education ? 'Edit Education' : 'Add New Education'}
      description="Use month pickers to build the period label automatically."
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="degree" className="text-gray-700">Degree *</Label>
            <select
              id="degree"
              value={degreePreset || 'Other'}
              onChange={(e) => handleDegreePresetChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              required
            >
              {degreeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {degreePreset === 'Other' && (
              <Input
                id="degree_custom"
                value={degreeCustom}
                onChange={(e) => handleDegreeCustomChange(e.target.value)}
                placeholder="e.g., B.Sc. Computer Science"
                className="mt-2"
                required
              />
            )}
          </div>
          <div>
            <Label htmlFor="institution" className="text-gray-700">Institution *</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="e.g., University of Indonesia"
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
              placeholder="e.g., Bandung, Indonesia"
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
              placeholder="e.g., Sep 2020 — Jun 2024"
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
              placeholder="Highlights, focus area, or notable achievements"
            />
          </div>
          <div>
            <Label htmlFor="gpa" className="text-gray-700">GPA (Optional)</Label>
            <Input id="gpa" value={formData.gpa || ''} onChange={handleChange} className="mt-1" placeholder="e.g., 3.8/4.0" />
          </div>
          <div>
            <Label htmlFor="institution_logo_url" className="text-gray-700">Institution Logo URL (Optional)</Label>
            <Input
              id="institution_logo_url"
              value={formData.institution_logo_url || ''}
              onChange={handleChange}
              className="mt-1"
              placeholder="https://..."
            />
            {formData.institution_logo_url ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Image
                  src={formData.institution_logo_url}
                  alt="Institution logo preview"
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
          <div>
            <Label htmlFor="institution_background_url" className="text-gray-700">Institution Background Image URL (Optional)</Label>
            <Input
              id="institution_background_url"
              value={formData.institution_background_url || ''}
              onChange={handleChange}
              className="mt-1"
              placeholder="https://... (landscape photo of the campus)"
            />
            <p className="mt-1 text-xs text-gray-400">
              Used as the card background on the Education section. Use a wide/landscape campus or banner photo for best results.
            </p>
            {formData.institution_background_url ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src={formData.institution_background_url}
                  alt="Background preview"
                  width={400}
                  height={160}
                  unoptimized
                  className="h-32 w-full object-cover"
                />
              </div>
            ) : null}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_current" checked={formData.is_current} onCheckedChange={handleCheckboxChange} />
            <Label htmlFor="is_current" className="text-gray-700">Currently Studying Here</Label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Education</Button>
          </div>
      </form>
    </AdminModal>
  );
};

export default EducationForm;
