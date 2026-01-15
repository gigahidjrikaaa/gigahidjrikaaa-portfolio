"use client";
import { useState, useEffect } from 'react';
import ExperienceForm from './ExperienceForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ExperienceBase, ExperienceResponse } from '@/services/api';

const ExperienceManagement = () => {
  const { experience, fetchExperience, createExperience, updateExperience, deleteExperience } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceResponse | null>(null);

  useEffect(() => {
    fetchExperience();
  }, [fetchExperience]);

  const handleSaveExperience = async (experienceData: ExperienceBase) => {
    try {
      if (selectedExperience) {
        await updateExperience(selectedExperience.id, experienceData);
      } else {
        await createExperience(experienceData);
      }
      setIsModalOpen(false);
      setSelectedExperience(null);
    } catch (error) {
      console.error('Failed to save experience:', error);
      alert('Failed to save experience. Please try again.');
    }
  };

  const handleDeleteExperience = async (id: number) => {
    if (confirm('Are you sure you want to delete this experience entry?')) {
      try {
        await deleteExperience(id);
      } catch (error) {
        console.error('Failed to delete experience:', error);
        alert('Failed to delete experience. Please try again.');
      }
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Experience</CardTitle>
        <Button onClick={() => {
          setSelectedExperience(null);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent>
        {experience.length === 0 ? (
          <p className="text-center text-gray-500">No experience entries found. Add one to get started!</p>
        ) : (
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  {exp.company_logo_url ? (
                    <img src={exp.company_logo_url} alt={exp.company} className="h-10 w-10 rounded-full object-contain bg-white" />
                  ) : null}
                  <h3 className="font-semibold text-gray-800">{exp.title} at {exp.company}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedExperience(exp);
                    setIsModalOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteExperience(exp.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {isModalOpen && (
        <ExperienceForm
          experience={selectedExperience}
          onSave={handleSaveExperience}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedExperience(null);
          }}
        />
      )}
    </Card>
  );
};

export default ExperienceManagement;
