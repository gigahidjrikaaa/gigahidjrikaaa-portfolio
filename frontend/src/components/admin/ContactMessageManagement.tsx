"use client";
import { useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Trash2 } from 'lucide-react';

const ContactMessageManagement = () => {
  const { messages, fetchMessages, markMessageAsRead, deleteMessage } = useAdminStore();

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markMessageAsRead(id);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      alert('Failed to mark message as read. Please try again.');
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(id);
      } catch (error) {
        console.error('Failed to delete message:', error);
        alert('Failed to delete message. Please try again.');
      }
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Contact Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No contact messages found.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">From: {message.name} ({message.email})</h3>
                  <div className="flex items-center gap-2">
                    {!message.is_read && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(message.id)}>
                        <Eye className="h-4 w-4 mr-1" /> Mark as Read
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteMessage(message.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{message.message}</p>
                <p className="text-gray-500 text-xs mt-2">Received: {new Date(message.created_at).toLocaleString()}</p>
                {message.is_read && <span className="text-xs text-green-600">Read</span>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactMessageManagement;
