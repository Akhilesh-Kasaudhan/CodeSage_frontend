import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store, persistor } from "@/store";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthWrapper } from "./components/AuthWrapper";
import { PersistGate } from "redux-persist/integration/react";
import React, { Suspense, lazy } from "react";
import Loader from "./components/ui/Loader";
const Home = lazy(() => import("@/pages/Home"));
const Auth = lazy(() => import("@/pages/Auth"));
const CodeReviewer = lazy(() => import("@/pages/CodeReviewer"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AuthWrapper>
            <Toaster position="top-right" reverseOrder={false} />
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/code-reviewer"
                  element={
                    <ProtectedRoute>
                      <CodeReviewer />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthWrapper>
        </Router>
      </PersistGate>
    </Provider>
  );
}
