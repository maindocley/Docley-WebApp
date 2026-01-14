import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { WhopWebhookService } from './whop-webhook.service';
import { WhopSignatureService } from './whop-signature.service';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('webhooks')
export class WhopWebhookController {
  private readonly logger = new Logger(WhopWebhookController.name);

  constructor(
    private readonly whopWebhookService: WhopWebhookService,
    private readonly signatureService: WhopSignatureService,
  ) { }

  @Public()
  @Post('whop')
  async handleWebhook(
    @Req() req: any,
    @Headers('whop-signature') signature: string,
    @Headers('whop-id') id: string,
    @Headers('whop-timestamp') timestamp: string,
  ) {
    const rawBody = req.rawBody?.toString();
    if (!rawBody) {
      this.logger.error('Received webhook with empty raw body');
      throw new BadRequestException('Empty body');
    }

    // Strict Authorization Check
    const isValid = this.signatureService.verifySignature(
      signature,
      id,
      timestamp,
      rawBody,
    );

    if (!isValid) {
      this.logger.warn(`Unauthorized Whop Webhook attempt. ID: ${id}`);
      throw new UnauthorizedException('Invalid signature');
    }

    try {
      const payload = JSON.parse(rawBody);
      const eventType = payload.action || payload.type;

      this.logger.log(`Whop Webhook Verified: ${eventType} | ID: ${id}`);

      // Delegate to service for business logic
      await this.whopWebhookService.handleWebhookEvent(eventType, id, payload);

      return { received: true };
    } catch (error) {
      this.logger.error(`Failed to process Whop webhook: ${error.message}`);
      // Return 200 even on some processing failures if we already verified the signature
      // but if it's a critical error we might want Whop to retry.
      // NestJS will handle the exception and return a non-200 by default.
      throw new InternalServerErrorException('Webhook processing failed');
    }
  }
}
