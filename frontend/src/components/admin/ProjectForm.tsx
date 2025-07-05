"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ProjectBase, ProjectResponse } from '@/services/api';

interface ProjectFormProps {
  project?: ProjectResponse | null;
  onSave: (project: ProjectBase) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProjectBase>({
    title: '',
    tagline: '',
    description: '',
    github_url: '',
    live_url: '',
    case_study_url: '',
    role: '',
    team_size: 0,
    challenges: '',
    solutions: '',
    impact: '',
    image_url: '',
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        tagline: project.tagline || '',
        description: project.description || '',
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        case_study_url: project.case_study_url || '',
        role: project.role || '',
        team_size: project.team_size || 0,
        challenges: project.challenges || '',
        solutions: project.solutions || '',
        impact: project.impact || '',
        image_url: project.image_url || '',
        is_featured: project.is_featured || false,
        display_order: project.display_order || 0,
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev: ProjectBase) => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev: ProjectBase) => ({
      ...prev,
      is_featured: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{project ? 'Edit Project' : 'Add New Project'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-700">Title</Label>
            <Input id="title" value={formData.title} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="tagline" className="text-gray-700">Tagline</Label>
            <Input id="tagline" value={formData.tagline} onChange={handleChange} required className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description" className="text-gray-700">Description</Label>
            <Textarea id="description" value={formData.description} onChange={handleChange} required rows={4} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="github_url" className="text-gray-700">GitHub URL</Label>
            <Input id="github_url" value={formData.github_url} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="live_url" className="text-gray-700">Live URL (Optional)</Label>
            <Input id="live_url" value={formData.live_url || ''} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="case_study_url" className="text-gray-700">Case Study URL (Optional)</Label>
            <Input id="case_study_url" value={formData.case_study_url || ''} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="role" className="text-gray-700">Role</Label>
            <Input id="role" value={formData.role} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="team_size" className="text-gray-700">Team Size</Label>
            <Input id="team_size" type="number" value={formData.team_size} onChange={handleChange} required className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="challenges" className="text-gray-700">Challenges</Label>
            <Textarea id="challenges" value={formData.challenges} onChange={handleChange} required rows={3} className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="solutions" className="text-gray-700">Solutions</Label>
            <Textarea id="solutions" value={formData.solutions} onChange={handleChange} required rows={3} className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="impact" className="text-gray-700">Impact</Label>
            <Textarea id="impact" value={formData.impact} onChange={handleChange} required rows={3} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="image_url" className="text-gray-700">Image URL (Optional)</Label>
            <Input id="image_url" value={formData.image_url || ''} onChange={handleChange} className="mt-1" />
            {/* Future: Add actual image upload functionality here */}
          </div>
          <div>
            <Label htmlFor="display_order" className="text-gray-700">Display Order</Label>
            <Input id="display_order" type="number" value={formData.display_order} onChange={handleChange} required className="mt-1" />
          </div>
          <div className="flex items-center space-x-2 md:col-span-2">
            <Checkbox id="is_featured" checked={formData.is_featured} onCheckedChange={handleCheckboxChange} />
            <Label htmlFor="is_featured" className="text-gray-700">Featured Project</Label>
          </div>

          <div className="flex justify-end gap-4 mt-6 md:col-span-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;