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

const categoryOptions = [
  'Frontend',
  'Backend',
  'DevOps',
  'AI/ML',
  'Design',
  'Data',
  'Tools',
  'Other',
];

const SkillForm: React.FC<SkillFormProps> = ({ skill, onSave, onCancel }) => {
  const proficiencyOptions = [
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Intermediate' },
    { value: 3, label: 'Advanced' },
    { value: 4, label: 'Expert' },
    { value: 5, label: 'Master' },
  ];
  const [formData, setFormData] = useState<SkillBase>({
    name: '',
    category: '',
    proficiency: 0,
    icon_url: '',
    display_order: 0,
  });
  const [categoryPreset, setCategoryPreset] = useState('');
  const [categoryCustom, setCategoryCustom] = useState('');

  useEffect(() => {
    if (skill) {
      const preset = categoryOptions.includes(skill.category) ? skill.category : 'Other';
      setFormData({
        name: skill.name || '',
        category: skill.category || '',
        proficiency: skill.proficiency || 0,
        icon_url: skill.icon_url || '',
        display_order: skill.display_order || 0,
      });
      setCategoryPreset(preset);
      setCategoryCustom(preset === 'Other' ? (skill.category || '') : '');
    }
  }, [skill]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleCategoryPresetChange = (value: string) => {
    setCategoryPreset(value);
    if (value !== 'Other') {
      setFormData((prev) => ({ ...prev, category: value }));
      setCategoryCustom('');
    } else {
      setFormData((prev) => ({ ...prev, category: categoryCustom }));
    }
  };

  const handleCategoryCustomChange = (value: string) => {
    setCategoryCustom(value);
    setFormData((prev) => ({ ...prev, category: value }));
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
            <select
              id="category"
              value={categoryPreset || 'Other'}
              onChange={(e) => handleCategoryPresetChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              required
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {categoryPreset === 'Other' && (
              <Input
                id="category_custom"
                value={categoryCustom}
                onChange={(e) => handleCategoryCustomChange(e.target.value)}
                placeholder="Enter category"
                className="mt-2"
                required
              />
            )}
          </div>
          <div>
            <Label htmlFor="proficiency" className="text-gray-700">Skill Level</Label>
            <select
              id="proficiency"
              value={formData.proficiency || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, proficiency: Number(e.target.value) }))}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              required
            >
              <option value="">Select level</option>
              {proficiencyOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Tip: use “Expert/Master” only for your strongest skills.</p>
          </div>
          <div>
            <Label htmlFor="icon_url" className="text-gray-700">Icon URL (Optional)</Label>
            <Input id="icon_url" value={formData.icon_url || ''} onChange={handleChange} className="mt-1" />
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
