import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Hardcoded admin email - must match backend AdminGuard
const ADMIN_EMAIL = 'maindocley@gmail.com';

export function ProtectedRoute({ children }) {
    const { user, loading, isEmailVerified } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the children
    return children;
}

export function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (user) {
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    // If not authenticated, render the children (login/signup pages)
    return children;
}

// Admin-only route - restricts access to specific email
export function AdminOnlyRoute({ children }) {
    const { user, loading } = useAuth();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to dashboard if not the admin email
    if (user.email !== ADMIN_EMAIL) {
        return <Navigate to="/dashboard" replace />;
    }

    // Admin user - render the children
    return children;
}

// Export admin email check helper for use in sidebars
export const isAdminEmail = (email) => email === ADMIN_EMAIL;
export { ADMIN_EMAIL };

