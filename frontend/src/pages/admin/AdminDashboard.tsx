import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  FolderOpen,
  Settings,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/services/api';

interface DashboardStats {
  total_projects: number;
  featured_projects: number;
  total_skills: number;
  total_experience: number;
  total_education: number;
  unread_messages: number;
  total_messages: number;
}

interface Project {
  id: number;
  title: string;
  tagline: string;
  is_featured: boolean;
  created_at: string;
  display_order: number;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, projectsData, messagesData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getProjects(),
        adminApi.getContactMessages()
      ]);
      
      setStats(statsData);
      setProjects(projectsData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            value={stats.total_projects}
            icon={FolderOpen}
            color="text-blue-600"
          />
          <StatCard
            title="Featured Projects"
            value={stats.featured_projects}
            icon={BarChart3}
            color="text-green-600"
          />
          <StatCard
            title="Unread Messages"
            value={stats.unread_messages}
            icon={MessageSquare}
            color="text-red-600"
          />
          <StatCard
            title="Total Skills"
            value={stats.total_skills}
            icon={Settings}
            color="text-purple-600"
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projects Management</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{project.title}</h3>
                        {project.is_featured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{project.tagline}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
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
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{message.name}</h3>
                        <span className="text-sm text-gray-600">{message.email}</span>
                        {!message.is_read && (
                          <Badge variant="destructive">Unread</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{message.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!message.is_read && (
                        <Button variant="outline" size="sm">
                          Mark as Read
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tab contents for experience, education, skills */}
      </Tabs>
    </div>
  );
}