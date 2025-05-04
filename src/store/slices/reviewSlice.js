import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const initialState = {
  inputCode: "",
  language: "javascript",
  reviewedResult: "",
  history: [],
  loading: false,
  error: null,
};

export const reviewCode = createAsyncThunk(
  "review/reviewCode",
  async ({ code, language }, { dispatch, getState, rejectWithValue }) => {
    if (!code?.trim()) {
      return rejectWithValue("Please provide code to review.");
    }
    if (!language) {
      return rejectWithValue("Please provide a programming language.");
    }

    const token = getState().auth.userInfo?.token; // Get the token from the auth slice
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
      toast.success("Code reviewed successfully!");
      return {
        result,
        code,
        language,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Review failed"
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    setInputCode: (state, action) => {
      state.inputCode = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    appendReviewChunk: (state, action) => {
      state.reviewedResult += action.payload;
    },
    clearReviewResult: (state) => {
      state.reviewedResult = "";
    },
    clearInputAndResult: (state) => {
      state.inputCode = "";
      state.reviewedResult = "";
    },
    addToHistory: (state, action) => {
      state.history = [action.payload, ...state.history.slice(0, 9)];
    },
    clearHistory: (state) => {
      state.history = [];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearAllData: (state) => {
      state.inputCode = "";
      state.language = "javascript";
      state.reviewedResult = "";
      state.history = [];
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
  clearInputAndResult,
  addToHistory,
  clearHistory,
  setError,
  clearAllData,
} = reviewSlice.actions;
export default reviewSlice.reducer;
