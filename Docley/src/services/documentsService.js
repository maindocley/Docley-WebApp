import apiClient from '../api/client';

/**
 * Documents Service
 * Handles all CRUD operations for documents via the NestJS Backend
 */

export async function uploadDocumentFile(file, documentId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentId', documentId);

    const response = await apiClient.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.filePath;
}

export async function createDocument(documentData) {
    const payload = {
        title: documentData.title,
        content: documentData.content || '',
        content_html: documentData.contentHtml || '',
        academic_level: documentData.academicLevel || 'undergraduate',
        citation_style: documentData.citationStyle || 'APA 7th Edition',
        document_type: documentData.documentType || 'Essay',
        file_name: documentData.fileName || null,
        file_size: documentData.fileSize || null,
        file_url: documentData.fileUrl || null,
        status: 'draft',
    };

    const response = await apiClient.post('/documents', payload);
    return response.data;
}

export async function getDocuments(filters = {}) {
    try {
        const response = await apiClient.get('/documents', {
            params: {
                status: filters.status,
                academic_level: filters.academicLevel,
                type: filters.type,
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
}

export async function getDocument(id) {
    try {
        const response = await apiClient.get(`/documents/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching document ${id}:`, error);
        return null;
    }
}

export async function updateDocument(id, updates) {
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
    if (updates.fileUrl !== undefined) updateData.file_url = updates.fileUrl;
    if (updates.fileName !== undefined) updateData.file_name = updates.fileName;
    if (updates.fileSize !== undefined) updateData.file_size = updates.fileSize;

    const response = await apiClient.patch(`/documents/${id}`, updateData);
    return response.data;
}

export async function deleteDocument(id) {
    return updateDocument(id, { deleted_at: new Date().toISOString() });
}

export async function permanentlyDeleteDocument(id) {
    await apiClient.delete(`/documents/${id}`);
    return true;
}

export async function autoSaveDocument(id, content, contentHtml) {
    return updateDocument(id, { content, contentHtml });
}

export async function getDocumentCount() {
    const docs = await getDocuments();
    return docs.length;
}
