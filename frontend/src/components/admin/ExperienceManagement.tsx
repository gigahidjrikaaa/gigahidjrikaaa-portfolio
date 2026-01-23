"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ExperienceForm from './ExperienceForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import Tooltip from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast';
import { ExperienceBase, ExperienceResponse } from '@/services/api';

const ExperienceManagement = () => {
  const { experience, fetchExperience, createExperience, updateExperience, deleteExperience } = useAdminStore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceResponse | null>(null);
  const [orderedExperience, setOrderedExperience] = useState<ExperienceResponse[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  useEffect(() => {
    fetchExperience();
  }, [fetchExperience]);

  useEffect(() => {
    setOrderedExperience(experience);
  }, [experience]);

  const handleSaveExperience = async (experienceData: ExperienceBase) => {
    try {
      if (selectedExperience) {
        await updateExperience(selectedExperience.id, experienceData);
        toast({
          title: 'Experience updated',
          description: 'Experience entry saved successfully.',
          variant: 'success',
        });
      } else {
        await createExperience({
          ...experienceData,
          display_order: orderedExperience.length,
        });
        toast({
          title: 'Experience added',
          description: 'New experience entry created.',
          variant: 'success',
        });
      }
      setIsModalOpen(false);
      setSelectedExperience(null);
    } catch (error) {
      console.error('Failed to save experience:', error);
      toast({
        title: 'Unable to save experience',
        description: 'Please review the fields and try again.',
        variant: 'error',
      });
    }
  };

  const handleDeleteExperience = async (id: number) => {
    if (confirm('Are you sure you want to delete this experience entry?')) {
      try {
        await deleteExperience(id);
        toast({
          title: 'Experience deleted',
          description: 'The entry has been removed.',
          variant: 'success',
        });
      } catch (error) {
        console.error('Failed to delete experience:', error);
        toast({
          title: 'Unable to delete experience',
          description: 'Please try again in a moment.',
          variant: 'error',
        });
      }
    }
  };

  const persistOrder = async (nextItems: ExperienceResponse[]) => {
    setOrderedExperience(nextItems);
    try {
      await Promise.all(
        nextItems.map((item, index) => updateExperience(item.id, { display_order: index }))
      );
      toast({
        title: 'Experience order updated',
        description: 'Display order has been saved.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to reorder experience', error);
      toast({
        title: 'Unable to reorder experience',
        description: 'Please try again.',
        variant: 'error',
      });
    }
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const currentIndex = orderedExperience.findIndex((item) => item.id === draggedId);
    const targetIndex = orderedExperience.findIndex((item) => item.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;
    const next = [...orderedExperience];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next).catch(() => null);
    setDraggedId(null);
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
        {orderedExperience.length === 0 ? (
          <p className="text-center text-gray-500">No experience entries found. Add one to get started!</p>
        ) : (
          <div className="space-y-4">
            {orderedExperience.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-gray-50"
                draggable
                onDragStart={() => setDraggedId(exp.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(exp.id)}
              >
                <div className="flex items-center gap-3">
                  <Tooltip content="Drag to reorder">
                    <span className="cursor-grab text-slate-400">
                      <GripVertical className="h-4 w-4" />
                    </span>
                  </Tooltip>
                  {exp.company_logo_url ? (
                    <Image
                      src={exp.company_logo_url}
                      alt={exp.company}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 rounded-full object-contain bg-white"
                    />
                  ) : null}
                  <h3 className="font-semibold text-gray-800">{exp.title} at {exp.company}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Edit">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedExperience(exp);
                      setIsModalOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteExperience(exp.id)}>
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
