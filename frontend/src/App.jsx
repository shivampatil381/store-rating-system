import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStores from "./pages/admin/AdminStores";
import AdminCreate from "./pages/admin/AdminCreate";

import UserDashboard from "./pages/user/UserDashboard";
import UserStores from "./pages/user/UserStores";
import UserRating from "./pages/user/UserRating";
import UserPassword from "./pages/user/UserPassword";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerRatings from "./pages/owner/OwnerRatings";
import OwnerPassword from "./pages/owner/OwnerPassword";

import Unauthorized from "./pages/Unauthorized";

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

          <Route
            path="/admin/create"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminCreate />
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
            path="/user/stores"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <UserStores />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/rate/:storeId"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <UserRating />
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
            path="/owner/ratings"
            element={
              <ProtectedRoute allowedRoles={["OWNER"]}>
                <OwnerRatings />
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
