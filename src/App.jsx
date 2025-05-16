import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store, persistor } from "@/store";
import Auth from "@/pages/Auth";
import CodeReviewer from "@/pages/CodeReviewer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthWrapper } from "./components/AuthWrapper";
import NotFound from "./pages/NotFound";
import { PersistGate } from "redux-persist/integration/react";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AuthWrapper>
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
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
          </AuthWrapper>
        </Router>
      </PersistGate>
    </Provider>
  );
}
