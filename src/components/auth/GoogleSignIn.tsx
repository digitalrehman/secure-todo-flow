
import { useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { useAppDispatch } from "../../store/hooks";
import { googleLogin } from "../../store/authSlice";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        }
      }
    }
  }
}

interface GoogleSignInProps {
  text?: string;
  className?: string;
}

const GoogleSignIn = ({ text = "Continue with Google", className = "" }: GoogleSignInProps) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      await dispatch(googleLogin(response.credential)).unwrap();
    } catch (error) {
      console.error("Google login failed", error);
    }
  }, [dispatch]);

  useEffect(() => {
    // Check if Google API is loaded
    if (!window.google || !window.google.accounts) {
      // Load the Google API script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      initializeGoogleSignIn();
    }
  }, [handleCredentialResponse]);

  const initializeGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID", // Replace with your Google Client ID
          callback: handleCredentialResponse,
          auto_select: false,
        });
      } catch (error) {
        console.error("Failed to initialize Google Sign-In", error);
        toast({
          title: "Google Sign-In Error",
          description: "Failed to initialize Google Sign-In. Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const handleGoogleSignIn = () => {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.prompt();
      } else {
        toast({
          title: "Google Sign-In Error",
          description: "Google Sign-In is not available. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to prompt Google Sign-In", error);
      toast({
        title: "Google Sign-In Error",
        description: "Failed to open Google Sign-In. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      className={`w-full flex items-center justify-center gap-2 ${className}`}
      onClick={handleGoogleSignIn}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {text}
    </Button>
  );
};

export default GoogleSignIn;
