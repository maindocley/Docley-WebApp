import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PublicPostsController } from './public-posts.controller';
import { PostsService } from './posts.service';
import { SupabaseModule } from '../../core/supabase/supabase.module';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [SupabaseModule, AdminModule],
    controllers: [PostsController, PublicPostsController],
    providers: [PostsService],
})
export class PostsModule { }

