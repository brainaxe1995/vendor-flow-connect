
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
    // Check for existing valid session on app start
    const checkSession = () => {
      try {
        const savedUser = localStorage.getItem('user_session');
        const sessionExpiry = localStorage.getItem('session_expiry');
        
        if (savedUser && sessionExpiry) {
          const now = new Date().getTime();
          const expiryTime = parseInt(sessionExpiry);
          
          if (now < expiryTime) {
            // Session is still valid
            setUser(JSON.parse(savedUser));
          } else {
            // Session expired, clean up
            localStorage.removeItem('user_session');
            localStorage.removeItem('session_expiry');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('user_session');
        localStorage.removeItem('session_expiry');
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string, role: 'supplier' | 'admin'): Promise<boolean> => {
    try {
      // Basic validation - replace with real API call
      if (!email || !password) {
        return false;
      }

      // Mock authentication - replace with real API
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        name: role === 'admin' ? 'Admin User' : 'Supplier User',
      };
      
      // Set session with 24-hour expiry
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
      
      setUser(mockUser);
      localStorage.setItem('user_session', JSON.stringify(mockUser));
      localStorage.setItem('session_expiry', expiryTime.toString());
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
    localStorage.removeItem('session_expiry');
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
