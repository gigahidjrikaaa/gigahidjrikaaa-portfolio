"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProjectForm from './ProjectForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import Tooltip from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast';
import { adminApi, ProjectBase, ProjectImageResponse, ProjectResponse } from '@/services/api';

type ProjectImageDraft = {
  id?: number;
  url: string;
  kind?: string;
  caption?: string;
  display_order?: number;
};

const toDraftImage = (img: ProjectImageResponse): ProjectImageDraft => ({
  id: img.id,
  url: img.url,
  kind: img.kind ?? undefined,
  caption: img.caption ?? undefined,
  display_order: img.display_order ?? undefined,
});

const ProjectManagement = () => {
  const { projects, fetchProjects, createProject, updateProject, deleteProject } = useAdminStore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [projectImages, setProjectImages] = useState<ProjectImageDraft[]>([]);
  const [orderedProjects, setOrderedProjects] = useState<ProjectResponse[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setOrderedProjects(projects);
  }, [projects]);

  const handleSaveProject = async (projectData: ProjectBase, images: ProjectImageDraft[]) => {
    try {
      if (selectedProject) {
        const updated = await updateProject(selectedProject.id, projectData);

        const existingIds = new Set(
          projectImages
            .filter((img): img is ProjectImageDraft & { id: number } => typeof img.id === 'number')
            .map((img) => img.id)
        );
        const nextIds = new Set(
          images
            .filter((img): img is ProjectImageDraft & { id: number } => typeof img.id === 'number')
            .map((img) => img.id)
        );

        const toDelete = [...existingIds].filter((id) => !nextIds.has(id));
        const toUpdate = images.filter((img): img is ProjectImageDraft & { id: number } => typeof img.id === 'number');
        const toCreate = images.filter((img) => !img.id);

        await Promise.all(
          toDelete.map((id) => adminApi.deleteProjectImage(selectedProject.id, id))
        );

        await Promise.all(
          toUpdate.map((img) =>
            adminApi.updateProjectImage(selectedProject.id, img.id!, {
              url: img.url,
              kind: img.kind,
              caption: img.caption,
              display_order: img.display_order,
            })
          )
        );

        await Promise.all(
          toCreate.map((img) =>
            adminApi.createProjectImage(selectedProject.id, {
              url: img.url,
              kind: img.kind,
              caption: img.caption,
              display_order: img.display_order,
            })
          )
        );

        setProjectImages([]);
        setSelectedProject(updated);
        toast({
          title: 'Project updated',
          description: 'Your project details were saved successfully.',
          variant: 'success',
        });
      } else {
        const created = await createProject({
          ...projectData,
          display_order: orderedProjects.length,
        });
        await Promise.all(
          images.map((img) =>
            adminApi.createProjectImage(created.id, {
              url: img.url,
              kind: img.kind,
              caption: img.caption,
              display_order: img.display_order,
            })
          )
        );
        toast({
          title: 'Project created',
          description: 'New project added to your portfolio.',
          variant: 'success',
        });
      }
      setIsModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      toast({
        title: 'Unable to save project',
        description: 'Please review the fields and try again.',
        variant: 'error',
      });
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        toast({
          title: 'Project deleted',
          description: 'The project has been removed.',
          variant: 'success',
        });
      } catch (error) {
        console.error('Failed to delete project:', error);
        toast({
          title: 'Unable to delete project',
          description: 'Please try again in a moment.',
          variant: 'error',
        });
      }
    }
  };

  const persistOrder = async (nextItems: ProjectResponse[]) => {
    setOrderedProjects(nextItems);
    try {
      await Promise.all(
        nextItems.map((item, index) => updateProject(item.id, { display_order: index }))
      );
      toast({
        title: 'Project order updated',
        description: 'Display order has been saved.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to reorder projects', error);
      toast({
        title: 'Unable to reorder projects',
        description: 'Please try again.',
        variant: 'error',
      });
    }
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const currentIndex = orderedProjects.findIndex((item) => item.id === draggedId);
    const targetIndex = orderedProjects.findIndex((item) => item.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;
    const next = [...orderedProjects];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next).catch(() => null);
    setDraggedId(null);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <Button onClick={() => {
          setSelectedProject(null);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </CardHeader>
      <CardContent>
        {orderedProjects.length === 0 ? (
          <p className="text-center text-gray-500">No projects found. Add one to get started!</p>
        ) : (
          <div className="space-y-4">
            {orderedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-gray-50"
                draggable
                onDragStart={() => setDraggedId(project.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(project.id)}
              >
                <div className="flex items-center gap-3">
                  <Tooltip content="Drag to reorder">
                    <span className="cursor-grab text-slate-400">
                      <GripVertical className="h-4 w-4" />
                    </span>
                  </Tooltip>
                  {project.thumbnail_url || project.image_url ? (
                    <Image
                      src={project.thumbnail_url || project.image_url || '/placeholder.png'}
                      alt={project.title}
                      width={56}
                      height={40}
                      unoptimized
                      className="h-10 w-14 rounded-md object-cover"
                    />
                  ) : null}
                  <h3 className="font-semibold text-gray-800">{project.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Edit">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        adminApi
                          .getProjectImages(project.id)
                          .then((images) => setProjectImages(images.map(toDraftImage)))
                          .catch(() => setProjectImages([]));
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {isModalOpen && (
        <ProjectForm
          project={selectedProject}
          images={projectImages}
          onSave={handleSaveProject}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
            setProjectImages([]);
          }}
        />
      )}
    </Card>
  );
};

export default ProjectManagement;