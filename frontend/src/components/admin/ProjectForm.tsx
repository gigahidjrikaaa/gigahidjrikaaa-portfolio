"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { ProjectBase, ProjectResponse } from '@/services/api';
import { openMediaLibrary } from '@/lib/cloudinaryWidget';

type ProjectImageDraft = {
  id?: number;
  url: string;
  kind?: string;
  caption?: string;
  display_order?: number;
};

interface ProjectFormProps {
  project?: ProjectResponse | null;
  images?: ProjectImageDraft[];
  onSave: (project: ProjectBase, images: ProjectImageDraft[]) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, images = [], onSave, onCancel }) => {
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
    thumbnail_url: '',
    ui_image_url: '',
    is_featured: false,
    display_order: 0,
  });
  const [projectImages, setProjectImages] = useState<ProjectImageDraft[]>(images);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const cloudApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";

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
        thumbnail_url: project.thumbnail_url || '',
        ui_image_url: project.ui_image_url || '',
        is_featured: project.is_featured || false,
        display_order: project.display_order || 0,
      });
    }
  }, [project]);

  useEffect(() => {
    setProjectImages(images);
  }, [images]);

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
    const normalizedImages = projectImages.map((image, index) => ({
      ...image,
      display_order: image.display_order ?? index,
    }));
    onSave(formData, normalizedImages);
  };

  const updateImageField = (index: number, key: keyof ProjectImageDraft, value: string | number) => {
    setProjectImages((prev) =>
      prev.map((image, idx) => (idx === index ? { ...image, [key]: value } : image))
    );
  };

  const addImage = () => {
    setProjectImages((prev) => ([
      ...prev,
      { url: '', kind: 'gallery', caption: '', display_order: prev.length },
    ]));
  };

  const removeImage = (index: number) => {
    setProjectImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setProjectImages((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setProjectImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const openMediaPicker = async (onSelect: (url: string) => void) => {
    if (!cloudName || !cloudApiKey) {
      alert("Cloudinary Media Library is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY.");
      return;
    }
    await openMediaLibrary(
      {
        cloud_name: cloudName,
        api_key: cloudApiKey,
        multiple: false,
      },
      (assets) => {
        const asset = assets[0];
        if (asset?.secure_url || asset?.url) {
          onSelect(asset.secure_url || asset.url || "");
        }
      }
    );
  };

  const openGalleryPicker = async () => {
    if (!cloudName || !cloudApiKey) {
      alert("Cloudinary Media Library is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY.");
      return;
    }
    await openMediaLibrary(
      {
        cloud_name: cloudName,
        api_key: cloudApiKey,
        multiple: true,
      },
      (assets) => {
        const mapped = assets.map((asset) => ({
          url: asset.secure_url || asset.url || "",
          caption: "",
          kind: "gallery",
          display_order: projectImages.length,
        }));
        setProjectImages((prev) => [...prev, ...mapped]);
      }
    );
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
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => openMediaPicker((url) => setFormData((prev) => ({ ...prev, image_url: url })))}>
              Pick from Cloudinary
            </Button>
            {formData.image_url ? (
              <Image
                src={formData.image_url}
                alt="Project"
                width={640}
                height={240}
                unoptimized
                className="mt-2 h-24 w-full rounded-md object-cover"
              />
            ) : null}
          </div>
          <div>
            <Label htmlFor="thumbnail_url" className="text-gray-700">Thumbnail URL (Optional)</Label>
            <Input id="thumbnail_url" value={formData.thumbnail_url || ''} onChange={handleChange} className="mt-1" />
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => openMediaPicker((url) => setFormData((prev) => ({ ...prev, thumbnail_url: url })))}>
              Pick from Cloudinary
            </Button>
            {formData.thumbnail_url ? (
              <Image
                src={formData.thumbnail_url}
                alt="Thumbnail"
                width={640}
                height={240}
                unoptimized
                className="mt-2 h-24 w-full rounded-md object-cover"
              />
            ) : null}
          </div>
          <div>
            <Label htmlFor="ui_image_url" className="text-gray-700">UI Image URL (Optional)</Label>
            <Input id="ui_image_url" value={formData.ui_image_url || ''} onChange={handleChange} className="mt-1" />
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => openMediaPicker((url) => setFormData((prev) => ({ ...prev, ui_image_url: url })))}>
              Pick from Cloudinary
            </Button>
            {formData.ui_image_url ? (
              <Image
                src={formData.ui_image_url}
                alt="UI preview"
                width={640}
                height={240}
                unoptimized
                className="mt-2 h-24 w-full rounded-md object-cover"
              />
            ) : null}
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700">Project Gallery Images</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addImage}>Add Image</Button>
                <Button type="button" variant="outline" onClick={openGalleryPicker}>Pick from Cloudinary</Button>
              </div>
            </div>
            {projectImages.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">No gallery images yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {projectImages.map((image, index) => (
                  <div
                    key={`${image.id ?? index}`}
                    className="grid grid-cols-1 md:grid-cols-5 gap-3 border rounded-lg p-3"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                  >
                    <div className="md:col-span-2">
                      <Label htmlFor={`image-url-${index}`} className="text-gray-700">Image URL</Label>
                      <Input
                        id={`image-url-${index}`}
                        value={image.url}
                        onChange={(e) => updateImageField(index, 'url', e.target.value)}
                        className="mt-1"
                        required
                      />
                      {image.url ? (
                        <Image
                          src={image.url}
                          alt={image.caption ?? 'Project image'}
                          width={480}
                          height={160}
                          unoptimized
                          className="mt-2 h-20 w-full rounded-md object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <Label htmlFor={`image-kind-${index}`} className="text-gray-700">Kind</Label>
                      <select
                        id={`image-kind-${index}`}
                        value={image.kind || 'gallery'}
                        onChange={(e) => updateImageField(index, 'kind', e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                      >
                        <option value="gallery">Gallery</option>
                        <option value="ui">UI</option>
                        <option value="thumbnail">Thumbnail</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor={`image-caption-${index}`} className="text-gray-700">Caption</Label>
                      <Input
                        id={`image-caption-${index}`}
                        value={image.caption || ''}
                        onChange={(e) => updateImageField(index, 'caption', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`image-order-${index}`} className="text-gray-700">Order</Label>
                      <Input
                        id={`image-order-${index}`}
                        type="number"
                        value={image.display_order ?? index}
                        onChange={(e) => updateImageField(index, 'display_order', Number(e.target.value))}
                        className="mt-1"
                      />
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => moveImage(index, -1)}>Up</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => moveImage(index, 1)}>Down</Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(index)}>Remove</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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