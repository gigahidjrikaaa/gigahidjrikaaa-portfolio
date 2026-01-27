"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminModal from '@/components/admin/AdminModal';
import { useToast } from '@/components/ui/toast';
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
  const { toast } = useToast();
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
    if (!formData.name || !formData.category || !formData.proficiency) {
      toast({
        title: 'Missing required fields',
        description: 'Please complete name, category, and skill level.',
        variant: 'error',
      });
      return;
    }
    onSave(formData);
  };

  return (
    <AdminModal
      title={skill ? 'Edit Skill' : 'Add New Skill'}
      description="Use clear skill names and consistent categories."
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">Name *</Label>
            <Input id="name" value={formData.name} onChange={handleChange} required className="mt-1" placeholder="e.g., React" />
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-700">Category *</Label>
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
                placeholder="e.g., Observability"
                className="mt-2"
                required
              />
            )}
          </div>
          <div>
            <Label htmlFor="proficiency" className="text-gray-700">Skill Level *</Label>
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
            <Input id="icon_url" value={formData.icon_url || ''} onChange={handleChange} className="mt-1" placeholder="https://..." />
            {formData.icon_url ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Image
                  src={formData.icon_url}
                  alt="Skill icon preview"
                  width={36}
                  height={36}
                  unoptimized
                  className="h-10 w-10 rounded-md object-contain bg-white"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Icon preview</p>
                  <p className="text-xs text-gray-500">Square icons look best.</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Skill</Button>
          </div>
      </form>
    </AdminModal>
  );
};

export default SkillForm;
