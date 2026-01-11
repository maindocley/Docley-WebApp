import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../core/supabase/supabase.service';

@Injectable()
export class WhopWebhookService {
    private readonly logger = new Logger(WhopWebhookService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    private get client() {
        return this.supabaseService.getClient();
    }

    async handleMembershipActivated(payload: any) {
        const email = payload.data?.email || payload.data?.user?.email;
        const whopUserId = payload.data?.user_id || payload.data?.user?.id;

        if (!email) {
            this.logger.error('No email found in Whop payload');
            return;
        }

        this.logger.log(`Activating premium for user: ${email} (Whop ID: ${whopUserId})`);

        const { error } = await this.client
            .from('users')
            .update({
                is_premium: true,
                whop_user_id: whopUserId,
                updated_at: new Date().toISOString()
            })
            .eq('email', email);

        if (error) {
            this.logger.error(`Failed to update user premium status: ${error.message}`);
            throw new InternalServerErrorException('Database update failed');
        }
    }

    // handlePaymentSucceeded removed - payment system deprecated

    async handleMembershipDeactivated(payload: any) {
        const email = payload.data?.email || payload.data?.user?.email;

        if (!email) {
            this.logger.error('No email found in Whop payload');
            return;
        }

        this.logger.log(`Deactivating premium for user: ${email}`);

        const { error } = await this.client
            .from('users')
            .update({
                is_premium: false,
                updated_at: new Date().toISOString()
            })
            .eq('email', email);

        if (error) {
            this.logger.error(`Failed to update user premium status: ${error.message}`);
            throw new InternalServerErrorException('Database update failed');
        }
    }
}
