"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SkillBase, SkillResponse } from '@/services/api';

interface SkillFormProps {
  skill?: SkillResponse | null;
  onSave: (skill: SkillBase) => void;
  onCancel: () => void;
}

const SkillForm: React.FC<SkillFormProps> = ({ skill, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SkillBase>({
    name: '',
    category: '',
    proficiency: 0,
    display_order: 0,
  });

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name || '',
        category: skill.category || '',
        proficiency: skill.proficiency || 0,
        display_order: skill.display_order || 0,
      });
    }
  }, [skill]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{skill ? 'Edit Skill' : 'Add New Skill'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">Name</Label>
            <Input id="name" value={formData.name} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-700">Category</Label>
            <Input id="category" value={formData.category} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="proficiency" className="text-gray-700">Proficiency (1-5)</Label>
            <Input id="proficiency" type="number" value={formData.proficiency} onChange={handleChange} required min={1} max={5} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="display_order" className="text-gray-700">Display Order</Label>
            <Input id="display_order" type="number" value={formData.display_order} onChange={handleChange} required className="mt-1" />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Skill</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillForm;
