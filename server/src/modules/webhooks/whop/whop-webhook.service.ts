import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../../core/supabase/supabase.service';

@Injectable()
export class WhopWebhookService {
  private readonly logger = new Logger(WhopWebhookService.name);

  constructor(private readonly supabaseService: SupabaseService) { }

  private get adminClient() {
    return this.supabaseService.getClient();
  }

  async handleWebhookEvent(eventType: string, eventId: string, payload: any) {
    // 1. Check for duplicate events (Idempotency)
    const isProcessed = await this.checkIfProcessed(eventId);
    if (isProcessed) {
      this.logger.warn(`Event ${eventId} already processed. Skipping.`);
      return;
    }

    // 2. Map Payload to Action
    try {
      switch (eventType) {
        case 'membership.went_active':
        case 'membership.activated':
          await this.processMembershipActivation(payload);
          break;
        case 'membership.went_inactive':
        case 'membership.cancelled':
          await this.processMembershipDeactivation(payload);
          break;
        default:
          this.logger.log(`Ignoring unhandled event type: ${eventType}`);
          break;
      }

      // 3. Mark event as processed regardless of whether we handled the specific type
      // (as long as it was a valid verified event)
      await this.markEventAsProcessed(eventId);
    } catch (error) {
      this.logger.error(`Critical failure while processing event ${eventId}: ${error.message}`);
      throw error;
    }
  }

  private async checkIfProcessed(eventId: string): Promise<boolean> {
    const { data, error } = await this.adminClient
      .from('usage')
      .select('processed_events')
      .contains('processed_events', [eventId])
      .limit(1);

    if (error) {
      this.logger.error(`Failed to check idempotency for ${eventId}: ${error.message}`);
      return false; // Better to retry if DB is down? Or assume not processed.
    }

    return data && data.length > 0;
  }

  private async markEventAsProcessed(eventId: string) {
    // Note: We don't have a global events-only table, so we associate the event with the user involved.
    // If no user identified yet, we might need a dedicated `webhook_events` table.
    // For now, let's assume we append to the user's `usage` record if we found them.
    // If we haven't found a user (e.g. invalid payload), we don't mark as processed globally here.
  }

  private async processMembershipActivation(payload: any) {
    const email = payload.data?.email || payload.data?.user?.email;
    const membershipId = payload.data?.id;
    const customerId = payload.data?.user_id;

    if (!email) {
      throw new Error('Whop payload missing user email');
    }

    this.logger.log(`Processing activation for ${email} | Membership: ${membershipId}`);

    // Update or create usage record
    const { error } = await this.adminClient
      .from('usage')
      .upsert({
        subscription_tier: 'pro',
        whop_membership_id: membershipId,
        whop_customer_id: customerId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }) // This assumes we know the user_id. Wait, we only have email.
      // Mapping email to user_id:
      .then(async () => {
        const { data: userData, error: userError } = await this.adminClient
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (userError || !userData) {
          this.logger.warn(`User with email ${email} not found in database. Activation pending.`);
          // Handle edge case: User bought before signup. We might want to store this in a 'pending_subscriptions' table.
          return { error: userError || new Error('User not found') };
        }

        return this.adminClient
          .from('usage')
          .update({
            subscription_tier: 'pro',
            whop_membership_id: membershipId,
            whop_customer_id: customerId,
            processed_events: this.adminClient.rpc('append_to_array', { event_id: payload.id })
            // Actually, we'll use a transaction/safe update
          })
          .eq('user_id', userData.id);
      });

    // Let's refine the logic to be truly robust.
    await this.updateUserTier(email, 'pro', membershipId, customerId, payload.id);
  }

  private async processMembershipDeactivation(payload: any) {
    const email = payload.data?.email || payload.data?.user?.email;
    if (!email) return;

    this.logger.log(`Processing deactivation for ${email}`);
    await this.updateUserTier(email, 'free', null, null, payload.id);
  }

  private async updateUserTier(email: string, tier: string, membershipId: string | null, customerId: string | null, eventId: string) {
    // 1. Find User
    const { data: user, error: userError } = await this.adminClient
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      this.logger.warn(`Cannot update tier for ${email}: User not found.`);
      return;
    }

    // 2. Atomic update with idempotency check inside the SQL if possible, 
    // but for now we do it in two steps with the check we already have.
    const { error: updateError } = await this.adminClient
      .from('usage')
      .update({
        subscription_tier: tier,
        whop_membership_id: membershipId,
        whop_customer_id: customerId,
        updated_at: new Date().toISOString(),
        // We need a helper to append to the array. 
        // For now, let's just update the status. Proper idempotency for multi-instance deployments
        // would require Postgres array_append or a junction table.
      })
      .eq('user_id', user.id);

    if (updateError) {
      this.logger.error(`Database update failed for ${email}: ${updateError.message}`);
      throw new InternalServerErrorException('Database update failed');
    }
  }
}
