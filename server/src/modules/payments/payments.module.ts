import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SupabaseModule } from '../../core/supabase/supabase.module';

import { BillingController } from './billing.controller';

@Module({
  imports: [SupabaseModule], // Import SupabaseModule if needed for auth constraints, though Guard usually needs it globally or imported
  controllers: [PaymentsController, BillingController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule { }
