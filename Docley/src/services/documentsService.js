import { supabase } from '../lib/supabase';

const API_URL = 'http://localhost:3000/documents';

/**
 * Documents Service
 * Handles all CRUD operations for documents via the NestJS Backend
 */

// Helper to get authorization header
const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('User not authenticated');
    }
    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
    };
};

// Create a new document
export async function createDocument(documentData) {
    const headers = await getAuthHeaders();

    // Construct payload matching the backend expectation
    const payload = {
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
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create document');
    }

    return await response.json();
}

// Get all documents for the current user
export async function getDocuments() {
    const headers = await getAuthHeaders();

    const response = await fetch(API_URL, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch documents');
    }

    return await response.json();
}

// Get a single document by ID
export async function getDocument(id) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Document not found');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch document');
    }

    return await response.json();
}

// Update a document
export async function updateDocument(id, updates) {
    const headers = await getAuthHeaders();

    const updateData = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.contentHtml !== undefined) updateData.content_html = updates.contentHtml;
    if (updates.upgradedContent !== undefined) updateData.upgraded_content = updates.upgradedContent;
    if (updates.academicLevel !== undefined) updateData.academic_level = updates.academicLevel;
    if (updates.citationStyle !== undefined) updateData.citation_style = updates.citationStyle;
    if (updates.documentType !== undefined) updateData.document_type = updates.documentType;
    if (updates.status !== undefined) updateData.status = updates.status;

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update document');
    }

    return await response.json();
}

// Soft delete a document
// NOT YET IMPLEMENTED IN BACKEND - Keeping frontend implementation for momentary fallback or needs backend update
// Based on plan, this should also be API call. Assuming Delete endpoint on backend is next or use Update.
// For now, mapping delete to update status/deleted_at via Patch if supported, or leaving strict delete.
// Request only asked for GET, POST, PATCH. I will use PATCH to soft delete if possible, 
// or I will implement DELETE endpoint in backend quickly if necessary? 
// The user prompt only asked for create, update, findAll, findOne methods in backend.
// So I will comment out delete functionality or implement it via PATCH { deleted_at: ... } if backend supports it.
// Checking backend service... update takes 'updates: any'. So yes!

export async function deleteDocument(id) {
    return updateDocument(id, { deleted_at: new Date().toISOString() });
}

export async function permanentlyDeleteDocument(id) {
    // Admin only, or requires DELETE endpoints not yet built.
    // For now throwing error or omitting to stay consistent with instructions.
    throw new Error("Permanently delete not supported in this API version yet.");
}

// Auto-save document content (debounced in component)
export async function autoSaveDocument(id, content, contentHtml) {
    return updateDocument(id, { content, contentHtml });
}

// Get document count for user
// This usually requires a specific count endpoint or counting based on getDocuments.
// To keep it simple and performant, we can assume the dashboard might need a separate endpoint
// or just fetch all and count for now (performance hit on simple implementations).
// Ideally backend should have /documents/stats.
export async function getDocumentCount() {
    const docs = await getDocuments();
    return docs.length;
}
