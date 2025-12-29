import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly notificationsService: NotificationsService
    ) { }

    private get supabase() {
        return this.supabaseService.getClient();
    }

    async listUsers() {
        // List users using page 1, perPage 100 for now. Real apps need pagination.
        const { data: { users }, error } = await this.supabase.auth.admin.listUsers();

        if (error) {
            throw new Error(`Failed to list users: ${error.message}`);
        }
        return { users };
    }

    async updateUserStatus(id: string, status: 'active' | 'banned') {
        let banDuration = 'none';
        if (status === 'banned') {
            banDuration = '876600h'; // ~100 years
        }

        const { data, error } = await this.supabase.auth.admin.updateUserById(id, {
            ban_duration: banDuration
        });

        if (error) {
            throw new Error(`Failed to update user status: ${error.message}`);
        }

        // Create notification for user status change
        try {
            await this.notificationsService.create({
                type: status === 'banned' ? 'user_banned' : 'user_unbanned',
                title: status === 'banned' ? 'User Banned' : 'User Unbanned',
                message: `User ${data.user.email} has been ${status === 'banned' ? 'banned' : 'unbanned'}`,
                metadata: { user_id: id, email: data.user.email, status }
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        return data.user;
    }

    async deleteUser(id: string) {
        const { data, error } = await this.supabase.auth.admin.deleteUser(id);

        if (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
        return { message: 'User deleted successfully', id };
    }

    async getStats() {
        // 1. Count users
        const { data: { users }, error: usersError } = await this.supabase.auth.admin.listUsers();
        const userCount = usersError ? 0 : users?.length || 0;

        // 2. Count documents
        const { count: documentCount, error: docsError } = await this.supabase
            .from('documents')
            .select('*', { count: 'exact', head: true });

        // 3. AI Usage Today (Placeholder - requires an 'ai_logs' table or similar)
        // For now, return 0. A real implementation would query a dedicated logging table.
        // const today = new Date().toISOString().split('T')[0];
        // const { count: aiUsage } = await this.supabase.from('ai_logs').select('*', { count: 'exact', head: true }).gte('created_at', today);
        const aiUsage = 0; // Placeholder

        return {
            users: userCount,
            documents: documentCount ?? 0,
            aiUsage: aiUsage,
        };
    }
}
