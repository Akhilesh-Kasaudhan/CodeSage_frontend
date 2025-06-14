import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyAuth } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import Loader from "./ui/Loader";

export const AuthWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Verify authentication when component mounts
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
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
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <Loader />;
  }
  return children;
};
