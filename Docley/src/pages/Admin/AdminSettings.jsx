import { useState } from 'react';
import {
    Bot,
    Check,
    Globe,
    Lock,
    Save,
    Settings,
    Shield,
    Smartphone
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export default function AdminSettings() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
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
        sessionTimeout: 60
    });

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        // You would typically show a toast here
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'ai', label: 'AI Configuration', icon: Bot },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className={cn(
            'space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto',
            isDark ? 'text-slate-100' : 'text-slate-900'
        )}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Platform Settings</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Configure global application settings
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {isSaving ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save Changes
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? isDark 
                                            ? "bg-orange-500/10 text-orange-400" 
                                            : "bg-orange-50 text-orange-600"
                                        : isDark
                                            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className={cn(
                            "rounded-xl border p-6 space-y-6",
                            isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
                        )}>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">General Information</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Basic platform details and contact info.
                                </p>
                            </div>
                            
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Site Name</label>
                                    <input
                                        type="text"
                                        value={settings.siteName}
                                        onChange={(e) => handleChange('siteName', e.target.value)}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:ring-2 focus:ring-orange-500/20",
                                            isDark 
                                                ? "bg-slate-950 border-slate-800 focus:border-orange-500/50" 
                                                : "bg-white border-slate-200 focus:border-orange-500"
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Support Email</label>
                                    <input
                                        type="email"
                                        value={settings.supportEmail}
                                        onChange={(e) => handleChange('supportEmail', e.target.value)}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:ring-2 focus:ring-orange-500/20",
                                            isDark 
                                                ? "bg-slate-950 border-slate-800 focus:border-orange-500/50" 
                                                : "bg-white border-slate-200 focus:border-orange-500"
                                        )}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <div className="font-medium text-sm">Maintenance Mode</div>
                                        <div className="text-xs text-slate-500">Disable access for non-admins</div>
                                    </div>
                                    <button
                                        onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            settings.maintenanceMode ? "bg-orange-500" : (isDark ? "bg-slate-700" : "bg-slate-200")
                                        )}
                                    >
                                        <span className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Settings */}
                    {activeTab === 'ai' && (
                        <div className={cn(
                            "rounded-xl border p-6 space-y-6",
                            isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
                        )}>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">AI Configuration</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Manage Gemini model parameters and limits.
                                </p>
                            </div>
                            
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Model Version</label>
                                    <select
                                        value={settings.aiModel}
                                        onChange={(e) => handleChange('aiModel', e.target.value)}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg text-sm outline-none border transition-all",
                                            isDark 
                                                ? "bg-slate-950 border-slate-800" 
                                                : "bg-white border-slate-200"
                                        )}
                                    >
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fastest)</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Best Quality)</option>
                                    </select>
                                </div>
                                
                                <div className="grid gap-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium">Temperature</label>
                                        <span className="text-xs text-slate-500">{settings.aiTemperature}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={settings.aiTemperature}
                                        onChange={(e) => handleChange('aiTemperature', parseFloat(e.target.value))}
                                        className="w-full accent-orange-500"
                                    />
                                    <p className="text-xs text-slate-500">Lower values are more deterministic, higher are more creative.</p>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Max Output Tokens</label>
                                    <input
                                        type="number"
                                        value={settings.maxTokens}
                                        onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:ring-2 focus:ring-orange-500/20",
                                            isDark 
                                                ? "bg-slate-950 border-slate-800 focus:border-orange-500/50" 
                                                : "bg-white border-slate-200 focus:border-orange-500"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className={cn(
                            "rounded-xl border p-6 space-y-6",
                            isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
                        )}>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Access & Security</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Control user access and authentication rules.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
                                    <div>
                                        <div className="font-medium text-sm">Allow New Signups</div>
                                        <div className="text-xs text-slate-500">If disabled, only admins can invite users</div>
                                    </div>
                                    <button
                                        onClick={() => handleChange('allowSignups', !settings.allowSignups)}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            settings.allowSignups ? "bg-green-500" : (isDark ? "bg-slate-700" : "bg-slate-200")
                                        )}
                                    >
                                        <span className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            settings.allowSignups ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
                                    <div>
                                        <div className="font-medium text-sm">Require Email Verification</div>
                                        <div className="text-xs text-slate-500">Users must verify email before logging in</div>
                                    </div>
                                    <button
                                        onClick={() => handleChange('requireEmailVerification', !settings.requireEmailVerification)}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            settings.requireEmailVerification ? "bg-green-500" : (isDark ? "bg-slate-700" : "bg-slate-200")
                                        )}
                                    >
                                        <span className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            settings.requireEmailVerification ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>

                                <div className="grid gap-2 pt-2">
                                    <label className="text-sm font-medium">Session Timeout (minutes)</label>
                                    <input
                                        type="number"
                                        value={settings.sessionTimeout}
                                        onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:ring-2 focus:ring-orange-500/20",
                                            isDark 
                                                ? "bg-slate-950 border-slate-800 focus:border-orange-500/50" 
                                                : "bg-white border-slate-200 focus:border-orange-500"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
