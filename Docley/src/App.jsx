import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import BlogList from './pages/Blog/BlogList';
import BlogPost from './pages/Blog/BlogPost';
import { DashboardLayout } from './components/layout/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import DashboardDocuments from './pages/Dashboard/DashboardDocuments';
import DashboardSettings from './pages/Dashboard/DashboardSettings';
import Billing from './pages/Dashboard/Billing';
const TimetableGenerator = lazy(() => import('./pages/Dashboard/TimetableGenerator/TimetableGenerator'));
import EditorPage from './pages/Editor/EditorPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AuthCallback from './pages/Auth/AuthCallback';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, PublicRoute, AdminOnlyRoute } from './components/ProtectedRoute';
import { FloatingDocuments } from './components/ui/FloatingDocuments';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';
import { Loader2 } from 'lucide-react';
import MaintenancePage from './pages/MaintenancePage';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import apiClient from './api/client';

// Lazy-loaded Admin components (code splitting)
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const BlogManager = lazy(() => import('./pages/Admin/BlogManager'));
const BlogPostEditor = lazy(() => import('./pages/Admin/BlogPostEditor'));
const UsersManager = lazy(() => import('./pages/Admin/UsersManager'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));
const FeedbackManager = lazy(() => import('./pages/Admin/FeedbackManager'));

// Loading fallback for lazy-loaded components
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
        <p className="mt-4 text-slate-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Maintenance Guard Component
function MaintenanceGuard({ children }) {
  // 1. All hooks at the VERY top
  const { isInitializing, isAdmin, serverError } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [connectivityError, setConnectivityError] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await apiClient.get('/maintenance');
        setIsMaintenance(response.data.maintenance_active);
        setConnectivityError(false);
      } catch (err) {
        console.error('Error checking maintenance mode:', err);
        // Only show connectivity error for actual network failures or 500s
        // (401 is handled by client.js interceptor)
        if (!err.response || err.response.status >= 500) {
          setConnectivityError(true);
        }
      } finally {
        setIsSettingsLoading(false);
      }
    };

    checkMaintenance();

    // Re-check every 5 minutes if not in real-time
    const interval = setInterval(checkMaintenance, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. No early returns before the hooks above

  // Show a simple skeleton while initializing (covers both auth and settings)
  if (isInitializing || isSettingsLoading) {
    if (serverError || connectivityError) {
      return <ServerUnreachableOverlay />;
    }
    return <InitializingSkeleton />;
  }

  // Final catch for connectivity error even after initialization
  if (connectivityError && !isAdmin) {
    return <ServerUnreachableOverlay />;
  }

  // If maintenance is on and user is not admin, show maintenance page
  if (isMaintenance && !isAdmin) {
    return <MaintenancePage />;
  }

  return children;
}

// Minimal initialization screen
function InitializingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-xs space-y-4 px-4">
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
        </div>
        <p className="text-center text-slate-400 text-xs font-medium uppercase tracking-widest">Docley is Preparing...</p>
      </div>
    </div>
  );
}

// Server Unreachable Overlay
function ServerUnreachableOverlay() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl border-2 border-orange-500 max-w-md text-center">
        <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-8 w-8 text-orange-600 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">Server Unreachable</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
          We're having trouble connecting to the Docley engine. This usually happens during a quick update or if your connection is unstable.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-lg transform transition-all active:scale-[0.98] hover:scale-[1.02]"
        >
          Check Connectivity
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <FloatingDocuments />
          <PWAInstallPrompt delaySeconds={30} />
          <MaintenanceGuard>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogPost />} />

                {/* Maintenance Page Route (for testing/direct access) */}
                <Route path="/maintenance" element={<MaintenancePage />} />

                {/* Auth Routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/signup" element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                } />
                <Route path="/forgot-password" element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                } />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Protected Editor Route - Standalone without sidebar */}
                <Route path="/dashboard/editor/:id" element={
                  <ProtectedRoute>
                    <EditorPage />
                  </ProtectedRoute>
                } />

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<DashboardHome />} />
                  <Route path="documents" element={<DashboardDocuments />} />
                  <Route path="timetable" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <TimetableGenerator />
                    </Suspense>
                  } />
                  <Route path="settings" element={<DashboardSettings />} />
                  <Route path="settings/billing" element={<Billing />} />
                </Route>

                {/* Admin Routes - Lazy loaded, restricted to admin email only */}
                <Route path="/admin" element={
                  <AdminOnlyRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminLayout />
                    </Suspense>
                  </AdminOnlyRoute>
                }>
                  <Route index element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="users" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <UsersManager />
                    </Suspense>
                  } />
                  <Route path="blog" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <BlogManager />
                    </Suspense>
                  } />
                  <Route path="blog/new" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <BlogPostEditor />
                    </Suspense>
                  } />
                  <Route path="blog/edit/:id" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <BlogPostEditor />
                    </Suspense>
                  } />
                  <Route path="feedback" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <FeedbackManager />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminSettings />
                    </Suspense>
                  } />
                </Route>
              </Routes>
            </Router>
          </MaintenanceGuard>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
