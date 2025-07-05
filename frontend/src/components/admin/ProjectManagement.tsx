"use client";
import { useState, useEffect } from 'react';
import ProjectForm from './ProjectForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ProjectBase, ProjectResponse } from '@/services/api';

const ProjectManagement = () => {
  const { projects, fetchProjects, createProject, updateProject, deleteProject } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSaveProject = async (projectData: ProjectBase) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, projectData);
      } else {
        await createProject(projectData);
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
                <h3 className="font-semibold text-gray-800">{project.title}</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedProject(project);
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
          onSave={handleSaveProject}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
        />
      )}
    </Card>
  );
};

export default ProjectManagement;