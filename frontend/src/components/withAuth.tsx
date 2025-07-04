"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const verify = async () => {
        try {
          // This endpoint should verify the token and return the user's role
          const user = await apiService.getCurrentUser();
          if (user && user.is_admin) {
            setIsAdmin(true);
          } else {
            router.replace('/admin/login');
          }
        } catch (error) {
          console.error('Verification failed', error);
          router.replace('/admin/login');
        }
        setIsLoading(false);
      };

      verify();
    }, [router]);

    if (isLoading) {
      return <div>Loading...</div>; // Or a spinner component
    }

    if (!isAdmin) {
      return null; // Or a redirect component, though router.replace should handle it
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
