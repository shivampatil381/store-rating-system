import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStores from "./pages/admin/AdminStores";

import UserDashboard from "./pages/user/UserDashboard";
import UserPassword from "./pages/user/UserPassword";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerPassword from "./pages/owner/OwnerPassword";

import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminStores />
              </ProtectedRoute>
            }
          />

          {/* User */}

          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/password"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <UserPassword />
              </ProtectedRoute>
            }
          />

          {/* Owner */}

          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={["OWNER"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/password"
            element={
              <ProtectedRoute allowedRoles={["OWNER"]}>
                <OwnerPassword />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Other routes */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
