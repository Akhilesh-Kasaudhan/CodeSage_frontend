import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setInputCode,
  setLanguage,
  reviewCode,
  clearAllData,
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
import { AlignJustify } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function CodeReviewer() {
  const dispatch = useDispatch();
  const { inputCode, language, reviewedResult, loading, history, error } =
    useSelector((state) => state.review);

  const [isNewSubmission, setIsNewSubmission] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  return (
    <div className="bg-gray-700 relative min-h-screen text-white flex">
      <Navbar />
      {/* Sidebar */}
      {isSidebarOpen ? (
        <aside className="sm:w-80 w-full bg-gray-900 pt-6 px-4 overflow-y-auto h-screen fixed left-0 top-4 mt-12  border-r border-gray-700 shadow-lg z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="flex items-center justify-between sm:justify-start sm:gap-4 mb-6">
              <h2 className="text-xl font-semibold text-white">History</h2>

              <Button
                variant="destructive"
                size="sm"
                className="w-fit sm:w-auto"
                onClick={handleClearHistory}
              >
                Clear
              </Button>
              <AlignJustify
                className="text-gray-400 hover:text-white cursor-pointer  sm:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            </div>
          </div>
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">No history yet</p>
          ) : (
            <ul className="space-y-3">
              {history.map((item, index) => (
                <li
                  key={index}
                  onClick={() => setSelectedHistory(item)}
                  className={`cursor-pointer p-3 rounded-lg transition-colors duration-200 ${
                    selectedHistory?.timestamp === item.timestamp
                      ? "bg-gray-700 border border-blue-400"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-300">
                    {item.language}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.createdAt && (
                      <span>
                        {moment(item.createdAt).format(
                          "MMMM Do YYYY, h:mm:ss a"
                        )}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      ) : (
        <div className="w-16 flex items-center justify-center mt-12 sticky top-16 left-0 h-screen bg-gray-900 border-r border-gray-700 z-10">
          <AlignJustify
            className="text-gray-400 hover:text-white cursor-pointer"
            onClick={() => setIsSidebarOpen(true)}
          />
        </div>
      )}

      <main
        className={`flex-1 p-6 mt-12 transition-all duration-300 ${
          isSidebarOpen ? "ml-0 sm:ml-80" : "ml-0"
        }`}
      >
        <motion.div
          className=" space-y-8 "
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-center">
            Welcome to CodeSage! ✨
          </h1>

          <CodeInput value={inputCode} onChange={handleCodeInputChange} />

          <div className="flex gap-4 flex-wrap">
            <LanguageSelect
              language={language}
              onChange={(value) => dispatch(setLanguage(value))}
            />
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? "Reviewing..." : "Submit"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearInputAndResults}
              className="min-w-[120px] bg-gray-400"
            >
              Clear Input
            </Button>
          </div>

          <ReviewResult
            loading={loading}
            reviewedResult={reviewedResult}
            language={language}
            hasCodeInput={!!inputCode.trim()}
            isNewSubmission={isNewSubmission}
          />

          {selectedHistory && <HistorySection item={selectedHistory} />}
        </motion.div>
      </main>
    </div>
  );
}
