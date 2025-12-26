import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import BlogList from './pages/Blog/BlogList';
import BlogPost from './pages/Blog/BlogPost';
import { DashboardLayout } from './components/layout/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import DashboardDocuments from './pages/Dashboard/DashboardDocuments';
import DashboardSettings from './pages/Dashboard/DashboardSettings';
import { AdminLayout } from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import BlogManager from './pages/Admin/BlogManager';
import BlogPostEditor from './pages/Admin/BlogPostEditor';
import UsersManager from './pages/Admin/UsersManager';
import AdminSettings from './pages/Admin/AdminSettings';
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

              {/* Admin Routes - Restricted to admin email only */}
              <Route path="/admin" element={
                <AdminOnlyRoute>
                  <AdminLayout />
                </AdminOnlyRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersManager />} />
                <Route path="blog" element={<BlogManager />} />
                <Route path="blog/new" element={<BlogPostEditor />} />
                <Route path="blog/edit/:id" element={<BlogPostEditor />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
