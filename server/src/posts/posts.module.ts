import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [SupabaseModule, AdminModule],
    controllers: [PostsController],
    providers: [PostsService],
})
export class PostsModule { }
