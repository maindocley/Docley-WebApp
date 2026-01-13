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
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as Public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
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

    // Payment system removed - premium checks no longer enforced
    // All authenticated users now have the same access level
    const requirePremium = this.reflector.getAllAndOverride<boolean>(
      IS_PREMIUM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requirePremium) {
      this.logger.warn(
        `@RequirePremium() decorator is deprecated - payment system removed`,
      );
    }

    return true;
  }
}
