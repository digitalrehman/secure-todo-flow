
import api from "./api";
import { toast } from "../components/ui/use-toast";

// Define types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Authentication service
const authService = {
  // Register a new user
  register: async (userData: RegisterCredentials): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);
      // Store token in localStorage
      localStorage.setItem("token", response.data.token);
      toast({
        title: "Registration successful",
        description: "Welcome to SecureTodo!",
      });
      return response.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      toast({
        title: "Registration Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      // Store token in localStorage
      localStorage.setItem("token", response.data.token);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      return response.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      toast({
        title: "Login Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    toast({
      title: "Logged out",
      description: "You have been securely logged out.",
    });
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }
      const response = await api.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};

export default authService;
