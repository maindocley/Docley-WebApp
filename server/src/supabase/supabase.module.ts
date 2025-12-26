import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseGuard } from './supabase.guard';

@Global()
@Module({
    providers: [SupabaseService, SupabaseGuard],
    exports: [SupabaseService, SupabaseGuard],
})
export class SupabaseModule { }
