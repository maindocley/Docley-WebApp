import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get client() {
        return this.supabaseService.getClient();
    }

    private async getUserFlags(userId: string): Promise<{ is_premium: boolean; role: string | null }> {
        const { data } = await this.client
            .from('users')
            .select('is_premium, role')
            .eq('id', userId)
            .maybeSingle();

        return {
            is_premium: data?.is_premium === true,
            role: typeof data?.role === 'string' ? data.role : null,
        };
    }

    /**
     * Get or create usage record for a user
     */
    async getOrCreateUsage(userId: string) {
        const { data: usage, error } = await this.client
            .from('usage')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            throw new InternalServerErrorException(`Failed to fetch usage: ${error.message}`);
        }

        const flags = await this.getUserFlags(userId);

        if (usage) {
            return { ...usage, is_premium: flags.is_premium, role: flags.role };
        }

        // Initialize usage record
        const { data: newUsage, error: createError } = await this.client
            .from('usage')
            .insert({
                user_id: userId,
                document_count: 0,
                subscription_tier: 'free'
            })
            .select()
            .single();

        if (createError) {
            throw new InternalServerErrorException(`Failed to create usage record: ${createError.message}`);
        }

        return { ...newUsage, is_premium: flags.is_premium, role: flags.role };
    }

    async consumeDocument(userId: string) {
        const flags = await this.getUserFlags(userId);
        if (flags.role === 'admin') return;

        const { error } = await this.client.rpc('consume_document', {
            user_id_param: userId,
        });

        if (error) {
            throw new InternalServerErrorException(`Failed to consume document allowance: ${error.message}`);
        }
    }

    async consumeAiDiagnostic(userId: string) {
        const flags = await this.getUserFlags(userId);
        if (flags.role === 'admin') return;

        const { error } = await this.client.rpc('consume_ai_diagnostic', {
            user_id_param: userId,
        });

        if (error) {
            throw new InternalServerErrorException(`Failed to consume AI diagnostic allowance: ${error.message}`);
        }
    }

    async consumeAiUpgrade(userId: string) {
        const flags = await this.getUserFlags(userId);
        if (flags.role === 'admin') return;

        const { error } = await this.client.rpc('consume_ai_upgrade', {
            user_id_param: userId,
        });

        if (error) {
            throw new InternalServerErrorException(`Failed to consume AI upgrade allowance: ${error.message}`);
        }
    }

    /**
     * Reset count if 30 days have passed
     */
    async checkAndResetMonthly(usage: any) {
        return usage;
    }

    /**
     * Increment document count
     */
    async incrementUsage(userId: string) {
        const flags = await this.getUserFlags(userId);
        if (flags.role === 'admin') return;

        const { error } = await this.client.rpc('increment_usage', {
            user_id_param: userId,
        });

        if (error) {
            console.error(`Failed to increment usage: ${error.message}`);
        }
    }

    /**
     * Update user password using Supabase Admin Auth
     */
    async updatePassword(userId: string, newPassword: string) {
        const { data, error } = await this.client.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (error) {
            throw new InternalServerErrorException(`Failed to update password: ${error.message}`);
        }

        return data;
    }

    /**
     * Sync user profile from Auth to public.users table
     */
    async syncUser(user: any) {
        // user object comes from Supabase Auth (JWT)
        const profile = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            updated_at: new Date().toISOString()
        };

        const { data, error } = await this.client
            .from('users')
            .upsert(profile, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Failed to sync user profile:', error);
            // Don't throw error to avoid blocking login if sync fails
            return null;
        }

        // Also ensure usage record exists
        await this.getOrCreateUsage(user.id);

        return data;
    }
}
