"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import SkillForm from './SkillForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import Tooltip from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast';
import { SkillBase, SkillResponse } from '@/services/api';

const PROFICIENCY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
  5: 'Master',
};

const getProficiencyLabel = (value: number | null | undefined) => {
  if (typeof value !== 'number') return 'Unspecified';
  return PROFICIENCY_LABELS[value] ?? 'Unspecified';
};

const SkillManagement = () => {
  const { skills, fetchSkills, createSkill, updateSkill, deleteSkill } = useAdminStore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillResponse | null>(null);
  const [orderedSkills, setOrderedSkills] = useState<SkillResponse[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useEffect(() => {
    setOrderedSkills(skills);
  }, [skills]);

  const handleSaveSkill = async (skillData: SkillBase) => {
    try {
      if (selectedSkill) {
        await updateSkill(selectedSkill.id, skillData);
        toast({
          title: 'Skill updated',
          description: 'Skill saved successfully.',
          variant: 'success',
        });
      } else {
        await createSkill({
          ...skillData,
          display_order: orderedSkills.length,
        });
        toast({
          title: 'Skill added',
          description: 'New skill created.',
          variant: 'success',
        });
      }
      setIsModalOpen(false);
      setSelectedSkill(null);
    } catch (error) {
      console.error('Failed to save skill:', error);
      toast({
        title: 'Unable to save skill',
        description: 'Please review the fields and try again.',
        variant: 'error',
      });
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteSkill(id);
        toast({
          title: 'Skill deleted',
          description: 'The skill has been removed.',
          variant: 'success',
        });
      } catch (error) {
        console.error('Failed to delete skill:', error);
        toast({
          title: 'Unable to delete skill',
          description: 'Please try again in a moment.',
          variant: 'error',
        });
      }
    }
  };

  const persistOrder = async (nextItems: SkillResponse[]) => {
    setOrderedSkills(nextItems);
    try {
      await Promise.all(
        nextItems.map((item, index) => updateSkill(item.id, { display_order: index }))
      );
      toast({
        title: 'Skill order updated',
        description: 'Display order has been saved.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to reorder skills', error);
      toast({
        title: 'Unable to reorder skills',
        description: 'Please try again.',
        variant: 'error',
      });
    }
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const currentIndex = orderedSkills.findIndex((item) => item.id === draggedId);
    const targetIndex = orderedSkills.findIndex((item) => item.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;
    const next = [...orderedSkills];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next).catch(() => null);
    setDraggedId(null);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Skills</CardTitle>
        <Button onClick={() => {
          setSelectedSkill(null);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </CardHeader>
      <CardContent>
        {orderedSkills.length === 0 ? (
          <p className="text-center text-gray-500">No skills found. Add one to get started!</p>
        ) : (
          <div className="space-y-4">
            {orderedSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-gray-50"
                draggable
                onDragStart={() => setDraggedId(skill.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(skill.id)}
              >
                <div className="flex items-center gap-3">
                  <Tooltip content="Drag to reorder">
                    <span className="cursor-grab text-slate-400">
                      <GripVertical className="h-4 w-4" />
                    </span>
                  </Tooltip>
                  {skill.icon_url ? (
                    <Image
                      src={skill.icon_url}
                      alt={skill.name}
                      width={32}
                      height={32}
                      unoptimized
                      className="h-8 w-8 rounded object-contain bg-white"
                    />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{skill.name}</h3>
                    <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
                      {getProficiencyLabel(skill.proficiency)}
                    </span>
                    <span className="text-sm text-gray-500">({skill.category})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Edit">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedSkill(skill);
                      setIsModalOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSkill(skill.id)}>
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
        <SkillForm
          skill={selectedSkill}
          onSave={handleSaveSkill}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedSkill(null);
          }}
        />
      )}
    </Card>
  );
};

export default SkillManagement;
