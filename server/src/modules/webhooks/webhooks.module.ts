import { Module } from '@nestjs/common';
import { WhopWebhookController } from './whop/whop-webhook.controller';
import { WhopWebhookService } from './whop/whop-webhook.service';
import { WhopSignatureService } from './whop/whop-signature.service';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [WhopWebhookController],
  providers: [WhopWebhookService, WhopSignatureService],
  exports: [WhopWebhookService, WhopSignatureService],
})
export class WebhooksModule { }
