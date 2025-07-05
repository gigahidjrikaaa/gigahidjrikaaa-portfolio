"use client";
import { useState, useEffect } from 'react';
import EducationForm from './EducationForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { EducationBase, EducationResponse } from '@/services/api';

const EducationManagement = () => {
  const { education, fetchEducation, createEducation, updateEducation, deleteEducation } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<EducationResponse | null>(null);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  const handleSaveEducation = async (educationData: EducationBase) => {
    try {
      if (selectedEducation) {
        await updateEducation(selectedEducation.id, educationData);
      } else {
        await createEducation(educationData);
      }
      setIsModalOpen(false);
      setSelectedEducation(null);
    } catch (error) {
      console.error('Failed to save education:', error);
      alert('Failed to save education. Please try again.');
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (confirm('Are you sure you want to delete this education entry?')) {
      try {
        await deleteEducation(id);
      } catch (error) {
        console.error('Failed to delete education:', error);
        alert('Failed to delete education. Please try again.');
      }
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Education</CardTitle>
        <Button onClick={() => {
          setSelectedEducation(null);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </Button>
      </CardHeader>
      <CardContent>
        {education.length === 0 ? (
          <p className="text-center text-gray-500">No education entries found. Add one to get started!</p>
        ) : (
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-800">{edu.degree} from {edu.institution}</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedEducation(edu);
                    setIsModalOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteEducation(edu.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {isModalOpen && (
        <EducationForm
          education={selectedEducation}
          onSave={handleSaveEducation}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedEducation(null);
          }}
        />
      )}
    </Card>
  );
};

export default EducationManagement;
