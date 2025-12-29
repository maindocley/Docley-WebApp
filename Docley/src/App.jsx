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
import { Loader2 } from 'lucide-react';

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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <FloatingDocuments />
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:id" element={<BlogPost />} />

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
                <Route path="settings" element={<DashboardSettings />} />
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
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
