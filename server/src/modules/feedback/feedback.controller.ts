import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async submit(
    @Body() body: { rating: number; message: string },
    @Req() req: any,
  ) {
    // userId is guaranteed by SupabaseGuard
    const userId = req.user.id;
    return this.feedbackService.submit(userId, body.rating, body.message);
  }

  @Get()
  async findAll() {
    return this.feedbackService.findAll();
  }
}
