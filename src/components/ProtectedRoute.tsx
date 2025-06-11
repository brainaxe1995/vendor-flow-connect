
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'supplier' | 'admin';
  allowedRoles?: Array<'supplier' | 'admin'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowedRoles 
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading...</p>
            <p className="text-sm text-muted-foreground">Checking authentication</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validate user object structure
  if (!user.id || !user.email || !user.role) {
    console.error('Invalid user session, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  const hasAccess = () => {
    if (requiredRole) {
      return user.role === requiredRole;
    }
    
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.role as 'supplier' | 'admin');
    }
    
    // Default: allow all authenticated users
    return true;
  };

  if (!hasAccess()) {
    console.log(`Access denied. User role: ${user.role}, Required: ${requiredRole || allowedRoles?.join(', ')}`);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this area.
            </p>
            <div className="p-3 bg-muted rounded-md text-sm">
              <p><strong>Your role:</strong> {user.role}</p>
              {requiredRole && <p><strong>Required role:</strong> {requiredRole}</p>}
              {allowedRoles && <p><strong>Allowed roles:</strong> {allowedRoles.join(', ')}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
