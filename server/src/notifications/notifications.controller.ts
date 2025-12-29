import { Controller, Get, Patch, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseGuard } from '../supabase/supabase.guard';
import { AdminGuard } from '../admin/admin.guard';

@Controller('notifications')
@UseGuards(SupabaseGuard, AdminGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async findAll() {
        return this.notificationsService.findAll();
    }

    @Get('unread-count')
    async getUnreadCount() {
        return { count: await this.notificationsService.getUnreadCount() };
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Patch('read-all')
    async markAllAsRead() {
        return this.notificationsService.markAllAsRead();
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.notificationsService.delete(id);
    }
}

