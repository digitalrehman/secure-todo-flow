
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

// Authentication service
const authService = {
  // Register a new user
  register: async (userData: RegisterCredentials): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>("/auth/email/register", userData);
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

  // Login user using Auth.js
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      const response = await api.post("/auth/callback/credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false
      });
      
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
  logout: async () => {
    try {
      await api.post("/auth/signout", { redirect: false });
      localStorage.removeItem("token");
      toast({
        title: "Logged out",
        description: "You have been securely logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get("/auth/session");
      return response.data?.user || null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const response = await api.get("/auth/session");
      return !!response.data?.user;
    } catch (error) {
      return false;
    }
  },

  // Verify email with token
  verifyEmail: async (verificationData: VerificationRequest): Promise<void> => {
    try {
      await api.post('/auth/email/verify-email', verificationData);
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
      await api.post('/auth/email/send-verification', { email });
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
      const response = await api.post('/auth/email/send-phone-verification', { 
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
      const response = await api.post<{message: string, user: User}>('/auth/email/verify-phone', verificationData);
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
  googleLogin: async (): Promise<void> => {
    try {
      window.location.href = "/api/auth/signin/google";
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: "Google login failed",
        variant: "destructive",
      });
      throw error;
    }
  }
};

export default authService;
