import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loadReviewedResult,
  loadInputCode,
  loadLanguage,
  saveReviewedResult,
  saveInputCode,
  saveLanguage,
  clearReviewedResult,
  clearAllReviewData,
  clearInputCode,
  clearLanguage,
} from "../../lib/utils.js";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
// Helper function to get auth token
const getAuthToken = () => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo).token : null;
};

// Load history from localStorage
const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem("codeReviewHistory")) || [];
  } catch (error) {
    console.error("Failed to parse history", error);
    return [];
  }
};
export const reviewCode = createAsyncThunk(
  "review/reviewCode",
  async (
    { code, language }, // Set the token in headers
    { dispatch, rejectWithValue }
  ) => {
    if (!code?.trim()) {
      return rejectWithValue("Please provide code to review.");
    }
    if (!language) {
      return rejectWithValue("Please provide a programming language.");
    }

    const token = getAuthToken();
    if (!token) {
      return rejectWithValue("Authentication required");
    }
    try {
      dispatch(clearReviewResult());

      const response = await axios.post(
        `${baseURL}/code/submit`,
        { code, language },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // responseType: "stream", // you still want stream
        }
      );
      const result = response.data?.result || response.data;
      dispatch(appendReviewChunk(result));
      dispatch(
        addToHistory({
          inputCode: code,
          language,
          reviewedResult: result,
          timestamp: new Date().toISOString(),
        })
      );
      return result;
    } catch (err) {
      console.error("API Error:", err);
      return rejectWithValue(
        err.response?.data?.message || err.message || "Review failed"
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState: {
    inputCode: loadInputCode(), // Load inputCode from localStorage
    language: loadLanguage(), // Load language from localStorage
    reviewedResult: loadReviewedResult(), // Load reviewedResult from localStorage
    history: loadHistory(), // Load history from localStorage
    loading: false,
    error: null,
  },
  reducers: {
    setInputCode: (state, action) => {
      state.inputCode = action.payload;
      saveInputCode(state.inputCode); // Save inputCode to localStorage
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      saveLanguage(state.language); // Save language to localStorage
    },
    appendReviewChunk: (state, action) => {
      state.reviewedResult += action.payload;
      saveReviewedResult(state.reviewedResult); // Save reviewedResult to localStorage
    },
    clearReviewResult: (state) => {
      state.reviewedResult = "";
      clearReviewedResult(); // Clear reviewedResult from localStorage
    },
    addToHistory: (state, action) => {
      state.history = [action.payload, ...state.history.slice(0, 9)];
      localStorage.setItem("codeReviewHistory", JSON.stringify(state.history));
    },
    clearHistory: (state) => {
      state.history = [];
      localStorage.removeItem("codeReviewHistory"); // Clear localStorage
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearAllData: (state) => {
      state.inputCode = "";
      state.language = "javascript";
      state.reviewedResult = "";
      state.history = [];
      clearAllReviewData();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(reviewCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reviewCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(reviewCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong.";
      });
  },
});

export const {
  setInputCode,
  setLanguage,
  appendReviewChunk,
  clearReviewResult,
  addToHistory,
  clearHistory,
  setError,
  clearAllData,
} = reviewSlice.actions;
export default reviewSlice.reducer;
