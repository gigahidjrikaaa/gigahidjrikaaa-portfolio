import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import { UserResponse } from '@/services/api';

const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      const verifyAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.replace('/admin/login');
          return;
        }

        try {
          const response = await apiService.verifyToken();
          if (!response.valid || !response.user || !response.user.is_admin) {
            localStorage.removeItem('access_token');
            router.replace('/admin/login');
          }
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('access_token');
          router.replace('/admin/login');
        }
      };

      verifyAuth();
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAdminAuth;