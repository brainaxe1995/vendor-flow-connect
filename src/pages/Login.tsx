
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('supplier');
  const [error, setError] = useState('');
  
  const { user, signIn, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user && !loading) {
      console.log('User already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const validateUserRole = (userEmail: string, selectedTab: string): boolean => {
    const isAdminEmail = userEmail.toLowerCase().includes('admin') || userEmail.toLowerCase().includes('tharavix');
    
    if (selectedTab === 'admin' && !isAdminEmail) {
      setError('This appears to be a supplier account. Please use the Supplier login tab.');
      return false;
    }
    
    if (selectedTab === 'supplier' && isAdminEmail) {
      setError('This appears to be an admin account. Please use the Admin login tab.');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting Supabase login for:', email);
      
      // First validate the user role based on email and selected tab
      if (!validateUserRole(email.trim(), activeTab)) {
        setIsLoading(false);
        return;
      }
      
      const { error: signInError } = await signIn(email.trim(), password);
      
      if (signInError) {
        console.error('Login error:', signInError);
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(signInError.message);
        }
        toast.error('Login failed - check your credentials');
      } else {
        toast.success(`Welcome back! Logged in as ${activeTab}`);
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError('');
    setEmail('');
    setPassword('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Tharavix Portal</h1>
          <p className="text-muted-foreground">
            Access your WooCommerce integration dashboard
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supplier">Supplier</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <TabsContent value="supplier" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-email">Email</Label>
                  <Input 
                    id="supplier-email" 
                    type="email" 
                    placeholder="supplier@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={isLoading} 
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleLogin()} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-password">Password</Label>
                  <Input 
                    id="supplier-password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    disabled={isLoading} 
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleLogin()} 
                  />
                </div>
                <Button 
                  onClick={handleLogin} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in as Supplier'
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input 
                    id="admin-email" 
                    type="email" 
                    placeholder="admin@tharavix.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={isLoading} 
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleLogin()} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input 
                    id="admin-password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    disabled={isLoading} 
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleLogin()} 
                  />
                </div>
                <Button 
                  onClick={handleLogin} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in as Admin'
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Use your Supabase credentials to sign in</p>
          <p className="text-xs">Secure authentication powered by Supabase</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
