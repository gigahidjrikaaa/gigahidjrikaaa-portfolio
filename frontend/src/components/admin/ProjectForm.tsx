"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const ProjectForm = ({ project, onSave, onCancel }) => {
  // This would be a form with state for all the project fields
  // For brevity, we'll just show a few fields

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{project ? 'Edit Project' : 'Add Project'}</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" defaultValue={project?.title || ''} />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" defaultValue={project?.tagline || ''} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" defaultValue={project?.description || ''} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_featured" defaultChecked={project?.is_featured || false} />
            <Label htmlFor="is_featured">Featured</Label>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
