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
import { getAdminUsers, getDashboardStats, updateUserStatus } from '../../services/adminService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

// Mock data for charts
const mockSparkline = [
    { v: 40 }, { v: 55 }, { v: 48 }, { v: 62 }, { v: 58 }, { v: 70 }, { v: 85 },
];

const mockActivityData = [
    { time: '6am', docs: 20, transforms: 15 },
    { time: '9am', docs: 80, transforms: 60 },
    { time: '12pm', docs: 120, transforms: 90 },
    { time: '3pm', docs: 150, transforms: 110 },
    { time: '6pm', docs: 100, transforms: 80 },
    { time: '9pm', docs: 60, transforms: 40 },
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

    const [stats, setStats] = useState({ users: 0, documents: 0, aiUsage: 0 });
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [chartsReady, setChartsReady] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [statsData, usersData] = await Promise.all([
                getDashboardStats(),
                getAdminUsers(),
            ]);
            setStats(statsData);
            setUsers(usersData);
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
                        <div className="w-20 h-10">
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
                        AI Usage Today
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <div className="w-16 h-16">
                            {chartsReady && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { value: stats.aiUsage || 0 },
                                                { value: 100 - (stats.aiUsage || 0) },
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
                            <h3 className="text-2xl font-bold">{stats.aiUsage || 0}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">transformations</p>
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
                {/* Activity Heatmap Chart */}
                <div
                    className={cn(
                        'rounded-xl p-6 border shadow-sm',
                        isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                    )}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Activity Heatmap</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Document creations vs AI transforms
                            </p>
                        </div>
                        <Activity className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="h-72">
                        {chartsReady ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockActivityData}>
                                    <defs>
                                        <linearGradient id="gradientDocs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradientTransforms" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Area type="monotone" dataKey="docs" stroke="#6366f1" strokeWidth={2} fill="url(#gradientDocs)" name="Documents" />
                                    <Area type="monotone" dataKey="transforms" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradientTransforms)" name="AI Transforms" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        )}
                    </div>
                </div>

                {/* Recent Events */}
                <div
                    className={cn(
                        'rounded-xl p-6 border shadow-sm',
                        isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                    )}
                >
                    <h3 className="text-lg font-bold mb-4">Recent Events</h3>
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
