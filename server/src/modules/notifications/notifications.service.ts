import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';

@Injectable()
export class NotificationsService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get client() {
        return this.supabaseService.getClient();
    }

    /**
     * Create a notification
     */
    async create(notification: {
        type: string;
        title: string;
        message: string;
        metadata?: any;
        admin_id?: string;
    }) {
        const { data, error } = await this.client
            .from('notifications')
            .insert({
                type: notification.type,
                title: notification.title,
                message: notification.message,
                metadata: notification.metadata || {},
                admin_id: notification.admin_id || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to create notification:', error);
            throw new Error(`Failed to create notification: ${error.message}`);
        }

        return data;
    }

    /**
     * Get all notifications for admin
     */
    async findAll(limit: number = 50) {
        const { data, error } = await this.client
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(`Failed to fetch notifications: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get unread count
     */
    async getUnreadCount() {
        const { count, error } = await this.client
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('read', false);

        if (error) {
            throw new Error(`Failed to get unread count: ${error.message}`);
        }

        return count || 0;
    }

    /**
     * Mark notification as read
     */
    async markAsRead(id: string) {
        const { data, error } = await this.client
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to mark notification as read: ${error.message}`);
        }

        return data;
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        const { data, error } = await this.client
            .from('notifications')
            .update({ read: true })
            .eq('read', false)
            .select();

        if (error) {
            throw new Error(`Failed to mark all as read: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete notification
     */
    async delete(id: string) {
        const { error } = await this.client
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete notification: ${error.message}`);
        }

        return { success: true };
    }
}

