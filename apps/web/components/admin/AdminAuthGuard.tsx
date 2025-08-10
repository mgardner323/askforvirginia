import React from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'agent' | 'client';
  profile: {
    first_name: string;
    last_name: string;
  };
}

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'agent';
  fallback?: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  children,
  requiredRole = 'agent',
  fallback = null
}) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false);

  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userDataString = localStorage.getItem('user');

      if (!token || !userDataString) {
        redirectToLogin();
        return;
      }

      // Parse stored user data
      let userData: User;
      try {
        userData = JSON.parse(userDataString);
      } catch {
        redirectToLogin();
        return;
      }

      // Verify token with server
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          const serverUser = data.data.user;
          
          // Check if user has required role
          const hasRequiredRole = 
            requiredRole === 'agent' 
              ? (serverUser.role === 'admin' || serverUser.role === 'agent')
              : serverUser.role === requiredRole;

          if (hasRequiredRole) {
            setUser(serverUser);
            setIsAuthenticated(true);
            setIsAuthorized(true);
            
            // Update stored user data if it's different
            if (JSON.stringify(userData) !== JSON.stringify(serverUser)) {
              localStorage.setItem('user', JSON.stringify(serverUser));
            }
          } else {
            // User doesn't have required role
            setIsAuthenticated(true);
            setIsAuthorized(false);
            setUser(serverUser);
          }
        } else {
          redirectToLogin();
        }
      } else {
        // Token is invalid or expired
        redirectToLogin();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      redirectToLogin();
    }
  };

  const redirectToLogin = () => {
    // Clear stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(router.asPath);
    router.replace(`/admin/login?returnUrl=${returnUrl}`);
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // User is authenticated but not authorized
  if (isAuthenticated && !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin portal. 
            {requiredRole === 'admin' ? ' Administrator access required.' : ' Agent or administrator access required.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Main Site
            </button>
            <button
              onClick={redirectToLogin}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sign in with Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is not authenticated
  if (!isAuthenticated) {
    return fallback || null;
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

// Hook to access current user data in admin components
export const useAdminAuth = () => {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
  };

  return { user, signOut };
};

export default AdminAuthGuard;