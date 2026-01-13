import {
  Controller,
  Post,
  Headers,
  Body,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post('whop')
  async handleWhopWebhook(
    @Headers('whop-signature') signature: string,
    @Body() payload: any,
  ) {
    // Whop sends signature in 'whop-signature' header usually,
    // or 'x-whop-signature'. Checking both if needed, but 'whop-signature' is standard v1.

    if (!payload) {
      throw new BadRequestException('Missing payload');
    }

    this.logger.log('Received Whop webhook');

    try {
      return await this.paymentsService.handleWebhook(signature, payload);
    } catch (error) {
      this.logger.error(`Webhook handling failed: ${error.message}`);
      // Return 200 to acknowledge receipt even if processing failed to avoid retries loops for non-transient errors
      // or let it fail if we want retries. Usually 200 is safer if logic fails.
      return { success: false, error: error.message };
    }
  }
}
