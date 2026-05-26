import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import PropertiesPage from './pages/PropertiesPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import CareersPage from './pages/CareersPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx';
import WhyUsPage from './pages/WhyUsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LeadershipPage from './pages/LeadershipPage.jsx';
import InvestorRelationsPage from './pages/InvestorRelationsPage.jsx';
import AdminChatPage from './pages/AdminChatPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import PortalLoginPage from './pages/PortalLoginPage.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ClientLayout from './layouts/ClientLayout.jsx';
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties.jsx'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews.jsx'));
const AdminLeases = lazy(() => import('./pages/admin/AdminLeases.jsx'));
const AdminMaintenance = lazy(() => import('./pages/admin/AdminMaintenance.jsx'));
const AdminCRM = lazy(() => import('./pages/admin/AdminCRM.jsx'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard.jsx'));
const ClientProperties = lazy(() => import('./pages/client/ClientProperties.jsx'));
const ClientMaintenance = lazy(() => import('./pages/client/ClientMaintenance.jsx'));
const ClientDocuments = lazy(() => import('./pages/client/ClientDocuments.jsx'));
const ClientSupport = lazy(() => import('./pages/client/ClientSupport.jsx'));
const ClientProfile = lazy(() => import('./pages/client/ClientProfile.jsx'));

const PortalFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
  </div>
);

const AdminLogin = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setChecking(false); return; }
    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.ok) navigate('/admin/dashboard', { replace: true });
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <svg className="h-8 w-8 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return <AdminLoginPage onLogin={() => navigate('/admin/dashboard', { replace: true })} />;
};

const AdminRoutes = () => <Outlet />;

const AdminChatRoute = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin', { replace: true }); return; }
    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.ok) setAuthed(true);
      else navigate('/admin', { replace: true });
    }).catch(() => navigate('/admin', { replace: true }));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_username');
    navigate('/admin', { replace: true });
  };

  if (!authed) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <svg className="h-8 w-8 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return <AdminChatPage onLogout={handleLogout} />;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="company" element={<AboutPage />} />
              <Route path="leadership" element={<LeadershipPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="properties/:slug" element={<PropertyDetailPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="investors" element={<InvestorRelationsPage />} />
              <Route path="careers" element={<CareersPage />} />
              <Route path="why-us" element={<WhyUsPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>
            <Route path="/client/login" element={<Navigate to="/portal" replace />} />
            <Route path="/portal" element={<PortalLoginPage />} />
            <Route path="/portal/login" element={<Navigate to="/portal" replace />} />
            <Route path="/admin" element={<AdminRoutes />}>
              <Route index element={<AdminLogin />} />
              <Route path="login" element={<Navigate to="/admin" replace />} />
              <Route path="chat" element={<AdminChatRoute />} />
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="leases" element={<AdminLeases />} />
                <Route path="maintenance" element={<AdminMaintenance />} />
                <Route path="crm" element={<AdminCRM />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
            <Route path="/client" element={<ClientLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="properties" element={<ClientProperties />} />
              <Route path="maintenance" element={<ClientMaintenance />} />
              <Route path="documents" element={<ClientDocuments />} />
              <Route path="support" element={<ClientSupport />} />
              <Route path="profile" element={<ClientProfile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
};

export default App;
