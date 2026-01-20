"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import SkillForm from './SkillForm';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { SkillBase, SkillResponse } from '@/services/api';

const SkillManagement = () => {
  const { skills, fetchSkills, createSkill, updateSkill, deleteSkill } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillResponse | null>(null);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleSaveSkill = async (skillData: SkillBase) => {
    try {
      if (selectedSkill) {
        await updateSkill(selectedSkill.id, skillData);
      } else {
        await createSkill(skillData);
      }
      setIsModalOpen(false);
      setSelectedSkill(null);
    } catch (error) {
      console.error('Failed to save skill:', error);
      alert('Failed to save skill. Please try again.');
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteSkill(id);
      } catch (error) {
        console.error('Failed to delete skill:', error);
        alert('Failed to delete skill. Please try again.');
      }
    }
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
        {skills.length === 0 ? (
          <p className="text-center text-gray-500">No skills found. Add one to get started!</p>
        ) : (
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
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
                  <h3 className="font-semibold text-gray-800">{skill.name} ({skill.category})</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedSkill(skill);
                    setIsModalOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSkill(skill.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
