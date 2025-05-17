import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyAuth } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export const AuthWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Verify authentication when component mounts
    if (localStorage.getItem("userInfo")) {
      dispatch(verifyAuth());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!loading) {
      const currentPath = window.location.pathname;
      if (isAuthenticated && currentPath === "/auth") {
        navigate("/code-reviewer");
      } else if (!isAuthenticated && currentPath === "/auth") {
        navigate("/auth");
      } else if (!isAuthenticated) {
        navigate("/");
      }
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
        <div>Loading authentication state...</div>
      </div>
    );
  }
  return children;
};
