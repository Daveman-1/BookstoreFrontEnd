import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// No Zustand import

// Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddItem from "./pages/AddItem";
import ViewItems from "./pages/ViewItems";
import LowStock from "./pages/LowStock";

import SalesHistory from "./pages/SalesHistory";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";

import Approvals from "./pages/Approvals";
import BookstoreSettings from "./pages/BookstoreSettings";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";

function getAuthUser() {
  try {
    return JSON.parse(sessionStorage.getItem('authUser'));
  } catch {
    return null;
  }
}
function isAuthenticated() {
  return !!sessionStorage.getItem('authToken');
}

function hasPermission(permission) {
  const user = getAuthUser();
  return user && (user.role === 'admin' || (user.permissions && user.permissions.includes(permission)));
}

const PermissionRoute = ({ children, permission }) => {
  if (!hasPermission(permission)) {
    return <Navigate to="/not-found" replace />;
  }
  return children;
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const user = getAuthUser();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Default redirect based on user role
  const user = getAuthUser();
  const location = useLocation();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <Dashboard />
              </main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/view-items" element={
        <ProtectedRoute>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <ViewItems />
              </main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/add-item" element={
        <ProtectedRoute>
          <PermissionRoute permission="manage_inventory">
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                  <AddItem />
                </main>
              </div>
            </div>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      <Route path="/categories" element={
        <ProtectedRoute>
          <PermissionRoute permission="manage_inventory">
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <Categories />
              </main>
            </div>
          </div>
        </PermissionRoute>
      </ProtectedRoute>
    } />
      <Route path="/low-stock" element={
        <ProtectedRoute>
          <PermissionRoute permission="view_inventory">
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                  <LowStock />
                </main>
              </div>
            </div>
          </PermissionRoute>
        </ProtectedRoute>
      } />

      <Route path="/sales-history" element={
        <ProtectedRoute>
          <PermissionRoute permission="view_sales_history">
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <SalesHistory />
              </main>
            </div>
          </div>
        </PermissionRoute>
      </ProtectedRoute>
    } />
      <Route path="/approvals" element={
        <ProtectedRoute>
          <PermissionRoute permission="approve_uploads">
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                  <Approvals />
                </main>
              </div>
            </div>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <Profile />
              </main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <PermissionRoute permission="manage_system">
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                  <BookstoreSettings />
                </main>
              </div>
            </div>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      <Route path="/user-management" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={["admin"]}>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                  <UserManagement />
                </main>
              </div>
            </div>
          </RoleRoute>
        </ProtectedRoute>
      } />
      {/* Default route: redirect to dashboard if authenticated, else to login */}
      <Route path="/" element={
        isAuthenticated() ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
