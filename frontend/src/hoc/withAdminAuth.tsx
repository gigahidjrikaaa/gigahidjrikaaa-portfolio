"use client";
import { useRouter } from 'next/router';
import { useEffect, useState, ComponentType } from 'react';
import { apiService } from '@/services/api';

interface User {
  username: string;
  is_admin: boolean;
}

const withAdminAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.replace('/admin/login');
          return;
        }

        try {
          const currentUser = await apiService.getCurrentUser();
          if (currentUser && currentUser.is_admin) {
            setUser(currentUser);
          } else {
            // Not an admin or invalid token
            localStorage.removeItem('access_token');
            router.replace('/admin/login');
          }
        } catch (error) {
          console.error('Authentication check failed', error);
          localStorage.removeItem('access_token');
          router.replace('/admin/login');
        }
 finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      // This will be briefly visible before the redirect happens.
      return null;
    }

    // Pass the user object to the wrapped component
    return <WrappedComponent {...props} user={user} />;
  };

  AuthComponent.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAdminAuth;
