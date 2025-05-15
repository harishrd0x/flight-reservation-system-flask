// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { UserProfile } from "@/models/types/user";

// The basic user type for login and authentication.
export interface User {
  email: string;
  userType: "admin" | "customer" | null;
  displayName?: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    mobileNumber: string,
    password: string,
    dob: string,
    address: string,
    zipCode: string,
    gender: string
  ) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
  isAuthenticated: boolean;
  checkRole: (role: "admin" | "customer") => boolean;
  updateUserProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  userProfile: null,
  login: async () => false,
  register: async () => false,
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
  // Load basic user info from localStorage if available.
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Load full user profile from localStorage if available.
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const storedProfile = localStorage.getItem("userProfile");
    return storedProfile ? JSON.parse(storedProfile) : null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    if (user && !userProfile) {
      const initialProfile: UserProfile = {
        email: user.email,
        role: user.userType === "admin" ? "ADMIN" : "CUSTOMER",
        name: user.displayName || user.email.split("@")[0],
      };
      setUserProfile(initialProfile);
      localStorage.setItem("userProfile", JSON.stringify(initialProfile));
    }
  }, [user, userProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        const userData: User = {
          email,
          userType: email.includes("admin") ? "admin" : "customer",
          displayName: email.split("@")[0],
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(data.access_token);
        localStorage.setItem("token", data.access_token);
        const initialProfile: UserProfile = {
          email,
          role: userData.userType === "admin" ? "ADMIN" : "CUSTOMER",
          name: userData.displayName,
        };
        setUserProfile(initialProfile);
        localStorage.setItem("userProfile", JSON.stringify(initialProfile));
        return true;
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    mobileNumber: string,
    password: string,
    dob: string,
    address: string,
    zipCode: string,
    gender: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile_number: mobileNumber,
          password,
          dob,
          address,
          zip_code: zipCode,
          gender,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Register error:", errorData);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserProfile(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
  };

  const getToken = () => token;

  const checkRole = (role: "admin" | "customer"): boolean => {
    return user?.userType === role;
  };

  // Memoize updateUserProfile so its reference remains stable.
  const updateUserProfile = useCallback((data: Partial<UserProfile>) => {
    const updatedProfile = userProfile ? { ...userProfile, ...data } : (data as UserProfile);
    setUserProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    if (data.name && user && data.name !== user.displayName) {
      const updatedUser = { ...user, displayName: data.name };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [user, userProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // token is now added directly to the context value.
        userProfile,
        login,
        register,
        logout,
        getToken,
        isAuthenticated,
        checkRole,
        updateUserProfile,
      }}
    >
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
