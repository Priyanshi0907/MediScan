import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Analysis from "./pages/dashboard/Analysis";
import History from "./pages/dashboard/History";
import DiseaseLibrary from "./pages/dashboard/DiseaseLibrary";
import DiseaseDetail from "./pages/dashboard/DiseaseDetail";
import HealthInsights from "./pages/dashboard/HealthInsights";
import Settings from "./pages/dashboard/Settings";
import Profile from "./pages/dashboard/Profile";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Analysis />} />
          <Route path="history" element={<History />} />
          <Route path="library" element={<DiseaseLibrary />} />
          <Route path="library/:slug" element={<DiseaseDetail />} />
          <Route path="insights" element={<HealthInsights />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />

          {/* Legacy redirects */}
          <Route path="reports" element={<Navigate to="/dashboard/history" replace />} />
          <Route path="patients" element={<Navigate to="/dashboard/profile" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
