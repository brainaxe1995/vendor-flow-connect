
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AppHeader = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-background border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Tharavix Portal</h1>
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {user.role === 'admin' ? 'Administrator' : 'Supplier'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{user.name}</span>
            <br />
            <span className="text-xs">{user.email}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
