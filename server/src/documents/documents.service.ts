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
                user_id: userId, // Explicitly set the owner
                title: data.title,
                content: data.content || '',
                content_html: data.content_html || '',
                academic_level: data.academic_level || 'undergraduate',
                citation_style: data.citation_style || 'APA 7th Edition',
                document_type: data.document_type || 'Essay',
                file_name: data.file_name || null,
                file_size: data.file_size || null,
                file_url: data.file_url || null,
                file_content: data.file_content || null, // Store Base64 directly in DB
                margins: data.margins || { top: 96, bottom: 96, left: 96, right: 96 },
                header_text: data.header_text || '',
                status: data.status || 'draft',
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return document;
    }

    async findAll(userId: string, filters?: { status?: string; academic_level?: string }) {
        // Query documents STRICTLY owned by the current user
        let query = this.client
            .from('documents')
            .select('*')
            .eq('user_id', userId) // Enforce ownership
            .is('deleted_at', null);

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.academic_level) {
            query = query.eq('academic_level', filters.academic_level);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });

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
            .eq('user_id', userId) // Enforce ownership
            .is('deleted_at', null)
            .single();

        if (error) {
            throw new NotFoundException('Document not found');
        }

        return { ...data, permission: 'owner' };
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

    async remove(id: string, userId: string) {
        const { data, error } = await this.client
            .from('documents')
            .delete()
            .eq('id', id)
            .eq('user_id', userId) // Only owner can delete
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }

}
