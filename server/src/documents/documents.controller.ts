import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Req
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { SupabaseGuard } from '../supabase/supabase.guard';
import { UsageGuard } from '../users/guards/usage.guard';
import { UsersService } from '../users/users.service';

@Controller('documents')
@UseGuards(SupabaseGuard)
export class DocumentsController {
    constructor(
        private readonly documentsService: DocumentsService,
        private readonly usersService: UsersService
    ) { }

    @Post()
    @UseGuards(UsageGuard)
    async create(@Req() req, @Body() body: any) {
        const doc = await this.documentsService.create(req.user.id, body);
        await this.usersService.incrementUsage(req.user.id);
        return doc;
    }

    @Get()
    async findAll(
        @Req() req,
        @Query('status') status?: string,
        @Query('academic_level') academicLevel?: string,
    ) {
        return this.documentsService.findAll(req.user.id, {
            status,
            academic_level: academicLevel,
        });
    }

    @Get(':id')
    async findOne(@Req() req, @Param('id') id: string) {
        return this.documentsService.findOne(id, req.user.id);
    }

    @Patch(':id')
    async update(@Req() req, @Param('id') id: string, @Body() body: any) {
        return this.documentsService.update(id, body, req.user.id);
    }

    @Delete(':id')
    async remove(@Req() req, @Param('id') id: string) {
        return this.documentsService.remove(id, req.user.id);
    }


}
