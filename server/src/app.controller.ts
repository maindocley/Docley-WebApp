import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('ai')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('transform')
  async transform(@Body() body: { text: string; instruction: string; mode: string }) {
    return this.appService.processText(body.text, body.instruction, body.mode);
  }
}
