import React from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { CircleUserRound } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, isAuthenticated } = useSelector((state) => state.auth);
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Successfully logged out!");
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white flex-wrap fixed top-0 left-0 w-full  shadow-md">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">CodeSage 🦉</span>
        </Link>{" "}
        {/* <-- Logo and Name */}
      </div>
      {isAuthenticated && (
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <div className="text-right">
            <p className="font-semibold text-sm flex items-center gap-1">
              <CircleUserRound />
              {userInfo?.user?.username || "User"}
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
