import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SupabaseService {
    private supabase?: SupabaseClient;

    constructor() {
        this.initializeClient();
    }

    private initializeClient() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('CRITICAL CONFIG ERROR: Supabase credentials missing. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in the server .env for admin operations.');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    getClient(): SupabaseClient {
        if (!this.supabase) {
            throw new InternalServerErrorException('Supabase client is not initialized');
        }
        return this.supabase;
    }
}
