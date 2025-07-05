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

const EducationForm: React.FC<EducationFormProps> = ({ education, onSave, onCancel }) => {
  const [formData, setFormData] = useState<EducationBase>({
    degree: '',
    institution: '',
    location: '',
    period: '',
    description: '',
    gpa: '',
    is_current: false,
    display_order: 0,
  });

  useEffect(() => {
    if (education) {
      setFormData({
        degree: education.degree || '',
        institution: education.institution || '',
        location: education.location || '',
        period: education.period || '',
        description: education.description || '',
        gpa: education.gpa || '',
        is_current: education.is_current || false,
        display_order: education.display_order || 0,
      });
    }
  }, [education]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_current: checked,
    }));
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
            <Input id="degree" value={formData.degree} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="institution" className="text-gray-700">Institution</Label>
            <Input id="institution" value={formData.institution} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-700">Location</Label>
            <Input id="location" value={formData.location} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="period" className="text-gray-700">Period</Label>
            <Input id="period" value={formData.period} onChange={handleChange} required className="mt-1" />
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
