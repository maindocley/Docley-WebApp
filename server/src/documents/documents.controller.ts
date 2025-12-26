import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
    Req
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { SupabaseGuard } from '../supabase/supabase.guard';

@Controller('documents')
@UseGuards(SupabaseGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post()
    async create(@Req() req, @Body() body: any) {
        return this.documentsService.create(req.user.id, body);
    }

    @Get()
    async findAll(@Req() req) {
        return this.documentsService.findAll(req.user.id);
    }

    @Get(':id')
    async findOne(@Req() req, @Param('id') id: string) {
        return this.documentsService.findOne(id, req.user.id);
    }

    @Patch(':id')
    async update(@Req() req, @Param('id') id: string, @Body() body: any) {
        return this.documentsService.update(id, body, req.user.id);
    }
}
