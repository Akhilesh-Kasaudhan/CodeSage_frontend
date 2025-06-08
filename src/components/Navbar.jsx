import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { CircleUserRound, LogOut, Menu, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, isAuthenticated } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Successfully logged out!");
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="flex justify-between items-center px-6 py-2 backdrop-blur-sm text-white border-b border-gray-700/50 fixed top-0 left-0 w-full shadow-lg z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              <Sparkles className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                CodeSage
              </span>
              <div className="text-xs text-gray-400 -mt-1">
                AI Code Reviewer
              </div>
            </div>
          </Link>{" "}
        </div>
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-4 ">
            <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700/50">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <CircleUserRound className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-gray-200">
                  {userInfo?.user?.username || "User"}
                </p>
                <p className="text-xs text-gray-400">Developer</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/40 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-400 hover:text-white p-2"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        )}
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && isAuthenticated && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-l border-gray-700/50 shadow-2xl z-50 md:hidden"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      CodeSage
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <CircleUserRound className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-200">
                        {userInfo?.user?.username || "User"}
                      </p>
                      <p className="text-sm text-gray-400">Developer Account</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-3">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors duration-200 text-gray-300 hover:text-white"
                  >
                    <div className="p-1.5 bg-gray-700/50 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>Code Review</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="pt-4 border-t border-gray-700/50">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/40 transition-all duration-200 justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </Button>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500 text-center">
                    Powered by AI • Made with ❤️
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
