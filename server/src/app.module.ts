import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { SupabaseModule } from './core/supabase/supabase.module';
import { UsersModule } from './modules/users/users.module';
import { ChatModule } from './modules/chat/chat.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { PostsModule } from './modules/posts/posts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AdminModule } from './modules/admin/admin.module';
import { SubscriptionGuard } from './common/guards/subscription.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    SupabaseModule,
    UsersModule,
    ChatModule,
    DocumentsModule,
    FeedbackModule,
    PostsModule,
    NotificationsModule,
    WebhooksModule,
    AdminModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [
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
