import { Settings } from 'lucide-react';

export default function AdminSettings() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Settings className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Admin Settings</h2>
            <p>System configuration options coming soon.</p>
        </div>
    );
}
