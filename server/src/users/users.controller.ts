import { Controller, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../supabase/supabase.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
@UseGuards(SupabaseGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Patch('password')
    async updatePassword(@Req() req, @Body() dto: UpdatePasswordDto) {
        return this.usersService.updatePassword(req.user.id, dto.newPassword);
    }
}
