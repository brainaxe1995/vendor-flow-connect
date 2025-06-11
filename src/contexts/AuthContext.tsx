
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'supplier' | 'admin';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'supplier' | 'admin') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user session:', error);
        localStorage.removeItem('user_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'supplier' | 'admin'): Promise<boolean> => {
    // Mock authentication - replace with real API call
    if (email && password) {
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        role,
        name: role === 'admin' ? 'Admin User' : 'Supplier User',
      };
      
      setUser(mockUser);
      localStorage.setItem('user_session', JSON.stringify(mockUser));
      console.log('User logged in:', mockUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    console.log('User logged out');
    setUser(null);
    localStorage.removeItem('user_session');
    localStorage.removeItem('woocommerce_config');
    // Force redirect to login
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
