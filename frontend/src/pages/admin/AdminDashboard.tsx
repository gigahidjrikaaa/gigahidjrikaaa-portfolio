import { useEffect } from 'react';
import ProjectManagement from '@/components/admin/ProjectManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FolderOpen,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import withAdminAuth from '@/hoc/withAdminAuth';

interface User {
  username: string;
  is_admin: boolean;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminDashboard = ({ user }: { user: User }) => {
  const {
    projects,
    messages,
    loading,
    fetchProjects,
    fetchMessages,
  } = useAdminStore();

  useEffect(() => {
    fetchProjects();
    fetchMessages();
  }, [fetchProjects, fetchMessages]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={projects.length}
          icon={FolderOpen}
          color="text-blue-600"
        />
        <StatCard
          title="Unread Messages"
          value={messages.filter((msg: ContactMessage) => !msg.is_read).length}
          icon={MessageSquare}
          color="text-red-600"
        />
        {/* Add more stats as needed, fetching data from the store */}
      </div>

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
          <ProjectManagement />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message: ContactMessage) => (
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

export default withAdminAuth(AdminDashboard);