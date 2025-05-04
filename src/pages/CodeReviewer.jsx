import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setInputCode,
  setLanguage,
  reviewCode,
  clearAllData,
  clearReviewResult,
  clearInputAndResult,
  deleteCodeHistoryByUser,
} from "@/store/slices/reviewSlice.js";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CodeInput from "@/components/CodeInput";
import LanguageSelect from "@/components/LanguageSelect";
import ReviewResult from "@/components/ReviewResult";
import HistorySection from "@/components/HistorySection";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function CodeReviewer() {
  const dispatch = useDispatch();
  const { inputCode, language, reviewedResult, loading, history, error } =
    useSelector((state) => state.review);

  const [isNewSubmission, setIsNewSubmission] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCodeInputChange = (newValue) => {
    dispatch(setInputCode(newValue));
    if (newValue && reviewedResult) {
      dispatch(clearReviewResult());
    } // Now you receive the string value
  };

  const handleSubmit = () => {
    if (!inputCode.trim()) {
      toast.warning("Please enter some code to review");
      return;
    }
    setIsNewSubmission(true);
    dispatch(reviewCode({ code: inputCode, language }))
      .unwrap()
      .then(() => {
        toast.success("Code reviewed successfully!");
      })
      .catch((error) => {
        toast.error(error.message || "Failed to review code");
      })
      .finally(() => {
        setIsNewSubmission(false);
      });
  };

  const handleClearInputAndResults = () => {
    dispatch(clearInputAndResult());
  };

  return (
    <div className="bg-gray-700 min-h-screen text-white">
      <Navbar />
      <motion.div
        className="max-w-5xl mx-auto p-6 space-y-8 "
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

        <div className="flex gap-4">
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

        <HistorySection
          history={history}
          onClearHistory={() => {
            if (history.length === 0) {
              toast.info("No history to clear");
              return;
            }
            if (window.confirm("Are you sure you want to clear all history?")) {
              dispatch(deleteCodeHistoryByUser());
              toast.success("History cleared successfully!");
            }
          }}
        />
      </motion.div>
    </div>
  );
}
