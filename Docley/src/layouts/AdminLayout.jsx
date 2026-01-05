import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    MessageSquare,
    Activity,
    Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { DocleyLogo } from '../components/ui/DocleyLogo';
import { NotificationBell } from '../components/ui/NotificationBell';
import { cn } from '../lib/utils';

export function AdminLayout() {
    const { signOut, user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: FileText, label: 'Blog Posts', path: '/admin/blog' },
        { icon: MessageSquare, label: 'View Feedback', path: '/admin/feedback' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className={cn(
            "min-h-screen flex",
            isDark
                ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50"
                : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900"
        )}>
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-72 lg:w-72 transform transition-transform duration-300",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0",
                    isDark
                        ? "bg-slate-900/70 border-r border-white/5 backdrop-blur-xl shadow-2xl shadow-black/30"
                        : "bg-white/80 border-r border-slate-200 backdrop-blur-xl shadow-lg"
                )}
            >
                <div className={cn(
                    "flex items-center justify-between px-5 py-4 border-b",
                    isDark ? "border-white/5" : "border-slate-200"
                )}>
                    <div className="flex items-center gap-3">
                        <DocleyLogo size="sm" iconOnly={true} />
                        <div>
                            <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>Docley Admin</p>
                            <p className={cn("text-xs uppercase tracking-wide", isDark ? "text-slate-400" : "text-slate-500")}>Control Room</p>
                        </div>
                    </div>
                    <button
                        className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/10"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100vh-80px)] px-3 py-4">
                    <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                        <div className={cn(
                            "rounded-2xl p-3 border",
                            isDark ? "border-white/5 bg-white/5" : "border-slate-200 bg-white/70"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                                    {user?.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className={cn("text-sm font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>{user?.email}</p>
                                    <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Administrator</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs">
                                <div className={cn("flex items-center gap-2 px-2 py-1 rounded-full",
                                    isDark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-700"
                                )}>
                                    <Shield className="h-4 w-4 text-orange-500" />
                                    Secure mode
                                </div>
                                <div className={cn("px-2 py-1 rounded-full",
                                    isDark ? "bg-orange-500/20 text-orange-200" : "bg-orange-50 text-orange-600"
                                )}>
                                    Live
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/admin'}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) => cn(
                                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                        isActive
                                            ? isDark
                                                ? "bg-gradient-to-r from-orange-500/20 to-blue-500/10 text-white border border-white/10 shadow-lg shadow-orange-500/20"
                                                : "bg-gradient-to-r from-orange-50 to-blue-50 text-slate-900 border border-orange-100 shadow-sm"
                                            : isDark
                                                ? "text-slate-300 hover:text-white hover:bg-white/5"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", isDark ? "text-slate-400 group-hover:text-white" : "text-slate-400 group-hover:text-slate-900")} />
                                    <span className="flex-1">{item.label}</span>
                                    {item.path === '/admin' && (
                                        <span className={cn(
                                            "text-[11px] px-2 py-0.5 rounded-full",
                                            isDark ? "bg-orange-500/20 text-orange-100" : "bg-orange-100 text-orange-700"
                                        )}>
                                            Overview
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Quick Stats Widget */}
                        <div className={cn(
                            "rounded-2xl p-4 border mt-4",
                            isDark ? "border-white/5 bg-gradient-to-br from-orange-500/10 to-blue-500/10" : "border-slate-200 bg-gradient-to-br from-orange-50 to-blue-50"
                        )}>
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className={cn("h-4 w-4", isDark ? "text-orange-400" : "text-orange-600")} />
                                <p className={cn("text-xs font-semibold uppercase tracking-wide", isDark ? "text-orange-200" : "text-orange-700")}>
                                    Quick Stats
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className={cn("text-xs", isDark ? "text-slate-300" : "text-slate-600")}>System Status</span>
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span className={cn("text-xs font-medium", isDark ? "text-emerald-300" : "text-emerald-600")}>Healthy</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={cn("text-xs", isDark ? "text-slate-300" : "text-slate-600")}>API Status</span>
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                                        <span className={cn("text-xs font-medium", isDark ? "text-blue-300" : "text-blue-600")}>Online</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={cn("text-xs", isDark ? "text-slate-300" : "text-slate-600")}>Uptime</span>
                                    <span className={cn("text-xs font-medium", isDark ? "text-slate-200" : "text-slate-700")}>99.9%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom section - Sign Out */}
                    <div className="mt-auto pt-4 space-y-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)' }}>
                        <button
                            onClick={handleSignOut}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                                isDark
                                    ? "bg-red-500/10 text-red-200 hover:bg-red-500/20"
                                    : "bg-red-50 text-red-600 hover:bg-red-100"
                            )}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
                {/* Top Bar */}
                <header className={cn(
                    "sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-8 py-4 backdrop-blur-xl border-b",
                    isDark ? "bg-slate-900/70 border-white/5" : "bg-white/80 border-slate-200"
                )}>
                    <button
                        className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3 flex-1 min-w-0">

                        <div className="hidden sm:block min-w-0">
                            <p className={cn("text-sm font-semibold uppercase tracking-wide", isDark ? "text-slate-300" : "text-slate-500")}>Admin Console</p>
                            <h1 className={cn("text-xl font-bold truncate", isDark ? "text-white" : "text-slate-900")}>Governance & Insights</h1>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-[2] max-w-xl mx-4">
                        <div className="relative w-full group">
                            <div className={cn(
                                "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors",
                                isDark ? "text-slate-500 group-focus-within:text-orange-400" : "text-slate-400 group-focus-within:text-orange-500"
                            )}>
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search admin console..."
                                className={cn(
                                    "block w-full pl-10 pr-3 py-2 text-sm rounded-xl border transition-all duration-200 outline-none",
                                    isDark
                                        ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:bg-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10"
                                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm"
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
