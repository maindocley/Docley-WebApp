import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. Boot loading
    if (loading) {
        return <AuthLoadingScreen />;
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

    // 1. Boot loading
    if (loading) {
        return <AuthLoadingScreen />;
    }

    // Redirect to dashboard if already authenticated
    if (user) {
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    // If not authenticated, render the children (login/signup pages)
    return children;
}

// Admin-only route - restricts access to specific database role
export function AdminOnlyRoute({ children }) {
    const { user, profile, isInitializing } = useAuth();

    // 1. Initial boot loading
    if (isInitializing) {
        return <AuthLoadingScreen />;
    }

    // 2. Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Strict admin check (database role)
    if (profile?.role !== 'admin') {
        console.warn('[Security] Access denied: Required Admin role');
        return <Navigate to="/dashboard" replace />;
    }

    // 4. Admin verified
    return children;
}

// Helper component for loading state
function AuthLoadingScreen() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Verifying access...</p>
            </div>
        </div>
    );
}
