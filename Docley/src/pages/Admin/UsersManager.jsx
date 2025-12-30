import { useEffect, useState } from 'react';
import {
    Ban,
    CheckCircle,
    Loader2,
    MoreVertical,
    Search,
    Trash2,
    User,
    UserCheck,
    UserX,
    Shield,
    ShieldAlert
} from 'lucide-react';
import { getAdminUsers, updateUserStatus, deleteUser } from '../../services/adminService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export default function UsersManager() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);

    const loadUsers = async () => {
        try {
            const data = await getAdminUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleBanUser = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus === 'banned' ? 'unban' : 'ban'} this user?`)) return;
        
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        setActionLoading(userId);
        try {
            await updateUserStatus(userId, newStatus);
            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, user_metadata: { ...u.user_metadata, status: newStatus } } : u));
        } catch (err) {
            setError('Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setActionLoading(userId);
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            setError('Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter((u) =>
        (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (u.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: users.length,
        active: users.filter(u => u.user_metadata?.status !== 'banned').length,
        banned: users.filter(u => u.user_metadata?.status === 'banned').length
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className={cn(
            'space-y-8 animate-in fade-in duration-300',
            isDark ? 'text-slate-100' : 'text-slate-900'
        )}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage user accounts, roles, and permissions
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "pl-9 pr-4 py-2 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500/50",
                            isDark 
                                ? "bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500" 
                                : "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400"
                        )}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={cn(
                    'p-5 rounded-xl border flex items-center justify-between',
                    isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
                )}>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Total Users</p>
                        <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <User className="h-5 w-5" />
                    </div>
                </div>
                <div className={cn(
                    'p-5 rounded-xl border flex items-center justify-between',
                    isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
                )}>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Active Users</p>
                        <h3 className="text-2xl font-bold mt-1">{stats.active}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <UserCheck className="h-5 w-5" />
                    </div>
                </div>
                <div className={cn(
                    'p-5 rounded-xl border flex items-center justify-between',
                    isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
                )}>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Banned Users</p>
                        <h3 className="text-2xl font-bold mt-1">{stats.banned}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <UserX className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className={cn(
                'rounded-xl border overflow-hidden',
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
            )}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={cn(
                            'text-xs uppercase font-medium',
                            isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'
                        )}>
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isBanned = user.user_metadata?.status === 'banned';
                                    const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';
                                    
                                    return (
                                        <tr key={user.id} className={cn(
                                            'transition-colors',
                                            isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                                        )}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold uppercase",
                                                        isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                                                    )}>
                                                        {user.email?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-slate-100">
                                                            {user.email}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            ID: {user.id.slice(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isAdmin ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                                                        <Shield className="h-3 w-3" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                        User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isBanned ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                                        <UserX className="h-3 w-3" /> Banned
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                                        <CheckCircle className="h-3 w-3" /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleBanUser(user.id, user.user_metadata?.status)}
                                                        disabled={actionLoading === user.id}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors disabled:opacity-50",
                                                            isBanned 
                                                                ? "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10" 
                                                                : "text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                                                        )}
                                                        title={isBanned ? "Activate User" : "Ban User"}
                                                    >
                                                        {actionLoading === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        className="p-2 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
