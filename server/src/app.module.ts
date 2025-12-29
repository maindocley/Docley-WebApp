import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AdminModule } from './admin/admin.module';
import { PostsModule } from './posts/posts.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Rate limiting configuration
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute in milliseconds
      limit: 60,  // 60 requests per minute globally
    }]),
    AiModule,
    UsersModule,
    DocumentsModule,
    SupabaseModule,
    AdminModule,
    PostsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply throttler globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
