
import axios from "axios";
import { toast } from "../components/ui/use-toast";

// Define the base URL for our API
const API_URL = "https://api-endpoint.example.com/api";

// Create an Axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending/receiving cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Adds auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle unauthorized errors (401)
    if (response && response.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      toast({
        title: "Session Expired",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
    }

    // Handle forbidden errors (403)
    if (response && response.status === 403) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
        variant: "destructive",
      });
    }

    // Handle server errors (500)
    if (response && response.status >= 500) {
      toast({
        title: "Server Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
