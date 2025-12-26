import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DocumentsService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get client() {
        return this.supabaseService.getClient();
    }

    async create(userId: string, data: any) {
        const { data: document, error } = await this.client
            .from('documents')
            .insert({
                ...data,
                user_id: userId,
                status: data.status || 'draft',
            })
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return document;
    }

    async findAll(userId: string) {
        const { data, error } = await this.client
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }

    async findOne(id: string, userId: string) {
        const { data, error } = await this.client
            .from('documents')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

        if (error) {
            // Supabase returns a specific error code for no rows, but usually simple error check suffices or checking data
            if (error.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
                throw new NotFoundException('Document not found');
            }
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }

    async update(id: string, updates: any, userId: string) {
        const { data, error } = await this.client
            .from('documents')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }
}
