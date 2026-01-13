import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AdminGuard } from '../admin/admin.guard';

@Controller('notifications')
@UseGuards(AdminGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);
  constructor(private readonly notificationsService: NotificationsService) {}

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
    this.logger.log(`Deleting notification ${id}`);
    return this.notificationsService.delete(id);
  }
}
