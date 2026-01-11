import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';

@Injectable()
export class FeedbackService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get client() {
        return this.supabaseService.getClient();
    }

    async submit(userId: string, rating: number, message: string) {
        // Map 0 to null to avoid check constraint violation (rating 1-5)
        const ratingValue = rating === 0 ? null : rating;

        const { data, error } = await this.client
            .from('feedback')
            .insert({
                user_id: userId,
                rating: ratingValue,
                message: message,
            })
            .select()
            .single();

        if (error) {
            console.error('[Feedback] Submission Error:', {
                error,
                userId,
                rating: ratingValue,
                messageLength: message?.length
            });
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }

    async findAll() {
        const { data, error } = await this.client
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data || [];
    }
}
