import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import {
    LayoutDashboard,
    FileText,
    Settings,
    Menu,
    X,
    LogOut,
    MessageSquare,
    Shield,
    ChevronDown,
    Zap,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { DocleyLogo } from '../ui/DocleyLogo';
import { OnboardingFlow, isOnboardingCompleted } from '../onboarding/OnboardingFlow';
import { submitFeedback } from '../../services/feedbackService';
import { isAdminEmail } from '../ProtectedRoute';

export function DashboardLayout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { theme } = useTheme();
    const { user, signOut } = useAuth();
    const isDark = theme === 'dark';

    // Check onboarding on mount
    useEffect(() => {
        if (!isOnboardingCompleted()) {
            setShowOnboarding(true);
        }
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Documents', href: '/dashboard/documents', icon: FileText },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        // Conditionally add Admin link
        ...(user && isAdminEmail(user.email) ? [{ name: 'Admin Panel', href: '/admin', icon: Shield }] : []),
    ];

    const isActive = (path) => {
        if (path === '/dashboard' && location.pathname !== '/dashboard') return false;
        return location.pathname.startsWith(path);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            addToast('Successfully signed out', 'success');
            navigate('/login');
        } catch (error) {
            addToast('Failed to sign out', 'error');
        }
    };

    // Get user's display name
    const getUserDisplayName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name.split(' ')[0];
        }
        if (user?.email) {
            return user.email.split('@')[0];
        }
        return 'User';
    };

    // Get user's initials
    const getUserInitials = () => {
        if (user?.user_metadata?.full_name) {
            const names = user.user_metadata.full_name.split(' ');
            if (names.length >= 2) {
                return (names[0][0] + names[1][0]).toUpperCase();
            }
            return names[0][0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
    };

    // Sidebar is collapsed by default, expands on hover
    const isCollapsed = !isHovered;

    return (
        <div className={cn(
            "min-h-screen flex transition-colors duration-300",
            isDark
                ? "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900"
                : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
        )}>
            {/* Onboarding Flow */}
            {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <FeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    isDark={isDark}
                />
            )}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="bg-white shadow-lg border-slate-200"
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Sidebar - Fixed position, auto-collapse with hover expand */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    'fixed inset-y-0 left-0 z-30 flex flex-col shadow-lg transition-all duration-300 ease-in-out backdrop-blur-xl',
                    // Mobile: hidden by default, shown when menu is open
                    isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full',
                    // Desktop: always visible, collapsed by default, expands on hover
                    'lg:translate-x-0',
                    isCollapsed ? 'lg:w-[70px]' : 'lg:w-[260px]',
                    isDark
                        ? 'bg-white/5 border-r border-white/10'
                        : 'bg-white/80 border-r border-slate-200'
                )}
            >
                {/* Logo */}
                <div
                    className={cn(
                        'h-16 flex items-center transition-all duration-300 relative',
                        isCollapsed ? 'justify-center px-0' : 'justify-center px-5',
                        isDark
                            ? 'border-b border-white/10 bg-gradient-to-r from-white/5 to-white/5'
                            : 'border-b border-slate-200 bg-gradient-to-r from-white to-indigo-50/30'
                    )}
                >
                    <Link to="/" className="flex items-center gap-3 overflow-hidden">
                        {isCollapsed ? (
                            <div className="bg-gradient-to-br from-orange-500 to-blue-500 text-white p-2 rounded-lg flex-shrink-0 shadow-lg shadow-orange-500/25">
                                <span className="text-lg font-bold">D</span>
                            </div>
                        ) : (
                            <DocleyLogo size="default" showTagline={true} />
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 mt-2 overflow-x-hidden overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                                'flex items-center py-2.5 rounded-lg transition-all duration-200 group relative min-h-[44px]',
                                isCollapsed ? 'justify-center px-0' : 'px-3',
                                isActive(item.href)
                                    ? isDark
                                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-300 shadow-sm border border-orange-500/30'
                                        : 'bg-gradient-to-r from-orange-50 to-orange-50/50 text-orange-700 shadow-sm border border-orange-100'
                                    : isDark
                                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'h-5 w-5 flex-shrink-0 transition-colors',
                                    isActive(item.href)
                                        ? isDark ? 'text-orange-400' : 'text-orange-600'
                                        : isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600',
                                    !isCollapsed && 'mr-3'
                                )}
                            />
                            {!isCollapsed && (
                                <span className="whitespace-nowrap animate-in fade-in duration-200 text-sm font-medium">
                                    {item.name}
                                </span>
                            )}

                            {/* Hover Tooltip for Collapsed State */}
                            {isCollapsed && (
                                <div className={cn(
                                    "fixed left-[80px] text-xs px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none",
                                    isDark
                                        ? "bg-white/10 backdrop-blur-md border border-white/20 text-white"
                                        : "bg-slate-900 text-white"
                                )}>
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Sidebar */}
                <div className={cn(
                    "p-3 space-y-2 border-t bg-gradient-to-b",
                    isDark
                        ? "border-white/10 from-white/5 to-white/5"
                        : "border-slate-200 from-white to-slate-50/50"
                )}>
                    {/* Send Feedback Button */}
                    <button
                        onClick={() => setShowFeedbackModal(true)}
                        title={isCollapsed ? 'Send Feedback' : undefined}
                        className={cn(
                            'flex items-center w-full py-3 text-base font-medium rounded-lg transition-colors group relative min-h-[52px]',
                            isCollapsed ? 'justify-center px-0' : 'px-4',
                            isDark
                                ? 'text-slate-200 hover:bg-white/10 hover:text-orange-400 bg-white/5'
                                : 'text-slate-700 hover:bg-slate-100/50 hover:text-orange-600 bg-slate-50'
                        )}
                    >
                        <MessageSquare
                            className={cn(
                                'h-5 w-5 transition-colors',
                                isDark ? 'text-slate-300 group-hover:text-orange-400' : 'text-slate-500 group-hover:text-orange-600',
                                !isCollapsed && 'mr-3'
                            )}
                        />
                        {!isCollapsed && <span className="animate-in fade-in duration-200 font-semibold">Send Feedback</span>}
                    </button>

                    {/* Theme Toggle */}
                    <div className={cn(
                        "flex items-center w-full",
                        isCollapsed ? 'justify-center' : 'px-3'
                    )}>
                        {!isCollapsed && (
                            <span className={cn(
                                "text-sm font-medium mr-3",
                                isDark ? "text-slate-300" : "text-slate-600"
                            )}>
                                Theme
                            </span>
                        )}
                        <ThemeToggle className={isCollapsed ? "w-full" : ""} />
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={handleSignOut}
                        title={isCollapsed ? 'Sign Out' : undefined}
                        className={cn(
                            'flex items-center w-full py-2.5 text-sm font-medium rounded-lg transition-colors group relative min-h-[44px]',
                            isCollapsed ? 'justify-center px-0' : 'px-3',
                            isDark
                                ? 'text-slate-300 hover:bg-red-500/20 hover:text-red-400'
                                : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                        )}
                    >
                        <LogOut
                            className={cn(
                                'h-5 w-5 transition-colors',
                                isDark ? 'text-slate-400 group-hover:text-red-400' : 'text-slate-400 group-hover:text-red-600',
                                !isCollapsed && 'mr-3'
                            )}
                        />
                        {!isCollapsed && <span className="animate-in fade-in duration-200">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content - Add left margin/padding to account for fixed sidebar */}
            <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar lg:ml-[70px]">
                {/* Professional Header */}
                <header className={cn(
                    "sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-6 xl:px-8 py-3 md:py-4 backdrop-blur-xl border-b",
                    isDark ? "bg-slate-900/70 border-white/5" : "bg-white/80 border-slate-200"
                )}>
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className={cn(
                            "lg:hidden p-2 rounded-lg border transition-colors",
                            isDark
                                ? "border-white/10 text-slate-200 hover:bg-white/10"
                                : "border-slate-200 text-slate-700 hover:bg-slate-100"
                        )}
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Logo and Title Section */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                            <DocleyLogo size="sm" />
                        </div>
                        <div className="flex-1 min-w-0 md:border-l md:pl-4 lg:pl-6">
                            <p className={cn(
                                "text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5",
                                isDark ? "text-slate-400" : "text-slate-500"
                            )}>
                                Workspace
                            </p>
                            <h1 className={cn(
                                "text-lg md:text-xl lg:text-2xl font-bold leading-tight",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                {location.pathname === '/dashboard' ? 'Dashboard' :
                                 location.pathname.includes('/documents') ? 'My Documents' :
                                 location.pathname.includes('/settings') ? 'Settings' :
                                 'Dashboard'}
                            </h1>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Live Badge */}
                        <div className={cn(
                            "px-3 py-2 rounded-lg border flex items-center gap-2 text-sm font-medium transition-all",
                            isDark
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        )}>
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="hidden lg:inline">Live</span>
                        </div>

                        {/* Usage Indicator (if free tier) */}
                        {user && (
                            <div className={cn(
                                "px-3 py-2 rounded-lg border flex items-center gap-2 text-sm transition-all",
                                isDark
                                    ? "border-white/10 bg-white/5 text-slate-200"
                                    : "border-slate-200 bg-white text-slate-700"
                            )}>
                                <Zap className="h-4 w-4 text-orange-500" />
                                <span className="hidden xl:inline">Active</span>
                            </div>
                        )}

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                                    isDark
                                        ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold",
                                    isDark
                                        ? "bg-gradient-to-br from-orange-500 to-blue-500 text-white"
                                        : "bg-gradient-to-br from-orange-500 to-blue-500 text-white"
                                )}>
                                    {getUserInitials()}
                                </div>
                                <div className="hidden lg:block text-left min-w-0">
                                    <p className={cn(
                                        "text-sm font-medium truncate",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        {getUserDisplayName()}
                                    </p>
                                    <p className={cn(
                                        "text-xs truncate",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        {user?.email}
                                    </p>
                                </div>
                                <ChevronDown className={cn(
                                    "h-4 w-4 transition-transform hidden lg:block",
                                    showUserMenu && "rotate-180",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )} />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className={cn(
                                        "absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border z-50 animate-in fade-in slide-in-from-top-2 duration-200",
                                        isDark
                                            ? "bg-slate-800 border-white/10"
                                            : "bg-white border-slate-200"
                                    )}>
                                        <div className={cn(
                                            "p-4 border-b",
                                            isDark ? "border-white/10" : "border-slate-100"
                                        )}>
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-full flex items-center justify-center text-base font-semibold",
                                                    "bg-gradient-to-br from-orange-500 to-blue-500 text-white"
                                                )}>
                                                    {getUserInitials()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-semibold truncate",
                                                        isDark ? "text-white" : "text-slate-900"
                                                    )}>
                                                        {user?.user_metadata?.full_name || getUserDisplayName()}
                                                    </p>
                                                    <p className={cn(
                                                        "text-xs truncate",
                                                        isDark ? "text-slate-400" : "text-slate-500"
                                                    )}>
                                                        {user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <Link
                                                to="/dashboard/settings"
                                                onClick={() => setShowUserMenu(false)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                                    isDark
                                                        ? "text-slate-300 hover:bg-white/10 hover:text-white"
                                                        : "text-slate-700 hover:bg-slate-50"
                                                )}
                                            >
                                                <Settings className="h-4 w-4" />
                                                <span className="text-sm font-medium">Settings</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    handleSignOut();
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                                    isDark
                                                        ? "text-red-400 hover:bg-red-500/20"
                                                        : "text-red-600 hover:bg-red-50"
                                                )}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span className="text-sm font-medium">Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Right Actions */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold",
                                "bg-gradient-to-br from-orange-500 to-blue-500 text-white"
                            )}
                        >
                            {getUserInitials()}
                        </button>
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className={cn(
                                    "fixed right-4 top-16 w-64 rounded-xl shadow-2xl border z-50 animate-in fade-in slide-in-from-top-2 duration-200",
                                    isDark
                                        ? "bg-slate-800 border-white/10"
                                        : "bg-white border-slate-200"
                                )}>
                                    <div className={cn(
                                        "p-4 border-b",
                                        isDark ? "border-white/10" : "border-slate-100"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-12 w-12 rounded-full flex items-center justify-center text-base font-semibold",
                                                "bg-gradient-to-br from-orange-500 to-blue-500 text-white"
                                            )}>
                                                {getUserInitials()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-semibold truncate",
                                                    isDark ? "text-white" : "text-slate-900"
                                                )}>
                                                    {user?.user_metadata?.full_name || getUserDisplayName()}
                                                </p>
                                                <p className={cn(
                                                    "text-xs truncate",
                                                    isDark ? "text-slate-400" : "text-slate-500"
                                                )}>
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <Link
                                            to="/dashboard/settings"
                                            onClick={() => setShowUserMenu(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                                isDark
                                                    ? "text-slate-300 hover:bg-white/10 hover:text-white"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            )}
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span className="text-sm font-medium">Settings</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                handleSignOut();
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                                isDark
                                                    ? "text-red-400 hover:bg-red-500/20"
                                                    : "text-red-600 hover:bg-red-50"
                                            )}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span className="text-sm font-medium">Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

// Feedback Modal Component
function FeedbackModal({ isOpen, onClose, isDark }) {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) {
            addToast('Please enter your feedback', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            await submitFeedback(rating, feedback);
            addToast('Thank you for your feedback!', 'success');
            setFeedback('');
            setRating(0);
            onClose();
        } catch (error) {
            addToast('Failed to send feedback. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={cn(
                "bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200",
                isDark && "bg-slate-800 border border-white/10"
            )}>
                {/* Header */}
                <div className={cn(
                    "px-6 py-5 border-b flex items-center justify-between",
                    isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-gradient-to-r from-white to-indigo-50/30"
                )}>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className={cn(
                                "text-xl font-bold",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                Send Feedback
                            </h2>
                            <p className={cn(
                                "text-xs",
                                isDark ? "text-slate-400" : "text-slate-500"
                            )}>
                                Help us improve Docley
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            "text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100",
                            isDark && "hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Rating */}
                    <div className="space-y-2">
                        <label className={cn(
                            "text-sm font-semibold",
                            isDark ? "text-slate-300" : "text-slate-700"
                        )}>
                            How would you rate your experience?
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={cn(
                                        "text-2xl transition-all duration-200 hover:scale-110",
                                        rating >= star ? "text-orange-500" : isDark ? "text-slate-600" : "text-slate-300"
                                    )}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Text */}
                    <div className="space-y-2">
                        <label className={cn(
                            "text-sm font-semibold",
                            isDark ? "text-slate-300" : "text-slate-700"
                        )}>
                            Your Feedback
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Tell us what you think, what features you'd like, or report any issues..."
                            rows={6}
                            className={cn(
                                "w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none",
                                isDark
                                    ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
                                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                            )}
                            required
                        />
                    </div>

                    {/* Footer */}
                    <div className={cn(
                        "flex justify-end gap-3 pt-4 border-t",
                        isDark ? "border-white/10" : "border-slate-100"
                    )}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className={isDark ? "text-slate-300 hover:text-white hover:bg-white/10" : ""}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !feedback.trim()}
                            isLoading={isSubmitting}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25"
                        >
                            Send Feedback
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
