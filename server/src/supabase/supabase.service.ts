import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.initializeClient();
    }

    private initializeClient() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase credentials missing in .env');
            // We don't throw here to avoid crashing the whole app on startup if env is missing,
            // but methods will fail. Ideally we should throw if critical.
            // For now, let's log error.
            return;
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }
}
