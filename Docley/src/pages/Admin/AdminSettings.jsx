import { useState } from 'react';
import {
    Bot,
    Globe,
    Shield,
    Save,
    Server,
    Mail,
    Lock,
    Cpu,
    AlertTriangle,
    CheckCircle2,
    Database,
    Activity,
    Layers,
    LayoutGrid,
    Search,
    Settings
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';

export default function AdminSettings() {
    const { theme } = useTheme();
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [settings, setSettings] = useState({
        siteName: 'Docley',
        supportEmail: 'support@docley.com',
        maintenanceMode: false,
        aiModel: 'gemini-1.5-flash',
        aiTemperature: 0.7,
        maxTokens: 2048,
        allowSignups: true,
        requireEmailVerification: true,
        sessionTimeout: 60,
        databaseUrl: 'postgresql://********:********@aws-eu-west-1.pooler.supabase.com:6543/postgres',
        backupFrequency: 'daily'
    });

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        addToast('Admin settings saved successfully', 'success');
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const tabs = [
        { id: 'general', label: 'General', icon: LayoutGrid },
        { id: 'ai', label: 'AI Configuration', icon: Bot },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'database', label: 'Database', icon: Database },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="col-span-1 md:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Platform Identity</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Basic information visible to users.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Site Name</label>
                                        <div className="relative group">
                                            <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={settings.siteName}
                                                onChange={(e) => handleChange('siteName', e.target.value)}
                                                className="w-full pl-10 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-slate-900 dark:text-slate-100 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Support Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                            <input
                                                type="email"
                                                value={settings.supportEmail}
                                                onChange={(e) => handleChange('supportEmail', e.target.value)}
                                                className="w-full pl-10 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-slate-900 dark:text-slate-100 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200 dark:border-orange-900/30 shadow-sm bg-orange-50/50 dark:bg-orange-950/10">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                                    <CardTitle className="text-base text-orange-800 dark:text-orange-200">Maintenance Mode</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-orange-700/80 dark:text-orange-300/70 max-w-[70%]">
                                        When enabled, only administrators can access the platform.
                                    </p>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.maintenanceMode}
                                            onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-orange-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-emerald-500" />
                                    <CardTitle className="text-base text-slate-900 dark:text-white">System Status</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Operational</span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                                    <span className="text-sm text-slate-500 dark:text-slate-400">v2.4.0-beta</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'ai':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <CardTitle className="text-lg text-slate-900 dark:text-white">Model Selection</CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-slate-400">Choose the AI engine powering the platform.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => handleChange('aiModel', 'gemini-1.5-flash')}
                                            className={cn(
                                                "cursor-pointer relative p-5 rounded-xl border-2 transition-all duration-200 flex flex-col gap-3",
                                                settings.aiModel === 'gemini-1.5-flash'
                                                    ? "border-orange-500 bg-orange-50/30 dark:bg-orange-900/10 ring-1 ring-orange-500/20"
                                                    : "border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 bg-white dark:bg-slate-950"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                                    <ZapIcon className="h-5 w-5" />
                                                </div>
                                                {settings.aiModel === 'gemini-1.5-flash' && <CheckCircle2 className="h-5 w-5 text-orange-500" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">Gemini 1.5 Flash</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Low latency, cost-effective.</p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => handleChange('aiModel', 'gemini-1.5-pro')}
                                            className={cn(
                                                "cursor-pointer relative p-5 rounded-xl border-2 transition-all duration-200 flex flex-col gap-3",
                                                settings.aiModel === 'gemini-1.5-pro'
                                                    ? "border-orange-500 bg-orange-50/30 dark:bg-orange-900/10 ring-1 ring-orange-500/20"
                                                    : "border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 bg-white dark:bg-slate-950"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                                    <BrainIcon className="h-5 w-5" />
                                                </div>
                                                {settings.aiModel === 'gemini-1.5-pro' && <CheckCircle2 className="h-5 w-5 text-orange-500" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">Gemini 1.5 Pro</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">High reasoning, complex tasks.</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <CardTitle className="text-lg text-slate-900 dark:text-white">Parameters</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Temperature</label>
                                            <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">{settings.aiTemperature}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={settings.aiTemperature}
                                            onChange={(e) => handleChange('aiTemperature', parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Tokens</label>
                                        <input
                                            type="number"
                                            value={settings.maxTokens}
                                            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-slate-900 dark:text-slate-100"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="md:col-span-3 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Access Control Policies</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Global security settings for all users.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="font-medium text-slate-900 dark:text-white">Public Registration</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">Allow new users to sign up without an invitation.</div>
                                        </div>
                                        <Switch
                                            checked={settings.allowSignups}
                                            onChange={(checked) => handleChange('allowSignups', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="font-medium text-slate-900 dark:text-white">Mandatory Email Verification</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">Users must verify their email before accessing the dashboard.</div>
                                        </div>
                                        <Switch
                                            checked={settings.requireEmailVerification}
                                            onChange={(checked) => handleChange('requireEmailVerification', checked)}
                                        />
                                    </div>
                                    <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <div className="font-medium text-slate-900 dark:text-white">Session Timeout</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Inactivity period before auto-logout (minutes).</div>
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    value={settings.sessionTimeout}
                                                    onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-slate-900 dark:text-slate-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'database':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Connection String</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">PostgreSQL connection details.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex gap-2">
                                    <code className="flex-1 p-4 rounded-lg bg-black/50 font-mono text-sm text-green-400 overflow-x-auto border border-slate-800">
                                        {settings.databaseUrl}
                                    </code>
                                    <Button
                                        variant="outline"
                                        onClick={() => addToast('Copied to clipboard', 'success')}
                                        className="h-auto border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white"
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Backup Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['hourly', 'daily', 'weekly'].map((freq) => (
                                        <div
                                            key={freq}
                                            onClick={() => handleChange('backupFrequency', freq)}
                                            className={cn(
                                                "cursor-pointer p-4 rounded-xl border-2 text-center capitalize font-medium transition-all",
                                                settings.backupFrequency === freq
                                                    ? "border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                                                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-orange-200 dark:hover:border-slate-700"
                                            )}
                                        >
                                            {freq}
                                        </div>
                                    ))}
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
        <div className="max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Settings className="h-6 w-6 text-slate-400" />
                        System Settings
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure global parameters, AI models, and security policies.</p>
                </div>
                <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 px-6"
                >
                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                </Button>
            </div>

            {/* Horizontal Tabs Navigation */}
            <div className="mb-8 border-b border-slate-200 dark:border-slate-800">
                <nav className="flex gap-6 overflow-x-auto pb-1" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "group flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all",
                                    isActive
                                        ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                        : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive ? "text-orange-500" : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300")} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {renderContent()}
        </div>
    );
}

// Helper Components
function ZapIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}

function BrainIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
            <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
            <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
            <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
            <path d="M6 18a4 4 0 0 1-1.97-3.284" />
            <path d="M17.97 14.716A4 4 0 0 1 16 18" />
        </svg>
    )
}

function Switch({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                checked ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700"
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    );
}
