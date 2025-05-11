import { router } from 'expo-router';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

// Define types for our context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    uid?: string;
    email?: string;
    display_name?: string;
    username?: string;
  } | null;
  login: (email: string, password: string) => Promise<authService.LoginResponse>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<authService.RegisterResponse>;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {
    return {} as authService.LoginResponse;
  },
  register: async () => {
    return {} as authService.RegisterResponse;
  },
  logout: () => {},
});

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getAuthToken();
        if (token) {
          const userData = authService.getUserData();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<authService.LoginResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setUser({
        uid: response.uid,
        email: response.email,
        display_name: response.display_name,
        username: response.username
      });
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, confirmPassword: string): Promise<authService.RegisterResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.register({
        name,
        email,
        password,
        confirm_password: confirmPassword
      });
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Create a wrapper component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/(auth)/login');
      }
    }, [isAuthenticated, isLoading]);

    // Show nothing while loading
    if (isLoading) {
      return null;
    }

    // If authenticated, render the component
    return isAuthenticated ? <Component {...props} /> : null;
  };
} 