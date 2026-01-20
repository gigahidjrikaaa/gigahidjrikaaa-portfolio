"use client";
import { useState, useEffect } from 'react';
import ProjectForm from './ProjectForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [projectImages, setProjectImages] = useState<ProjectImageDraft[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
      } else {
        const created = await createProject(projectData);
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
      }
      setIsModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
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
        {projects.length === 0 ? (
          <p className="text-center text-gray-500">No projects found. Add one to get started!</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  {project.thumbnail_url || project.image_url ? (
                    <img
                      src={project.thumbnail_url || project.image_url || '/placeholder.png'}
                      alt={project.title}
                      className="h-10 w-14 rounded-md object-cover"
                    />
                  ) : null}
                  <h3 className="font-semibold text-gray-800">{project.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedProject(project);
                    adminApi
                      .getProjectImages(project.id)
                      .then((images) => setProjectImages(images.map(toDraftImage)))
                      .catch(() => setProjectImages([]));
                    setIsModalOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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