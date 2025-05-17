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
          timestamp: Date.now(),
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

export const fetchCodeHistory = createAsyncThunk(
  "review/fetchCodeHistory",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.userInfo?.token; // Get the token from the auth slice
    if (!token) {
      return rejectWithValue("Authentication required");
    }
    try {
      const response = await axios.get(`${baseURL}/code/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.codeHistory;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch history"
      );
    }
  }
);

export const deleteCodeHistoryByUser = createAsyncThunk(
  "review/deleteCodeHistory",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.userInfo?.token;
    if (!token) return rejectWithValue("Authentication required");

    try {
      await axios.delete(`${baseURL}/code/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Code history deleted.");
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete code history."
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
      })
      .addCase(fetchCodeHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCodeHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchCodeHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch code history.";
      })
      .addCase(deleteCodeHistoryByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCodeHistoryByUser.fulfilled, (state) => {
        state.loading = false;
        state.history = []; // Clear history after deletion
      })
      .addCase(deleteCodeHistoryByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete code history.";
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
