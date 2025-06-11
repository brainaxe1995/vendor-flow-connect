
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('supplier');
  const [error, setError] = useState('');
  
  const {
    login,
    isAuthenticated,
    user
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleLogin = async (role: 'supplier' | 'admin') => {
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
      console.log(`Attempting ${role} login for:`, email);
      const success = await login(email.trim(), password, role);
      
      if (success) {
        toast.success(`${role === 'admin' ? 'Admin' : 'Supplier'} login successful!`);
        navigate(from, { replace: true });
      } else {
        setError('Invalid credentials. Please try again.');
        toast.error('Login failed - check your credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleLogin('supplier')} 
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
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleLogin('supplier')} 
                  />
                </div>
                <Button 
                  onClick={() => handleLogin('supplier')} 
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
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleLogin('admin')} 
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
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleLogin('admin')} 
                  />
                </div>
                <Button 
                  onClick={() => handleLogin('admin')} 
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
          <p>Demo credentials: any email/password combination</p>
          <p className="text-xs">Session expires after 24 hours</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
