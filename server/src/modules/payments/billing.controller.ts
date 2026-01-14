import { Controller, Get, Req, UseGuards, Logger } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';

@Controller('api/billing')
export class BillingController {
    private readonly logger = new Logger(BillingController.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    @Get('status')
    async getStatus(@Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            return { is_premium: false, tier: 'free', message: 'User not authenticated' };
        }

        try {
            const client = this.supabaseService.getClient();
            const { data, error } = await client
                .from('usage')
                .select('subscription_tier')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                return { is_premium: false, tier: 'free' };
            }

            return {
                is_premium: data.subscription_tier === 'pro',
                tier: data.subscription_tier,
            };
        } catch (error) {
            this.logger.error(`Status check failed for user ${userId}: ${error.message}`);
            return { is_premium: false, tier: 'free', error: 'Internal status check failure' };
        }
    }
}
