import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/documents`;

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
        file_name: documentData.fileName || null,
        file_size: documentData.fileSize || null,
        file_content: documentData.fileContent || null, // Store Base64 directly
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

// Get all documents for the current user with optional filtering
export async function getDocuments(filters = {}) {
    const headers = await getAuthHeaders();

    // Construct query parameters
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.academicLevel) params.append('academic_level', filters.academicLevel);
    if (filters.type) params.append('type', filters.type);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_URL}${queryString}`, {
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
    if (updates.margins !== undefined) updateData.margins = updates.margins;
    if (updates.headerText !== undefined) updateData.header_text = updates.headerText;
    if (updates.fileContent !== undefined) updateData.file_content = updates.fileContent;

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
export async function deleteDocument(id) {
    return updateDocument(id, { deleted_at: new Date().toISOString() });
}

// Permanently delete a document
export async function permanentlyDeleteDocument(id) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to permanently delete document');
    }

    return true;
}

// Auto-save document content (debounced in component)
export async function autoSaveDocument(id, content, contentHtml) {
    return updateDocument(id, { content, contentHtml });
}

// Get document count for user
export async function getDocumentCount() {
    const docs = await getDocuments();
    return docs.length;
}


