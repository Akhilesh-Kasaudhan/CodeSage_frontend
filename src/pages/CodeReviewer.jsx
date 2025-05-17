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

import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function CodeReviewer() {
  const dispatch = useDispatch();
  const { inputCode, language, reviewedResult, loading, history, error } =
    useSelector((state) => state.review);

  const [isNewSubmission, setIsNewSubmission] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

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
      <aside className="w-64 bg-gray-900 pt-6 p-4 overflow-y-auto h-screen sticky left-0 top-16 mt-12  border-r border-gray-700 shadow-lg z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📜 History</h2>

          <Button variant="destructive" size="sm" onClick={handleClearHistory}>
            Clear
          </Button>
        </div>
        {history.length === 0 ? (
          <p className="text-gray-400 text-sm">No history yet</p>
        ) : (
          <ul className="space-y-3">
            {history.map((item, index) => (
              <li
                key={index}
                onClick={() => setSelectedHistory(item)}
                className={`cursor-pointer p-3 rounded-lg ${
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
                      {moment(item.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="flex-1 p-6 max-w-5xl mx-auto mt-12">
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

          <CodeInput
            value={inputCode} // Pass the value from Redux state
            onChange={handleCodeInputChange} // Pass the new handler
          />

          <div className="flex gap-4 flex-wrap">
            <LanguageSelect
              language={language}
              onChange={(value) => dispatch(setLanguage(value))}
            />
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
              data-testid="submit-button" // For testing
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
