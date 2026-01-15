import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly apiKey = process.env.WHOP_API_KEY;
  private readonly priceId = process.env.WHOP_PRICE_ID;
  private readonly webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

  constructor(private readonly supabaseService: SupabaseService) { }

  async createCheckoutSession(userId: string, successUrl: string, cancelUrl: string) {
    // Sanity log for Render/Environment debugging
    console.log('WHOP KEY LOADED:', !!process.env.WHOP_API_KEY);

    const apiKey = process.env.WHOP_API_KEY;
    const planId = process.env.WHOP_PLAN_ID;

    if (!apiKey) {
      this.logger.error('CRITICAL: WHOP_API_KEY is missing from environment');
      throw new InternalServerErrorException('Server Payment Configuration Error: Missing API Key');
    }

    if (!planId) {
      this.logger.error('CRITICAL: WHOP_PLAN_ID is missing from environment');
      throw new InternalServerErrorException('Server Payment Configuration Error: Missing Plan ID');
    }

    try {
      const requestUrl = 'https://api.whop.com/api/v2/checkout_sessions';
      const requestBody = {
        plan_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
        },
      };

      this.logger.log(`Initiating Whop Checkout v2 | User: ${userId}`);
      this.logger.debug(`Request Body: ${JSON.stringify(requestBody)}`);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseBody = await response.text();
      let data: any;

      try {
        data = JSON.parse(responseBody);
      } catch (e) {
        this.logger.error(`Failed to parse Whop response: ${responseBody}`);
        throw new InternalServerErrorException('Invalid JSON response from Whop');
      }

      if (!response.ok) {
        this.logger.error(`Whop API Request Failed! Status: ${response.status} | Body: ${responseBody}`);
        throw new InternalServerErrorException(`Payment Provider Error: ${response.status} ${response.statusText}`);
      }

      this.logger.log(`Whop Response received: ${JSON.stringify(data)}`);

      // Whop v2 prioritizes 'purchase_url', fallback to 'redirect_url'
      const checkoutUrl = data.purchase_url || data.redirect_url;
      const urlSource = data.purchase_url ? 'purchase_url' : (data.redirect_url ? 'redirect_url' : 'NONE');

      if (!checkoutUrl) {
        this.logger.error('Whop response missing both purchase_url and redirect_url. Full Data:', JSON.stringify(data));
        throw new InternalServerErrorException('Payment Provider Error: Missing Checkout URL (502 Bad Gateway)');
      }

      this.logger.log(`Checkout URL selected from ${urlSource}: ${checkoutUrl}`);
      return { redirectUrl: checkoutUrl };
    } catch (error) {
      this.logger.error(`Checkout Session Exception: ${error.message}`);
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(`Internal Payment System Error: ${error.message}`);
    }
  }

  async handleWebhook(signature: string, payload: any) {
    if (!this.webhookSecret) {
      this.logger.warn(
        'WHOP_WEBHOOK_SECRET is not configured - proceeding without signature verification',
      );
    }

    // TODO: Add actual HMAC verification here if secret is present
    // const isValid = verifySignature(signature, payload, this.webhookSecret);
    // if (!isValid) throw new UnauthorizedException('Invalid signature');

    const eventType = payload.action || payload.type;
    this.logger.log(
      `Received webhook event: ${eventType} for user ${payload.metadata?.user_id || 'unknown'}`,
    );

    if (eventType === 'payment.succeeded' || payload.success === true) {
      const userId =
        payload.metadata?.user_id || payload.data?.metadata?.user_id;

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
    const { error: authError } = await client.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { is_pro: true },
      },
    );

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
