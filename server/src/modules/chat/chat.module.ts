import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule, UsersModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
