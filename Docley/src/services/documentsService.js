import { supabase } from '../lib/supabase';

/**
 * Documents Service
 * Handles all CRUD operations for documents
 */

// Create a new document
export async function createDocument(documentData) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('documents')
        .insert({
            user_id: user.id,
            title: documentData.title,
            content: documentData.content || '',
            content_html: documentData.contentHtml || '',
            academic_level: documentData.academicLevel || 'undergraduate',
            citation_style: documentData.citationStyle || 'APA 7th Edition',
            document_type: documentData.documentType || 'Essay',
            file_url: documentData.fileUrl || null,
            file_name: documentData.fileName || null,
            file_size: documentData.fileSize || null,
            status: 'draft',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Get all documents for the current user
export async function getDocuments({ limit = 50, offset = 0, status = null } = {}) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

// Get a single document by ID
export async function getDocument(id) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

    if (error) throw error;
    return data;
}

// Update a document
export async function updateDocument(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const updateData = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.contentHtml !== undefined) updateData.content_html = updates.contentHtml;
    if (updates.upgradedContent !== undefined) updateData.upgraded_content = updates.upgradedContent;
    if (updates.academicLevel !== undefined) updateData.academic_level = updates.academicLevel;
    if (updates.citationStyle !== undefined) updateData.citation_style = updates.citationStyle;
    if (updates.documentType !== undefined) updateData.document_type = updates.documentType;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Soft delete a document
export async function deleteDocument(id) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('documents')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
    return true;
}

// Permanently delete a document (admin use)
export async function permanentlyDeleteDocument(id) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
    return true;
}

// Auto-save document content (debounced in component)
export async function autoSaveDocument(id, content, contentHtml) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('documents')
        .update({
            content,
            content_html: contentHtml,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, updated_at, word_count')
        .single();

    if (error) throw error;
    return data;
}

// Get document count for user
export async function getDocumentCount() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null);

    if (error) throw error;
    return count || 0;
}
