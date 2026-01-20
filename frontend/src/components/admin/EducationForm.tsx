"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [formData, setFormData] = useState<EducationBase>({
    degree: '',
    institution: '',
    location: '',
    period: '',
    description: '',
    gpa: '',
    institution_logo_url: '',
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
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{education ? 'Edit Education' : 'Add New Education'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="degree" className="text-gray-700">Degree</Label>
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
                placeholder="Enter degree"
                className="mt-2"
                required
              />
            )}
          </div>
          <div>
            <Label htmlFor="institution" className="text-gray-700">Institution</Label>
            <Input id="institution" value={formData.institution} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-700">Location</Label>
            <Input id="location" value={formData.location} onChange={handleChange} required className="mt-1" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Label className="text-gray-700">Period</Label>
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
            <Label htmlFor="description" className="text-gray-700">Description</Label>
            <Textarea id="description" value={formData.description} onChange={handleChange} required rows={4} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="gpa" className="text-gray-700">GPA (Optional)</Label>
            <Input id="gpa" value={formData.gpa || ''} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="institution_logo_url" className="text-gray-700">Institution Logo URL (Optional)</Label>
            <Input
              id="institution_logo_url"
              value={formData.institution_logo_url || ''}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="display_order" className="text-gray-700">Display Order</Label>
            <Input id="display_order" type="number" value={formData.display_order} onChange={handleChange} required className="mt-1" />
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
      </div>
    </div>
  );
};

export default EducationForm;
