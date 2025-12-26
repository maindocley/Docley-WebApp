import { Users } from 'lucide-react';

export default function UsersManager() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Users className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
            <p>User list and management features coming soon.</p>
        </div>
    );
}
