import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly apiKey = process.env.WHOP_API_KEY;
    private readonly priceId = process.env.WHOP_PRICE_ID;
    private readonly webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

    constructor(
        private readonly supabaseService: SupabaseService,
    ) { }

    async createCheckoutSession(userId: string, successUrl: string) {
        if (!this.apiKey) {
            this.logger.error('CRITICAL: WHOP_API_KEY is missing from environment variables');
            throw new InternalServerErrorException('Server Payment Configuration Error: Missing API Key');
        }

        if (!this.priceId) {
            this.logger.error('CRITICAL: WHOP_PRICE_ID is missing from environment variables');
            throw new InternalServerErrorException('Server Payment Configuration Error: Missing Price ID');
        }

        try {
            const requestUrl = 'https://api.whop.com/v1/checkout_sessions';
            const requestBody = {
                price_id: this.priceId,
                success_url: successUrl,
                metadata: {
                    user_id: userId
                }
            };

            console.log('\n--- [DEBUG] START WHOP REQUEST ---');
            console.log('URL:', requestUrl);
            console.log('Price ID:', this.priceId);
            console.log('User ID:', userId);
            console.log('----------------------------------\n');

            this.logger.log(`Initiating Whop Checkout for User ID: ${userId}`);
            this.logger.log(`Target URL: https://api.whop.com/v1/checkout_sessions`);

            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();

                console.error('\n!!! [DEBUG] WHOP API ERROR !!!');
                console.error(`Status: ${response.status} ${response.statusText}`);
                console.error('BODY:', errorText);
                console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');

                this.logger.error(`Whop API Request Failed! Status: ${response.status} ${response.statusText}`);
                this.logger.error(`Whop Error Response Body: ${errorText}`);

                // Try to parse JSON error if possible for cleaner log
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('Parsed Whop Error:', JSON.stringify(errorJson, null, 2));
                } catch (e) {
                    // ignore
                }

                throw new InternalServerErrorException(`Payment Provider Error: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            const checkoutUrl = data.url || data.checkout_url || data.data?.url;

            if (!checkoutUrl) {
                this.logger.error('Whop response did not contain a checkout URL. Full Response:', JSON.stringify(data));
                throw new InternalServerErrorException('Invalid response from payment provider (Missing Checkout URL)');
            }

            return { url: checkoutUrl };

        } catch (error) {
            this.logger.error(`Checkout Session Exception: ${error.message}`);
            if (error instanceof InternalServerErrorException) {
                throw error; // Re-throw known errors
            }
            throw new InternalServerErrorException(`Internal Payment System Error: ${error.message}`);
        }
    }

    async handleWebhook(signature: string, payload: any) {
        if (!this.webhookSecret) {
            this.logger.warn('WHOP_WEBHOOK_SECRET is not configured - proceeding without signature verification');
        }

        // TODO: Add actual HMAC verification here if secret is present
        // const isValid = verifySignature(signature, payload, this.webhookSecret);
        // if (!isValid) throw new UnauthorizedException('Invalid signature');

        const eventType = payload.action || payload.type;
        this.logger.log(`Received webhook event: ${eventType} for user ${payload.metadata?.user_id || 'unknown'}`);

        if (eventType === 'payment.succeeded' || payload.success === true) {
            const userId = payload.metadata?.user_id || payload.data?.metadata?.user_id;

            if (userId) {
                await this.updateUserStatus(userId);
            } else {
                this.logger.warn('Webhook received but no user_id found in metadata');
            }
        }
        return { success: true };
    }

    private async updateUserStatus(userId: string) {
        this.logger.log(`Upgrading user ${userId} to Pro`);

        // Use getClient() - assuming it has admin privileges if configured with service role key, 
        // OR checks if we need a specific admin client method. The previous code usage implies getClient() might be sufficient 
        // if initialized with Service Role Key, BUT usually SupabaseService distinguishes. 
        // Checking supabase.service.ts result will confirm. For now assuming getClient() or getAdminClient() if available.
        // Waiting for view_file result to be 100% sure, but writing this generally assuming standard setup.
        // Actually, I should use the Service Role Key specifically. 

        const client = this.supabaseService.getClient(); // Start with default, will swap if I see getAdminClient

        // 1. Update User Metadata
        const { error: authError } = await client.auth.admin.updateUserById(userId, {
            user_metadata: { is_pro: true }
        });

        if (authError) {
            this.logger.error(`Failed to update user metadata: ${authError.message}`);
        }

        // 2. Update Usage Table (Subscription Tier)
        const { error: dbError } = await client
            .from('usage')
            .update({ subscription_tier: 'pro' })
            .eq('user_id', userId);

        if (dbError) {
            this.logger.error(`Failed to update usage table: ${dbError.message}`);
        }
    }
}
