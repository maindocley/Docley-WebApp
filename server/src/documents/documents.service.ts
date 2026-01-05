import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DocumentsService {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly notificationsService: NotificationsService
    ) { }

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
            .eq('user_id', userId);
        // .is('deleted_at', null); // Simplified to resolve parsing error

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
        // Get current document to check status changes
        const currentDoc = await this.findOne(id, userId);

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

        // Create notifications for status changes
        if (updates.status && updates.status !== currentDoc.status) {
            try {
                if (updates.status === 'upgraded') {
                    await this.notificationsService.create({
                        type: 'document_upgraded',
                        title: 'Document Upgraded',
                        message: `User upgraded document: ${data.title}`,
                        metadata: { user_id: userId, document_id: id, title: data.title }
                    });
                } else if (updates.status === 'exported') {
                    await this.notificationsService.create({
                        type: 'document_exported',
                        title: 'Document Exported',
                        message: `User exported document: ${data.title}`,
                        metadata: { user_id: userId, document_id: id, title: data.title }
                    });
                }
            } catch (notifError) {
                // Don't fail the update if notification creation fails
                console.error('Failed to create notification:', notifError);
            }
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
