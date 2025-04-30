import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"; // Use environment variable for base URL

// const baseURL = "http://localhost:3000/api"; // Fallback for local development
// const baseURL = "https://code-reviewer-backend.onrender.com/api"; // Fallback for production

// Helper function to safely parse localStorage
const loadUserInfo = () => {
  try {
    const data = localStorage.getItem("userInfo");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

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
  userInfo: loadUserInfo(),
  loading: false,
  error: null,
  isAuthenticated: !!loadUserInfo()?.token, // Properly check for token existence
};

export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Registering user with data:", userData);
      const response = await axios.post(`${baseURL}/auth/register`, userData);
      console.log("Registration response:", response);
      if (response.status !== 201) {
        // throw new Error(`Registration failed with status: ${response.status}`);
        toast.error("Registration failed: No token received");
        console.log("Registration failed: No token received");
      }
      return response.data;
    } catch (err) {
      console.error("Error during registration:", err);
      toast.error(
        err?.response?.data?.message || "Registration failed: No token received"
      );
      return rejectWithValue(
        err?.response?.data?.message || "Registration Failed"
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
        throw new Error("Login failed");
        console.log("Login failed: No token received");
      }

      console.log("Login response:", response);

      // Ensure we're getting the token in the response
      if (!response.data.token) {
        toast.error("Login failed: No token received");
        throw new Error("Login failed: No token received");
      }
      // Save the token to local storage for future requests
      localStorage.setItem("userInfo", JSON.stringify(response.data));

      return response.data;
      console.log("Login successful:", response.data);
    } catch (err) {
      console.error("Error during login:", err);
      toast.error(
        err?.response?.data?.message || "Login failed: No token received"
      );
      return rejectWithValue(err.response.data.message || "Login Failed");
    }
  }
);

export const verifyAuth = createAsyncThunk(
  "user/verifyAuth",
  async (_, { rejectWithValue }) => {
    try {
      const userInfo = loadUserInfo();

      if (!userInfo?.token) {
        console.log("No token found in local storage");
        toast.error("No token found in local storage");
        throw new Error("No token found");
      }

      // Optional: Verify token is not expired
      if (isTokenExpired(userInfo.token)) {
        console.log("Token expired");
        toast.error("Token expired");
        throw new Error("Token expired");
      }

      return userInfo;
    } catch (error) {
      console.error("Error during token verification:", error);
      localStorage.removeItem("userInfo"); // Clear local storage on error
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
      state.isAuthenticated = false; // Update the flag on logout
      localStorage.removeItem("userInfo");
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
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
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
        state.isAuthenticated = true; // Set authenticated flag to true
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
        state.isAuthenticated = true; // Set authenticated flag to true
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.isAuthenticated = false; // Set authenticated flag to false
        state.userInfo = null; // Clear user info on verification failure
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
