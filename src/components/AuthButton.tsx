
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuthButton = () => {
  const { user, signOut, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{user.email}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:ml-2 sm:inline">Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignIn}>
      <User className="h-4 w-4" />
      <span className="hidden sm:ml-2 sm:inline">Sign In</span>
    </Button>
  );
};

export default AuthButton;
