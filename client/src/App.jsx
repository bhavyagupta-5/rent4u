import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import DashboardLayout from './layouts/DashboardLayout';

import PrivateRoute from './components/Common/PrivateRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TenantDashboard from './pages/TenantDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BrowseListings from './pages/BrowseListings';
import ListingDetails from './pages/ListingDetails';
import CreateListing from './pages/CreateListing';
import ChatPage from './pages/ChatPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Wishlist from './pages/Wishlist';
import Applications from './pages/Applications';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            
            {}
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

            <Routes>
              {}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {}
              <Route element={<PrivateRoute allowedRoles={['Tenant', 'Owner', 'Admin']} />}>
                <Route element={<DashboardLayout />}>
                  
                  {}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/chats" element={<ChatPage />} />

                  {}
                  <Route element={<PrivateRoute allowedRoles={['Tenant']} />}>
                    <Route path="/tenant" element={<TenantDashboard />} />
                    <Route path="/browse" element={<BrowseListings />} />
                    <Route path="/listings/:id" element={<ListingDetails />} />
                    
                    {}
                    <Route path="/tenant/wishlist" element={<Wishlist />} /> 
                    <Route path="/tenant/interests" element={<Applications />} /> 
                  </Route>

                  {}
                  <Route element={<PrivateRoute allowedRoles={['Owner']} />}>
                    <Route path="/owner" element={<OwnerDashboard />} />
                    <Route path="/owner/create-listing" element={<CreateListing />} />
                    <Route path="/owner/listings" element={<OwnerDashboard />} />
                    <Route path="/owner/interests" element={<OwnerDashboard />} />
                    <Route path="/owner/edit-listing/:id" element={<CreateListing />} />
                  </Route>

                  {}
                  <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminDashboard />} />
                    <Route path="/admin/listings" element={<AdminDashboard />} />
                    <Route path="/admin/logs" element={<AdminDashboard />} />
                  </Route>

                </Route>
              </Route>

              {}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>

          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
