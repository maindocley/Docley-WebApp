import apiClient from '../api/client';

/**
 * Blog Service - Public API for blog posts
 * No authentication required - for visitors to read published posts
 */

/**
 * Fetch all published blog posts
 * @returns {Promise<Array>} Array of published posts
 */
export async function getPublishedPosts() {
    try {
        const response = await apiClient.get('/posts');
        return response.data;
    } catch (error) {
        console.error('Error fetching published posts:', error);
        return [];
    }
}

/**
 * Fetch a single post by its URL slug
 * @param {string} slug - The URL slug of the post
 * @returns {Promise<Object|null>} The post object or null if not found
 */
export async function getPostBySlug(slug) {
    try {
        const response = await apiClient.get(`/posts/${slug}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        console.error('Error fetching post:', error);
        return null;
    }
}

/**
 * Fetch a single post by its ID (for backwards compatibility)
 * @param {string} id - The UUID of the post
 * @returns {Promise<Object|null>} The post object or null if not found
 */
export async function getPostById(id) {
    try {
        const posts = await getPublishedPosts();
        return posts.find(p => p.id === id) || null;
    } catch (error) {
        console.error('Error fetching post by ID:', error);
        return null;
    }
}
