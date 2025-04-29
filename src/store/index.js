import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import reviewReducer from "./slices/reviewSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    review: reviewReducer,
  },
});
