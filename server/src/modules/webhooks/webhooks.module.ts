import { Module } from '@nestjs/common';
import { WhopWebhookController } from './whop/whop-webhook.controller';
import { WhopWebhookService } from './whop/whop-webhook.service';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [WhopWebhookController],
    providers: [WhopWebhookService],
})
export class WebhooksModule { }
