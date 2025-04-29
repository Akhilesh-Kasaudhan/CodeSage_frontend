import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setInputCode,
  setLanguage,
  reviewCode,
  clearAllData,
} from "@/store/slices/reviewSlice";
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

  useEffect(() => {
    if (error) {
      toast.error(error);
      // console.error("Review error:", error);
    }
  }, [error]);

  const handleCodeInputChange = (newValue) => {
    dispatch(setInputCode(newValue)); // Now you receive the string value
  };

  const handleSubmit = () => {
    // console.log("Submit clicked"); // Debug log
    if (!inputCode.trim()) {
      toast.warning("Please enter some code to review");
      return;
    }
    // console.log("Dispatching reviewCode with:", { inputCode, language }); // Debug log
    dispatch(reviewCode({ code: inputCode, language }))
      .unwrap()
      .then(() => {
        toast.success("Code reviewed successfully!");
        // console.log("Review successful"); // Debug log
      })
      .catch((error) => {
        // console.error("Review failed:", error); // Debug log
        toast.error(error.message || "Failed to review code");
      });
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
        </div>

        <ReviewResult
          loading={loading}
          reviewedResult={reviewedResult}
          language={language}
        />

        <HistorySection
          history={history}
          onClearHistory={() => dispatch(clearAllData())}
        />
      </motion.div>
    </div>
  );
}
