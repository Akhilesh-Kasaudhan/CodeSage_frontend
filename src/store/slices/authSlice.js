import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"; // Use environment variable for base URL

// Token expiration check helper
const isTokenExpired = (token) => {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

const initialState = {
  userInfo: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/auth/register`, userData);

      toast.success("Registration & login successful!");
      return data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
      return rejectWithValue(
        err?.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/auth/login`, userData);
      if (response.status !== 200) {
        toast.error("Login failed: Invalid credentials");
        throw new Error("Login failed");
      }

      if (!response.data.token) {
        toast.error("Login failed: No token received");
        throw new Error(" No token received");
      }
      toast.success("Login successful!");
      return response.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
      return rejectWithValue(err.response.data.message || "Login Failed");
    }
  }
);

export const verifyAuth = createAsyncThunk(
  "user/verifyAuth",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;

      if (!userInfo?.token) {
        toast.error("No token found ");
        throw new Error("No token found");
      }

      if (isTokenExpired(userInfo.token)) {
        toast.error("Token expired");
        throw new Error("Token expired");
      }

      return userInfo;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Token verification failed"
      );
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout(state) {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyAuth.pending, (state) => {
        state.loading = true; // Set loading state
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
