import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PostsService {
    private supabase;

    constructor(private readonly supabaseService: SupabaseService) {
        this.supabase = this.supabaseService.getClient();
    }

    async findAll() {
        const { data, error } = await this.supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch posts: ${error.message}`);
        }
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new NotFoundException(`Post not found: ${error.message}`);
        }
        return data;
    }

    async create(postData: {
        title: string;
        slug: string;
        content: string;
        cover_image?: string;
        tags?: string;
        published?: boolean;
        author_id: string;
    }) {
        const { data, error } = await this.supabase
            .from('posts')
            .insert({
                ...postData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create post: ${error.message}`);
        }
        return data;
    }

    async update(id: string, postData: Partial<{
        title: string;
        slug: string;
        content: string;
        cover_image?: string;
        tags?: string;
        published?: boolean;
    }>) {
        const { data, error } = await this.supabase
            .from('posts')
            .update({
                ...postData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update post: ${error.message}`);
        }
        return data;
    }

    async delete(id: string) {
        const { error } = await this.supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete post: ${error.message}`);
        }
        return { message: 'Post deleted successfully', id };
    }
}
