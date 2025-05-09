
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/authSlice";
import { LogOut, User } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center">
          <h1 
            className="text-xl font-bold text-primary cursor-pointer" 
            onClick={() => navigate("/")}
          >
            SecureTodo
          </h1>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center">
              <User className="h-4 w-4 mr-2 opacity-70" />
              <span className="text-sm text-gray-600">Hello, {user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center">
              <LogOut className="h-4 w-4 mr-1" />
              <span>Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/register")}>Sign up</Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
