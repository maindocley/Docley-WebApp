import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_PREMIUM_KEY } from '../decorators/require-premium.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(
    private reflector: Reflector,
    private supabaseService: SupabaseService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route or controller is marked as Public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug(`Accessing public route: ${context.getHandler().name}`);
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    // Verify Supabase JWT
    const {
      data: { user },
      error,
    } = await this.supabaseService.getClient().auth.getUser(token);

    if (error || !user) {
      this.logger.error('Supabase Auth verification failed:', error?.message);
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user to request
    request.user = user;

    // 2. Check if route requires Premium
    const requirePremium = this.reflector.getAllAndOverride<boolean>(
      IS_PREMIUM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requirePremium) {
      // Query backend database for subscription status
      const { data: usage, error: usageError } = await this.supabaseService
        .getClient()
        .from('usage')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (usageError || !usage || usage.subscription_tier !== 'pro') {
        this.logger.warn(`User ${user.id} tried to access premium route without active subscription`);
        throw new ForbiddenException('Premium subscription required');
      }
    }

    return true;
  }
}
