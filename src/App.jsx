import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { SidebarProvider } from './SidebarContext';
import Layout from './Layout';
import ProtectedRoute from './ProtectedRoute';
import ErrorBoundary from './ErrorBoundary';
import Dashboard from './Dashboard';
import Signup from './Signup';
import Login from './Login';
import Profile from './Profile';
import Medications from './Medications';
import Appointments from './Appointments';
import NotificationCenter from './NotificationCenter';
import HealthAnalytics from './HealthAnalytics';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';
import PrescriptionManager from './PrescriptionManager';
import VideoConsultation from './VideoConsultation';
import MedicationRefill from './MedicationRefill';
import HospitalManagement from './HospitalManagement';
import PharmacistDashboard from './PharmacistDashboard';
import Shop from './Shop';
import Cart from './Cart';
import OrderTracking from './OrderTracking';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <Router>
            <Layout>
              <ErrorBoundary>
                <Routes>
            {/* Root route - Login page */}
            <Route path="/" element={<Login />} />
            {/* Auth Routes - Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Protected Routes - Only accessible after login */}
            <Route
              path="/dashboard/*"
              element={<ProtectedRoute allowedRoles={["User", "Caretaker"]} element={<Dashboard />} />}
            />
            <Route
              path="/shop"
              element={<ProtectedRoute allowedRoles={["User", "Caretaker"]} element={<Shop />} />}
            />
            <Route
              path="/cart"
              element={<ProtectedRoute allowedRoles={["User", "Caretaker"]} element={<Cart />} />}
            />
            <Route
              path="/order-history"
              element={<ProtectedRoute allowedRoles={["User", "Caretaker"]} element={<Navigate to="/dashboard/orders" replace />} />}
            />
            <Route
              path="/order-tracking/:orderId"
              element={<ProtectedRoute allowedRoles={["User", "Caretaker"]} element={<OrderTracking />} />}
            />
            <Route
              path="/doctor-dashboard"
              element={<ProtectedRoute allowedRoles={["Doctor"]} element={<DoctorDashboard />} />}
            />
            <Route
              path="/admin-dashboard"
              element={<ProtectedRoute allowedRoles={["Admin"]} element={<AdminDashboard />} />}
            />
            <Route
              path="/pharmacist-dashboard"
              element={<ProtectedRoute allowedRoles={["Pharmacist"]} element={<PharmacistDashboard />} />}
            />

                </Routes>
              </ErrorBoundary>
            </Layout>
          </Router>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;