import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard'; // Acts as AuthGuard

interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        id: string;
        email?: string;
    }
}

// User requested POST /api/payments/create-session
@Controller('api/payments')
@UseGuards(SubscriptionGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create-session')
    async createCheckoutSession(@Req() req: any, @Body() body: { redirectUrl?: string }) {
        const userId = req.user?.sub || req.user?.id;

        // User requested http://localhost:5173/dashboard?payment=success as success_url
        // We can default to that or use what the frontend sends if flexible
        const successUrl = body.redirectUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?session=success`;

        return this.paymentsService.createCheckoutSession(userId, successUrl);
    }
}
