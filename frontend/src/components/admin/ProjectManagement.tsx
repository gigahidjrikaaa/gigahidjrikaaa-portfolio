"use client";
import { useState, useEffect } from 'react';
import ProjectForm from './ProjectForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ProjectManagement = () => {
  const { projects, fetchProjects } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <Card>
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
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
              <h3 className="font-semibold">{project.title}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setSelectedProject(project);
                  setIsModalOpen(true);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      {isModalOpen && (
        <ProjectForm
          project={selectedProject}
          onSave={() => setIsModalOpen(false) /* Implement save logic */}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </Card>
  );
};

export default ProjectManagement;
