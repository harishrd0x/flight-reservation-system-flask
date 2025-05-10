
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserProfile } from "@/models/types/user";

// Update User type to include displayName
export interface User {
  email: string;
  userType: 'admin' | 'customer' | null;
  displayName?: string;
}

interface AuthContextProps {
  user: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, userType: 'admin' | 'customer') => boolean;
  logout: () => void;
  getToken: () => string | null;
  isAuthenticated: boolean;
  checkRole: (role: 'admin' | 'customer') => boolean;
  updateUserProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  userProfile: null,
  login: () => false,
  register: () => false,
  logout: () => {},
  getToken: () => null,
  isAuthenticated: false,
  checkRole: () => false,
  updateUserProfile: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user from localStorage
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Initialize userProfile from localStorage
    const storedProfile = localStorage.getItem('userProfile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    // Initialize token from localStorage
    return localStorage.getItem('token');
  });
  
  const isAuthenticated = Boolean(user && token);
  
  useEffect(() => {
    // If we have a user but no profile, create an initial profile
    if (user && !userProfile) {
      const initialProfile: UserProfile = {
        email: user.email,
        userType: user.userType,
        displayName: user.displayName || user.email.split('@')[0],
      };
      
      setUserProfile(initialProfile);
      localStorage.setItem('userProfile', JSON.stringify(initialProfile));
    }
  }, [user, userProfile]);

  const login = (email: string, password: string): boolean => {
    // This is a mock implementation
    if (password === 'password') {
      // For test account
      const userData: User = {
        email,
        userType: email.includes('admin') ? 'admin' : 'customer',
        displayName: email.split('@')[0],
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Generate a mock token
      const mockToken = 'mocked_token_' + Math.random().toString(36).substring(2, 15);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      
      // Create initial profile
      const initialProfile: UserProfile = {
        email,
        userType: userData.userType,
        displayName: userData.displayName,
      };
      
      setUserProfile(initialProfile);
      localStorage.setItem('userProfile', JSON.stringify(initialProfile));
      
      return true;
    }
    return false;
  };

  const register = (email: string, password: string, userType: 'admin' | 'customer'): boolean => {
    // This is a mock implementation
    // In a real app, you would send this to your backend API
    
    const userData: User = {
      email,
      userType,
      displayName: email.split('@')[0],
    };
    
    // Store user in localStorage (simulating a successful registration)
    localStorage.setItem('registeredUsers', JSON.stringify([
      ...JSON.parse(localStorage.getItem('registeredUsers') || '[]'),
      { email, password, userType }
    ]));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
  };

  const getToken = () => {
    return token;
  };
  
  const checkRole = (role: 'admin' | 'customer'): boolean => {
    return user?.userType === role;
  };
  
  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const updatedProfile = { ...userProfile, ...data };
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // Also update displayName in user if it's changed
    if (data.displayName && data.displayName !== user?.displayName) {
      const updatedUser = { ...user!, displayName: data.displayName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      login, 
      register,
      logout, 
      getToken, 
      isAuthenticated, 
      checkRole,
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
