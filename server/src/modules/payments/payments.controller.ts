import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    id: string;
    email?: string;
  };
}

// User requested POST /api/payments/create-session
@Controller('api/payments')
@UseGuards(SubscriptionGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create-session')
  async createCheckoutSession(
    @Req() req: any,
    @Body() body: { redirectUrl?: string },
  ) {
    const userId = req.user?.sub || req.user?.id;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Dynamic success and cancel URLs
    const successUrl = body.redirectUrl || `${baseUrl}/dashboard?session=success`;
    const cancelUrl = `${baseUrl}/dashboard?session=canceled`;

    return this.paymentsService.createCheckoutSession(userId, successUrl, cancelUrl);
  }
}
