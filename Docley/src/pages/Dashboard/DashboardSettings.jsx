import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { 
    User, Bell, CreditCard, Shield, Mail, Save, Key, Trash2, 
    AlertTriangle, Eye, EyeOff, CheckCircle2, Moon, Sun, 
    Monitor, Globe, Clock, ChevronRight, LogOut
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export default function DashboardSettings() {
    const { addToast } = useToast();
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        emailAlerts: true,
        marketing: false,
        language: 'en',
        timezone: 'UTC',
        twoFactor: false
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Populate data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email,
                fullName: user.user_metadata?.full_name || '',
            }));

            const fetchProfile = async () => {
                const { data } = await supabase
                    .from('users')
                    .select('full_name, email')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: data.full_name || user.user_metadata?.full_name,
                        email: data.email || user.email
                    }));
                }
            };
            fetchProfile();
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ full_name: formData.fullName })
                .eq('id', user.id);

            if (error) throw error;

            await supabase.auth.updateUser({
                data: { full_name: formData.fullName }
            });

            addToast('Settings saved successfully!', 'success');
        } catch (error) {
            addToast('Failed to save settings: ' + error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            addToast('Password must be at least 8 characters long', 'warning');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });
            if (error) throw error;
            addToast('Password updated successfully', 'success');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            addToast(error.message || 'Failed to update password', 'error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: User, desc: 'Profile & preferences' },
        { id: 'appearance', label: 'Appearance', icon: Monitor, desc: 'Theme & display' },
        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email alerts' },
        { id: 'billing', label: 'Billing', icon: CreditCard, desc: 'Plan & payment' },
        { id: 'security', label: 'Security', icon: Shield, desc: 'Password & 2FA' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Profile Information</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Update your photo and personal details.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full pl-10 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-10 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Regional Preferences</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Manage your language and timezone settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <select
                                                value={formData.language}
                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                className="w-full pl-10 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 appearance-none"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                            <div className="absolute right-3 top-3 pointer-events-none">
                                                <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <select
                                                value={formData.timezone}
                                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                                className="w-full pl-10 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 appearance-none"
                                            >
                                                <option value="UTC">UTC (GMT+0)</option>
                                                <option value="EST">Eastern Time (GMT-5)</option>
                                                <option value="PST">Pacific Time (GMT-8)</option>
                                                <option value="CET">Central European Time (GMT+1)</option>
                                            </select>
                                            <div className="absolute right-3 top-3 pointer-events-none">
                                                <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-2">
                            <Button 
                                onClick={handleSave} 
                                isLoading={isSaving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 px-8"
                            >
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </div>
                    </div>
                );
            
            case 'appearance':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Theme Preferences</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Choose how Docley looks on your device.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={cn(
                                            "group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                                            theme === 'light' 
                                                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-600/20" 
                                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <div className="h-24 w-full bg-slate-100 rounded-lg mb-4 flex items-center justify-center border border-slate-200 shadow-inner overflow-hidden relative">
                                            <div className="absolute inset-x-4 top-4 h-full bg-white rounded-t-lg border border-slate-200 shadow-sm"></div>
                                            <Sun className={cn("relative z-10 h-8 w-8 text-amber-500 transition-transform duration-300", theme === 'light' ? "scale-110" : "group-hover:scale-110")} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Light Mode</span>
                                            {theme === 'light' && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={cn(
                                            "group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                                            theme === 'dark' 
                                                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-600/20" 
                                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <div className="h-24 w-full bg-slate-950 rounded-lg mb-4 flex items-center justify-center border border-slate-800 shadow-inner overflow-hidden relative">
                                            <div className="absolute inset-x-4 top-4 h-full bg-slate-900 rounded-t-lg border border-slate-800 shadow-sm"></div>
                                            <Moon className={cn("relative z-10 h-8 w-8 text-indigo-400 transition-transform duration-300", theme === 'dark' ? "scale-110" : "group-hover:scale-110")} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Dark Mode</span>
                                            {theme === 'dark' && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                            setTheme(systemTheme);
                                            addToast(`System theme detected: ${systemTheme}`, 'info');
                                        }}
                                        className={cn(
                                            "group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <div className="h-24 w-full bg-gradient-to-br from-slate-100 to-slate-900 rounded-lg mb-4 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
                                            <Monitor className="h-8 w-8 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
                                        </div>
                                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">System</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Email Preferences</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Manage what emails you receive from us.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                    <div className="space-y-0.5">
                                        <div className="font-medium text-slate-900 dark:text-slate-100">Communication Emails</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Receive emails about your account activity and security.</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.emailAlerts}
                                            onChange={(e) => {
                                                setFormData({ ...formData, emailAlerts: e.target.checked });
                                                addToast('Notification settings updated', 'info');
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                    <div className="space-y-0.5">
                                        <div className="font-medium text-slate-900 dark:text-slate-100">Marketing Emails</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Receive emails about new products, features, and offers.</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.marketing}
                                            onChange={(e) => {
                                                setFormData({ ...formData, marketing: e.target.checked });
                                                addToast('Marketing preferences updated', 'info');
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'billing':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Current Plan</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Manage your billing and subscription.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="relative overflow-hidden rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900 p-8">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <CreditCard className="h-32 w-32 text-indigo-600" />
                                    </div>
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Free Plan</h3>
                                                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                    ACTIVE
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 max-w-md">
                                                You are currently on the free tier. Upgrade to unlock more document processing power and premium features.
                                            </p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <div className="text-3xl font-bold text-slate-900 dark:text-white">$0</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">per month</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 pt-8 border-t border-indigo-100 dark:border-indigo-900/30">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
                                                Upgrade to Pro
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                onClick={() => addToast('Billing portal not available', 'info')}
                                            >
                                                Billing History
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg">Change Password</CardTitle>
                                <CardDescription>Update your password to keep your account secure.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <input
                                                type={showPasswords ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full pl-10 pr-10 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                                placeholder="Min. 8 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            >
                                                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <input
                                                type={showPasswords ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full pl-10 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button 
                                            type="submit" 
                                            isLoading={isUpdatingPassword}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                                        >
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg text-slate-900 dark:text-white">Two-Factor Authentication</CardTitle>
                                        <CardDescription className="text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</CardDescription>
                                    </div>
                                    <div className={cn(
                                        "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                                        formData.twoFactor 
                                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50"
                                            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                    )}>
                                        {formData.twoFactor ? 'ENABLED' : 'DISABLED'}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="max-w-md">
                                    <p className="font-medium text-slate-900 dark:text-white">Authenticator App</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Use an authenticator app like Google Authenticator or Authy to generate verification codes.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.twoFactor}
                                        onChange={(e) => {
                                            setFormData({ ...formData, twoFactor: e.target.checked });
                                            addToast(e.target.checked ? '2FA Enabled' : '2FA Disabled', 'success');
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </CardContent>
                        </Card>

                        <Card className="border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden bg-red-50/30 dark:bg-red-950/10">
                            <CardHeader className="border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/20">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <CardTitle className="text-lg text-red-700 dark:text-red-400">Danger Zone</CardTitle>
                                </div>
                                <CardDescription className="text-red-600/70 dark:text-red-400/70">
                                    Irreversible actions for your account.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Delete Account</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Permanently remove your account and all data.</p>
                                    </div>
                                    <Button 
                                        variant="destructive"
                                        onClick={() => addToast('Account deletion is disabled for safety.', 'error')}
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Modern Sidebar */}
                <nav className="w-full lg:w-72 flex-shrink-0 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200 border",
                                    isActive 
                                        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm" 
                                        : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isActive 
                                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" 
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <div className={cn(
                                        "font-medium text-sm transition-colors",
                                        isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                                    )}>
                                        {tab.label}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500 line-clamp-1">
                                        {tab.desc}
                                    </div>
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4 text-indigo-500 animate-in fade-in slide-in-from-left-2" />}
                            </button>
                        );
                    })}
                    
                    <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-4 px-4 py-3.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                        >
                            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500">
                                <LogOut className="h-5 w-5" />
                            </div>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
