import { useCallback, useEffect, useState } from 'react';
import {
    Activity,
    Eye,
    FileText,
    KeyRound,
    Loader2,
    RefreshCw,
    Search,
    TrendingUp,
    UserX,
    Zap,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { getAdminUsers, getDashboardStats, updateUserStatus, getAdminActivity } from '../../services/adminService';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';;

// Mock data for charts
const mockSparkline = [
    { v: 40 }, { v: 55 }, { v: 48 }, { v: 62 }, { v: 58 }, { v: 70 }, { v: 85 },
];

const mockEvents = [
    { id: 1, type: 'success', message: 'New user signed up', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'High plagiarism detected in Doc #402', time: '8 min ago' },
    { id: 3, type: 'error', message: 'Payment failed for user', time: '15 min ago' },
    { id: 4, type: 'success', message: 'Pro subscription activated', time: '22 min ago' },
];

export default function AdminDashboard() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [stats, setStats] = useState({ users: 0, documents: 0, aiTokens: 0 }); // aiTokens default
    const [users, setUsers] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]); // New state
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [chartsReady, setChartsReady] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [statsData, usersData, activityData] = await Promise.all([
                getDashboardStats(),
                getAdminUsers(),
                getAdminActivity()
            ]);
            setStats(statsData);
            setUsers(usersData);
            setActivityFeed(activityData || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError(err?.message || 'Failed to load admin data');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Real-time subscription for Admin
    useEffect(() => {
        const channel = supabase
            .channel('admin_dashboard')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'documents' },
                () => loadData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'users' },
                () => loadData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadData]);

    // Delay chart rendering until client is mounted to avoid SSR/hydration chart issues
    useEffect(() => {
        setChartsReady(true);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadData();
    };

    const handleBanUser = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        setActionLoading(userId);
        try {
            await updateUserStatus(userId, newStatus);
            await loadData();
        } catch (err) {
            console.error('Failed to update user status:', err);
            setError(err?.message || 'Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter((u) =>
        (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
    );

    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Initial load for maintenance status
    useEffect(() => {
        const fetchMaintenance = async () => {
            const { data } = await supabase.from('global_settings').select('maintenance_active').single();
            if (data) setMaintenanceMode(data.maintenance_active);
        };
        fetchMaintenance();
    }, []);

    const toggleMaintenance = async () => {
        const newValue = !maintenanceMode;
        setMaintenanceMode(newValue); // Optimistic UI

        try {
            const { error } = await supabase
                .from('global_settings')
                .update({ maintenance_active: newValue })
                .eq('id', 1);

            if (error) throw error;
        } catch (err) {
            console.error('Failed to toggle maintenance:', err);
            setMaintenanceMode(!newValue); // Revert
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'space-y-8 animate-in fade-in duration-300',
                isDark ? 'text-slate-100' : 'text-slate-900',
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Real-time analytics and management
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {error && (
                        <span className="text-xs font-medium text-red-500">
                            {error}
                        </span>
                    )}

                    {/* Maintenance Toggle */}
                    <button
                        onClick={toggleMaintenance}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border',
                            maintenanceMode
                                ? 'bg-red-500 text-white border-red-600 hover:bg-red-600 shadow-red-500/20 shadow-lg animate-pulse'
                                : 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                        )}
                    >
                        <Zap className={cn('h-3 w-3', maintenanceMode && 'fill-current')} />
                        {maintenanceMode ? 'Maintenance ON' : 'System Normal'}
                    </button>

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors active:scale-95 disabled:opacity-50',
                            isDark
                                ? 'bg-white/10 hover:bg-white/15 border border-white/10 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800',
                        )}
                    >
                        <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Power Grid Stats (4-column) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users with Sparkline */}
                <div
                    className={cn(
                        'rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow',
                        isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                    )}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
                                Total Users
                            </p>
                            <h3 className="text-2xl font-bold mt-1">{stats.users?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="w-20 h-10 min-h-[40px]">
                            {chartsReady && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={mockSparkline}>
                                        <Line type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-green-500 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" /> +12% this week
                    </div>
                </div>

                {/* Documents */}
                <div
                    className={cn(
                        'rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow',
                        isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                    )}
                >
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
                        Total Documents
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{stats.documents?.toLocaleString() || 0}</h3>
                    <div className="mt-2 flex items-center text-xs text-indigo-500 font-medium">
                        <FileText className="h-3 w-3 mr-1" /> From database
                    </div>
                </div>

                {/* AI Credit Usage Gauge */}
                <div
                    className={cn(
                        'rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow',
                        isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                    )}
                >
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
                        Total AI Credits Used
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <div className="w-16 h-16 min-h-[64px]">
                            {chartsReady && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { value: stats.aiTokens || 0 }, // Using aiTokens from backend
                                                { value: 10000 - (stats.aiTokens || 0) }, // Arbitrary max for visual
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={20}
                                            outerRadius={28}
                                            startAngle={180}
                                            endAngle={0}
                                            dataKey="value"
                                        >
                                            <Cell fill="#a855f7" />
                                            <Cell fill={isDark ? '#1e293b' : '#e2e8f0'} />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="text-right">
                            <h3 className="text-2xl font-bold">{stats.aiTokens?.toLocaleString() || 0}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">tokens used</p>
                        </div>
                    </div>
                </div>

                {/* Processing Load */}
                <div
                    className={cn(
                        'rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow',
                        isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                    )}
                >
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
                        Active Jobs
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <h3 className="text-2xl font-bold">0</h3>
                        <div className="relative">
                            <Zap className="h-6 w-6 text-orange-500" />
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping"></span>
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Real-time monitoring</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
                {/* Recent Transformations Feed */}
                <div
                    className={cn(
                        'rounded-xl p-6 border shadow-sm',
                        isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                    )}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Recent Transformations</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Live feed of document activity
                            </p>
                        </div>
                        <Activity className="h-5 w-5 text-slate-400" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/10">
                                    <th className="pb-3">User</th>
                                    <th className="pb-3">Document</th>
                                    <th className="pb-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {activityFeed.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-4 text-center text-slate-500 text-sm">
                                            No recent activity
                                        </td>
                                    </tr>
                                ) : (
                                    activityFeed.map((item) => (
                                        <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                                                        {item.userEmail?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                        {item.userEmail}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                                    {item.fileName}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-xs text-slate-400">
                                                {new Date(item.time).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Events (System Logs) */}
                <div
                    className={cn(
                        'rounded-xl p-6 border shadow-sm',
                        isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                    )}
                >
                    <h3 className="text-lg font-bold mb-4">System Logs</h3>
                    <ul className="space-y-3">
                        {mockEvents.map((event) => (
                            <li key={event.id} className="flex items-start gap-3">
                                <StatusDot type={event.type} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{event.message}</p>
                                    <p className="text-xs text-slate-400">{event.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Smart User Table */}
            <div
                className={cn(
                    'rounded-xl p-6 border shadow-sm',
                    isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                )}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">User Management</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                'pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500',
                                isDark
                                    ? 'bg-slate-800 border border-white/10 text-slate-100 placeholder:text-slate-500'
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400',
                            )}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/10">
                                <th className="pb-3">User</th>
                                <th className="pb-3">Role</th>
                                <th className="pb-3">Created</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500">
                                        {users.length === 0 ? 'No users found. Make sure you have Admin role.' : 'No matching users.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isBanned = user.banned_until;
                                    return (
                                        <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-3">
                                                <div>
                                                    <p className="text-sm font-medium">{user.email}</p>
                                                    <p className="text-xs text-slate-400">{user.id?.substring(0, 8)}...</p>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <RoleBadge role={user.user_metadata?.role || 'User'} isDark={isDark} />
                                            </td>
                                            <td className="py-3 text-sm text-slate-500 dark:text-slate-400">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="py-3">
                                                <span className={cn(
                                                    'text-xs font-medium',
                                                    isBanned ? 'text-red-500' : 'text-green-500',
                                                )}>
                                                    {isBanned ? 'Banned' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        title={isBanned ? 'Unban User' : 'Ban User'}
                                                        onClick={() => handleBanUser(user.id, isBanned ? 'banned' : 'active')}
                                                        disabled={actionLoading === user.id}
                                                        className={cn(
                                                            'p-1.5 rounded-lg transition-colors active:scale-95 disabled:opacity-50',
                                                            isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100',
                                                        )}
                                                    >
                                                        {actionLoading === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                                        ) : (
                                                            <UserX className={cn(
                                                                'h-4 w-4',
                                                                isBanned ? 'text-green-500' : 'text-red-500',
                                                            )} />
                                                        )}
                                                    </button>
                                                    <button
                                                        title="Reset Password"
                                                        className={cn(
                                                            'p-1.5 rounded-lg transition-colors active:scale-95',
                                                            isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100',
                                                        )}
                                                    >
                                                        <KeyRound className="h-4 w-4 text-amber-500" />
                                                    </button>
                                                    <button
                                                        title="View Details"
                                                        className={cn(
                                                            'p-1.5 rounded-lg transition-colors active:scale-95',
                                                            isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100',
                                                        )}
                                                    >
                                                        <Eye className="h-4 w-4 text-blue-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusDot({ type }) {
    const colors = {
        success: 'bg-green-500',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };
    return <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${colors[type] || 'bg-slate-400'}`}></span>;
}

function RoleBadge({ role, isDark }) {
    let classes;
    switch (role?.toLowerCase()) {
        case 'admin':
            classes = isDark ? 'bg-red-500/15 text-red-100' : 'bg-red-100 text-red-600';
            break;
        case 'pro':
            classes = isDark ? 'bg-purple-500/15 text-purple-100' : 'bg-purple-100 text-purple-600';
            break;
        default:
            classes = isDark ? 'bg-slate-500/15 text-slate-200' : 'bg-slate-100 text-slate-600';
    }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
            {role || 'User'}
        </span>
    );
}
