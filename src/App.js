import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layout Components
import Layout from './components/layout/Layout';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';

// Main Components
import Dashboard from './components/dashboard/Dashboard';
import ConnectionManager from './components/connections/ConnectionManager';
import AnalyticsHub from './components/analytics/AnalyticsHub';
import WidgetManager from './components/widgets/WidgetManager';
import OAuthCallback from './components/connections/OAuthCallback';

// Platform-specific components
import YouTubeAnalytics from './components/platforms/YouTubeAnalytics';
import FacebookAnalytics from './components/platforms/FacebookAnalytics';
import InstagramAnalytics from './components/platforms/InstagramAnalytics';

function App() {
  const { currentUser, loading } = useAuth();

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="loading-screen">Loading...</div>;
    if (!currentUser) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="connections" element={<ConnectionManager />} />
        <Route path="analytics" element={<AnalyticsHub />} />
        <Route path="analytics/youtube" element={<YouTubeAnalytics />} />
        <Route path="analytics/facebook" element={<FacebookAnalytics />} />
        <Route path="analytics/instagram" element={<InstagramAnalytics />} />
        <Route path="widgets" element={<WidgetManager />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;