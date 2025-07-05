"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ExperienceBase, ExperienceResponse } from '@/services/api';

interface ExperienceFormProps {
  experience?: ExperienceResponse | null;
  onSave: (experience: ExperienceBase) => void;
  onCancel: () => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ experience, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ExperienceBase>({
    title: '',
    company: '',
    location: '',
    period: '',
    description: '',
    is_current: false,
    display_order: 0,
  });

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title || '',
        company: experience.company || '',
        location: experience.location || '',
        period: experience.period || '',
        description: experience.description || '',
        is_current: experience.is_current || false,
        display_order: experience.display_order || 0,
      });
    }
  }, [experience]);

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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{experience ? 'Edit Experience' : 'Add New Experience'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-700">Title</Label>
            <Input id="title" value={formData.title} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="company" className="text-gray-700">Company</Label>
            <Input id="company" value={formData.company} onChange={handleChange} required className="mt-1" />
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
            <Label htmlFor="display_order" className="text-gray-700">Display Order</Label>
            <Input id="display_order" type="number" value={formData.display_order} onChange={handleChange} required className="mt-1" />
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
      </div>
    </div>
  );
};

export default ExperienceForm;
