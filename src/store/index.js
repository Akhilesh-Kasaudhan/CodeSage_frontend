import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { combineReducers } from "@reduxjs/toolkit";
import reviewReducer from "./slices/reviewSlice.js";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "review"], // Only persist the auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  review: reviewReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist uses non-serializable values
    }),
});

export const persistor = persistStore(store);
