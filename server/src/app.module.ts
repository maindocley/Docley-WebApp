import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { DocumentsModule } from './documents/documents.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PostsModule } from './posts/posts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AdminModule } from './admin/admin.module';
import { SubscriptionGuard } from './common/guards/subscription.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    SupabaseModule,
    UsersModule,
    AiModule,
    DocumentsModule,
    FeedbackModule,
    PostsModule,
    NotificationsModule,
    WebhooksModule,
    AdminModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule { }
