import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { SupabaseGuard } from '../supabase/supabase.guard';

@Controller('ai')
@UseGuards(SupabaseGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('transform')
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute for AI endpoints
    async transform(@Body() body: { text: string; instruction: string; mode: string }) {
        return this.aiService.processText(body.text, body.instruction, body.mode);
    }
}
