
import api from "./api";
import { toast } from "../components/ui/use-toast";

// Define types
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface VerificationRequest {
  token: string;
}

export interface PhoneVerificationRequest {
  phoneNumber?: string;
  code: string;
  userId?: string;
}

export interface GoogleLoginRequest {
  tokenId: string;
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
        description: response.data.message || "Welcome to SecureTodo!",
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

  // Verify email with token
  verifyEmail: async (verificationData: VerificationRequest): Promise<void> => {
    try {
      await api.post('/auth/verify-email', verificationData);
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Email verification failed";
      toast({
        title: "Verification Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Send email verification
  sendVerificationEmail: async (email: string): Promise<void> => {
    try {
      await api.post('/auth/send-verification', { email });
      toast({
        title: "Verification sent",
        description: "A verification email has been sent to your inbox",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send verification";
      toast({
        title: "Verification Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Send phone verification code
  sendPhoneVerification: async (phoneNumber: string, userId?: string): Promise<string | null> => {
    try {
      const response = await api.post('/auth/send-phone-verification', { 
        phoneNumber, 
        userId 
      });
      toast({
        title: "Verification sent",
        description: "A verification code has been sent to your phone",
      });
      // In a real app you wouldn't return this, it's just for demo purposes
      return response.data.code || null;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send verification";
      toast({
        title: "Verification Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Verify phone number
  verifyPhoneNumber: async (verificationData: PhoneVerificationRequest): Promise<User> => {
    try {
      const response = await api.post<{message: string, user: User}>('/auth/verify-phone', verificationData);
      toast({
        title: "Phone verified",
        description: "Your phone number has been successfully verified",
      });
      return response.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || "Phone verification failed";
      toast({
        title: "Verification Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Login with Google
  googleLogin: async (tokenId: string): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>('/auth/google-login', { tokenId });
      localStorage.setItem("token", response.data.token);
      toast({
        title: "Google login successful",
        description: "Welcome to SecureTodo!",
      });
      return response.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || "Google login failed";
      toast({
        title: "Login Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }
};

export default authService;
