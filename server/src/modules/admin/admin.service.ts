import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
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
        const { count: documentCount } = await this.supabase
            .from('documents')
            .select('*', { count: 'exact', head: true });

        // 3. Global AI Token Usage (RPC)
        const { data: totalTokens, error: rpcError } = await this.supabase
            .rpc('get_total_tokens');

        if (rpcError) {
            console.error('Error fetching total tokens:', rpcError);
        }

        return {
            users: userCount,
            documents: documentCount ?? 0,
            aiTokens: totalTokens || 0,
        };
    }

    async getRecentActivity() {
        // Fetch last 5 documents
        const { data: documents, error } = await this.supabase
            .from('documents')
            .select('id, title, created_at, user_id')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            throw new Error(`Failed to fetch recent activity: ${error.message}`);
        }

        // Enrich with user info
        // We fetching users 1-by-1 for these 5 docs. Efficient enough for small batch.
        const activity = await Promise.all(documents.map(async (doc) => {
            // Safe user fetch
            const { data: { user } } = await this.supabase.auth.admin.getUserById(doc.user_id);
            return {
                id: doc.id,
                fileName: doc.title || 'Untitled Document',
                userEmail: user?.email || 'Unknown User',
                action: 'created document',
                time: doc.created_at
            };
        }));

        return activity;
    }

    async getSettings() {
        const { data, error } = await this.supabase
            .from('global_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            throw new Error(`Failed to fetch settings: ${error.message}`);
        }
        return data;
    }

    async updateSettings(settings: any) {
        const { data, error } = await this.supabase
            .from('global_settings')
            .update(settings)
            .eq('id', 1)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update settings: ${error.message}`);
        }
        return data;
    }

    async uploadBlogImage(file: Express.Multer.File) {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await this.supabase.storage
            .from('blog-images')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            throw new Error(`Failed to upload blog image: ${uploadError.message}`);
        }

        const { data } = this.supabase.storage
            .from('blog-images')
            .getPublicUrl(filePath);

        return { publicUrl: data.publicUrl };
    }
}
