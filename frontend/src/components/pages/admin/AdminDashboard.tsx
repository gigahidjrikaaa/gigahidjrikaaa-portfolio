import React from 'react';

// Deprecated: app router now uses AdminOverview + per-section pages.
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectManagement from '@/components/admin/ProjectManagement';
import ExperienceManagement from '@/components/admin/ExperienceManagement';
import EducationManagement from '@/components/admin/EducationManagement';
import SkillManagement from '@/components/admin/SkillManagement';
import ContactMessageManagement from '@/components/admin/ContactMessageManagement';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Admin Dashboard</h1>
      <Tabs defaultValue="projects" className="w-full max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <ProjectManagement />
        </TabsContent>
        <TabsContent value="experience">
          <ExperienceManagement />
        </TabsContent>
        <TabsContent value="education">
          <EducationManagement />
        </TabsContent>
        <TabsContent value="skills">
          <SkillManagement />
        </TabsContent>
        <TabsContent value="messages">
          <ContactMessageManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
