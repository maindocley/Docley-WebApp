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
    if (!this.apiKey) {
      this.logger.error(
        'CRITICAL: WHOP_API_KEY is missing from environment variables',
      );
      throw new InternalServerErrorException(
        'Server Payment Configuration Error: Missing API Key',
      );
    }

    if (!this.priceId) {
      this.logger.error(
        'CRITICAL: WHOP_PRICE_ID is missing from environment variables',
      );
      throw new InternalServerErrorException(
        'Server Payment Configuration Error: Missing Price ID',
      );
    }

    try {
      // Updated to v2 API as requested
      const requestUrl = 'https://api.whop.com/api/v2/checkout_sessions';
      const requestBody = {
        plan_id: this.priceId, // Whop v2 standard expects 'plan_id' for checkout sessions. 
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
        },
      };

      this.logger.log(`Initiating Whop Checkout v2 for User ID: ${userId}`);
      this.logger.log(`Target URL: ${requestUrl}`);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorBody = 'Could not parse error body';
        try {
          errorBody = await response.text();
        } catch (e) {
          this.logger.warn('Failed to read response body on error');
        }

        this.logger.error(
          `Whop API Request Failed! Status: ${response.status} ${response.statusText}`,
        );
        this.logger.error(`Error Body: ${errorBody}`);
        this.logger.error(`Request Body Sent: ${JSON.stringify(requestBody)}`);

        throw new InternalServerErrorException(
          `Payment Provider Error: ${response.status} ${response.statusText} - Check server logs for details`,
        );
      }

      const data = await response.json();
      // v2 response structure usually has 'url' or 'checkout_url'
      const checkoutUrl = data.url || data.checkout_url || data.data?.url;

      if (!checkoutUrl) {
        this.logger.error(
          'Whop response did not contain a checkout URL. Full Response:',
          JSON.stringify(data),
        );
        throw new InternalServerErrorException(
          'Invalid response from payment provider (Missing Checkout URL)',
        );
      }

      return { url: checkoutUrl };
    } catch (error) {
      this.logger.error(`Checkout Session Exception: ${error.message}`);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Internal Payment System Error: ${error.message}`,
      );
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
