import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setInputCode,
  setLanguage,
  reviewCode,
  clearReviewResult,
  clearInputAndResult,
  fetchCodeHistory,
  deleteCodeHistoryByUser,
} from "@/store/slices/reviewSlice.js";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CodeInput from "@/components/CodeInput";
import LanguageSelect from "@/components/LanguageSelect";
import ReviewResult from "@/components/ReviewResult";
import HistorySection from "@/components/HistorySection";
import moment from "moment";
import {
  AlignJustify,
  History,
  Trash2,
  Code2,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function CodeReviewer() {
  const dispatch = useDispatch();
  const { inputCode, language, reviewedResult, loading, history, error } =
    useSelector((state) => state.review);

  const [isNewSubmission, setIsNewSubmission] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    dispatch(fetchCodeHistory())
      .unwrap()
      .catch((err) => {
        toast.error(err.message || "Failed to fetch code history");
      });
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCodeInputChange = (newValue) => {
    dispatch(setInputCode(newValue));
    if (newValue && reviewedResult) {
      dispatch(clearReviewResult());
    }
  };

  const handleSubmit = () => {
    if (!inputCode.trim()) {
      toast.warning("Please enter some code to review");
      return;
    }
    setIsNewSubmission(true);
    dispatch(reviewCode({ code: inputCode, language }))
      .unwrap()
      .catch((error) => {
        toast.error(error.message || "Failed to review code");
      })
      .finally(() => {
        setIsNewSubmission(false);
      });
  };

  const handleClearInputAndResults = () => {
    dispatch(clearInputAndResult());
    setSelectedHistory(null);
  };

  const handleClearHistory = () => {
    if (!history.length) {
      toast.info("No history to clear");
      return;
    }
    if (window.confirm("Are you sure you want to clear all history?")) {
      dispatch(deleteCodeHistoryByUser());
      setSelectedHistory(null);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900  relative min-h-screen text-white flex">
      <Navbar />

      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSidebarOpen ? (
          <motion.aside
            initial={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -320 : 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${
              isMobile ? "fixed" : "sticky"
            } sm:w-80 w-80 bg-gray-900/95 backdrop-blur-sm pt-16 px-4 overflow-y-auto h-screen ${
              isMobile ? "left-0 top-8 z-30" : "left-0 top-12 z-10"
            } border-r border-gray-700/50 shadow-2xl pb-8`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">History</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2"
                  onClick={handleClearHistory}
                  title="Clear all history"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white p-2"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8">
                <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No reviews yet</p>
                <p className="text-gray-500 text-xs mt-1">
                  Your code reviews will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ dalay: index * 0.05 }}
                    onClick={() => {
                      setSelectedHistory(item);
                      closeSidebar();
                    }}
                    className={`cursor-pointer p-4 rounded-lg transition-all duration-200 border ${
                      selectedHistory?.timestamp === item.timestamp
                        ? "bg-gray-500/10 border-blue-400/50 shadow-lg shadow-blue-500/20"
                        : "hover:bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-300 bg-blue-500/20 px-2 py-1 rounded-md">
                        {item.language}
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                      ...
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.createdAt &&
                        moment(item.createdAt).format("MMM DD, h:mm A")}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.aside>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-16 flex items-center justify-center mt-16 sticky top-16 left-0 h-screen bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 z-10"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white p-3"
              onClick={() => setIsSidebarOpen(true)}
            >
              <AlignJustify className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={`flex-1 max-w-none p-6 mt-16 transition-all duration-300 ${
          isSidebarOpen && !isMobile ? "ml-4" : "ml-0"
        }`}
      >
        <motion.div
          className=" max-w-7xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome to CodeSage
            </h1>
            <p className="text-gray-400 text-lg">
              Get intelligent code reviews powered by AI{" "}
              <Sparkles className="inline w-5 h-5 text-yellow-400" />
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <CodeInput value={inputCode} onChange={handleCodeInputChange} />

              <div className="flex gap-4 flex-wrap">
                <LanguageSelect
                  language={language}
                  onChange={(value) => dispatch(setLanguage(value))}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !inputCode.trim()}
                  className="min-w-[140px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Reviewing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Review Code
                    </>
                  )}
                </Button>
                {/* <Button
                  variant="outline"
                  onClick={handleClearInputAndResults}
                  className="min-w-[120px] border-gray-600 hover:bg-gray-800"
                >
                  Clear All
                </Button> */}
              </div>
            </div>
            <div className="lg:col-span-1">
              <ReviewResult
                loading={loading}
                reviewedResult={reviewedResult}
                language={language}
                hasCodeInput={!!inputCode.trim()}
                isNewSubmission={isNewSubmission}
              />
            </div>
          </div>

          {selectedHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HistorySection item={selectedHistory} />
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
