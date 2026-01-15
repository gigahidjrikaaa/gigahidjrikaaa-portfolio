import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      const verifyAuth = async () => {
        try {
          const response = await apiService.verifyToken();
          if (!response.valid || !response.user || !response.user.is_admin) {
            router.replace('/admin/login');
          }
        } catch (error) {
          console.error('Authentication error:', error);
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