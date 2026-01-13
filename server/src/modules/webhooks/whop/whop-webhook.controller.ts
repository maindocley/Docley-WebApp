import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as express from 'express';
import * as crypto from 'crypto';
import { WhopWebhookService } from './whop-webhook.service';

@Controller('api/webhooks/whop')
export class WhopWebhookController {
  private readonly logger = new Logger(WhopWebhookController.name);

  constructor(private readonly whopWebhookService: WhopWebhookService) { }

  @Post()
  async handleWebhook(
    @Req() req: any,
    @Headers('whop-signature') signature: string,
    @Headers('whop-id') id: string,
    @Headers('whop-timestamp') timestamp: string,
  ) {
    const secret = process.env.WHOP_WEBHOOK_SECRET;

    if (!secret) {
      this.logger.error(
        'WHOP_WEBHOOK_SECRET is not defined in environment variables',
      );
      throw new InternalServerErrorException('Configuration error');
    }

    if (!signature || !id || !timestamp) {
      throw new BadRequestException('Missing Whop headers');
    }

    // Verify Signature
    const rawBody = req.rawBody?.toString();
    if (!rawBody) {
      throw new BadRequestException('Empty body');
    }

    const signedContent = `${id}.${timestamp}.${rawBody}`;
    const secretKey = secret.startsWith('wh_secret_')
      ? secret.slice(10)
      : secret;

    // Whop signatures (SVIX) are HMAC SHA256 base64
    // The header contains "v1,SIGNATURE"
    const expectedSignatures = signature.split(' ').map((s) => s.split(',')[1]);

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signedContent);
    const mySignature = hmac.digest('base64');

    if (!expectedSignatures.includes(mySignature)) {
      this.logger.warn('Invalid Whop signature');
      throw new UnauthorizedException('Invalid signature');
    }

    // Handle Events
    const payload = JSON.parse(rawBody);
    const eventType = payload.action || payload.type;

    // User requested this specific log line
    console.log('Whop Webhook Received: ', payload.action);
    this.logger.log(`Received Whop event: ${eventType}`);

    switch (eventType) {
      // Payment succeeded handler removed
      case 'membership.went_active':
      case 'membership.activated':
      case 'membership_activated':
        await this.whopWebhookService.handleMembershipActivated(payload);
        break;
      case 'membership.went_inactive':
      case 'membership.cancelled':
      case 'membership_deactivated':
        await this.whopWebhookService.handleMembershipDeactivated(payload);
        break;
      default:
        this.logger.log(`Unhandled event type: ${eventType}`);
    }

    return { received: true };
  }
}
