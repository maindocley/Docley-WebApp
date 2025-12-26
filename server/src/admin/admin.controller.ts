import { Controller, Get, Patch, Delete, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard) // Secured with AdminGuard - requires role: 'admin'
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('users')
    async listUsers() {
        return this.adminService.listUsers();
    }

    @Patch('users/:id/status')
    async updateUserStatus(@Param('id') id: string, @Body('status') status: string) {
        if (status !== 'active' && status !== 'banned') {
            throw new BadRequestException('Status must be either "active" or "banned"');
        }
        return this.adminService.updateUserStatus(id, status);
    }

    @Delete('users/:id')
    async deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }
}
