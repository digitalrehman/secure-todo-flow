
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchCurrentUser } from "../../store/authSlice";

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If we don't have a user yet, try to fetch them
    if (!user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user, loading]);

  // Show nothing while we're checking authentication
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, show the protected content
  return <>{children}</>;
};

export default RequireAuth;
