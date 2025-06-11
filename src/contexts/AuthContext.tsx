
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'supplier' | 'admin';
  name: string;
  sessionToken?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'supplier' | 'admin') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app startup
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('user_session');
        const sessionExpiry = localStorage.getItem('session_expiry');
        
        if (savedUser && sessionExpiry) {
          const expiryTime = parseInt(sessionExpiry);
          const currentTime = Date.now();
          
          // Check if session is still valid (24 hours)
          if (currentTime < expiryTime) {
            const parsedUser = JSON.parse(savedUser);
            // Validate user object structure
            if (parsedUser.id && parsedUser.email && parsedUser.role && parsedUser.name) {
              setUser(parsedUser);
              console.log('Valid session found for user:', parsedUser.email);
            } else {
              console.warn('Invalid user session structure, clearing...');
              localStorage.removeItem('user_session');
              localStorage.removeItem('session_expiry');
            }
          } else {
            // Session expired, clear storage
            localStorage.removeItem('user_session');
            localStorage.removeItem('session_expiry');
            console.log('Session expired, cleared storage');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Clear corrupted session data
        localStorage.removeItem('user_session');
        localStorage.removeItem('session_expiry');
      }
      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string, role: 'supplier' | 'admin'): Promise<boolean> => {
    console.log('Login attempt:', { email, role });
    
    // Validate input
    if (!email?.trim() || !password?.trim() || !role) {
      console.error('Missing login credentials');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.error('Invalid email format');
      return false;
    }

    // Validate role
    if (!['supplier', 'admin'].includes(role)) {
      console.error('Invalid role');
      return false;
    }

    try {
      // Simulate API authentication - in production, this would be a real API call
      const sessionToken = btoa(`${email}:${Date.now()}`);
      
      const mockUser: User = {
        id: Date.now().toString(),
        email: email.trim().toLowerCase(),
        role,
        name: role === 'admin' ? 'Admin User' : 'Supplier User',
        sessionToken,
      };
      
      // Set session expiry to 24 hours from now
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      
      // Save user and session info
      setUser(mockUser);
      localStorage.setItem('user_session', JSON.stringify(mockUser));
      localStorage.setItem('session_expiry', expiryTime.toString());
      
      console.log('Login successful for:', email);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.email);
    
    try {
      // Clear user state
      setUser(null);
      
      // Clear all session-related storage
      localStorage.removeItem('user_session');
      localStorage.removeItem('session_expiry');
      localStorage.removeItem('woocommerce_config');
      
      // Force page reload to ensure clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Force page reload even if there's an error
      window.location.href = '/login';
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      isAuthenticated 
    }}>
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
