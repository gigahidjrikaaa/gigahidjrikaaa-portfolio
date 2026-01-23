"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import EducationForm from './EducationForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import Tooltip from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast';
import { EducationBase, EducationResponse } from '@/services/api';

const EducationManagement = () => {
  const { education, fetchEducation, createEducation, updateEducation, deleteEducation } = useAdminStore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<EducationResponse | null>(null);
  const [orderedEducation, setOrderedEducation] = useState<EducationResponse[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  useEffect(() => {
    setOrderedEducation(education);
  }, [education]);

  const handleSaveEducation = async (educationData: EducationBase) => {
    try {
      if (selectedEducation) {
        await updateEducation(selectedEducation.id, educationData);
        toast({
          title: 'Education updated',
          description: 'Education entry saved successfully.',
          variant: 'success',
        });
      } else {
        await createEducation({
          ...educationData,
          display_order: orderedEducation.length,
        });
        toast({
          title: 'Education added',
          description: 'New education entry created.',
          variant: 'success',
        });
      }
      setIsModalOpen(false);
      setSelectedEducation(null);
    } catch (error) {
      console.error('Failed to save education:', error);
      toast({
        title: 'Unable to save education',
        description: 'Please review the fields and try again.',
        variant: 'error',
      });
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (confirm('Are you sure you want to delete this education entry?')) {
      try {
        await deleteEducation(id);
        toast({
          title: 'Education deleted',
          description: 'The entry has been removed.',
          variant: 'success',
        });
      } catch (error) {
        console.error('Failed to delete education:', error);
        toast({
          title: 'Unable to delete education',
          description: 'Please try again in a moment.',
          variant: 'error',
        });
      }
    }
  };

  const persistOrder = async (nextItems: EducationResponse[]) => {
    setOrderedEducation(nextItems);
    try {
      await Promise.all(
        nextItems.map((item, index) => updateEducation(item.id, { display_order: index }))
      );
      toast({
        title: 'Education order updated',
        description: 'Display order has been saved.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to reorder education', error);
      toast({
        title: 'Unable to reorder education',
        description: 'Please try again.',
        variant: 'error',
      });
    }
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const currentIndex = orderedEducation.findIndex((item) => item.id === draggedId);
    const targetIndex = orderedEducation.findIndex((item) => item.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;
    const next = [...orderedEducation];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next).catch(() => null);
    setDraggedId(null);
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
        {orderedEducation.length === 0 ? (
          <p className="text-center text-gray-500">No education entries found. Add one to get started!</p>
        ) : (
          <div className="space-y-4">
            {orderedEducation.map((edu) => (
              <div
                key={edu.id}
                className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-gray-50"
                draggable
                onDragStart={() => setDraggedId(edu.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(edu.id)}
              >
                <div className="flex items-center gap-3">
                  <Tooltip content="Drag to reorder">
                    <span className="cursor-grab text-slate-400">
                      <GripVertical className="h-4 w-4" />
                    </span>
                  </Tooltip>
                  {edu.institution_logo_url ? (
                    <Image
                      src={edu.institution_logo_url}
                      alt={edu.institution}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 rounded-full object-contain bg-white"
                    />
                  ) : null}
                  <h3 className="font-semibold text-gray-800">{edu.degree} from {edu.institution}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Edit">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedEducation(edu);
                      setIsModalOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteEducation(edu.id)}>
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
