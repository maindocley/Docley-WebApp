import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class UsageGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const usage = await this.usersService.getOrCreateUsage(user.id);

    // Admin exemption: unlimited usage
    if (usage?.role === 'admin') {
      return true;
    }

    // Paid users bypass limits (prefer users.is_premium; fallback to legacy usage.subscription_tier)
    if (usage?.is_premium === true || usage?.subscription_tier === 'pro') {
      return true;
    }

    const path: string = request.route?.path || request.path || '';

    try {
      // Documents create: consume a document slot
      if (path === '/documents' && request.method === 'POST') {
        await this.usersService.consumeDocument(user.id);
        return true;
      }

      // AI endpoint: decide based on mode
      if (path === '/ai/transform' && request.method === 'POST') {
        const mode = request.body?.mode;
        if (mode === 'diagnostic' || mode === 'analysis') {
          await this.usersService.consumeAiDiagnostic(user.id);
        } else if (mode === 'upgrade' || mode === 'transform') {
          await this.usersService.consumeAiUpgrade(user.id);
        }
        return true;
      }
    } catch (e: any) {
      const message = e?.message || '';
      if (message.toLowerCase().includes('limit')) {
        throw new ForbiddenException({
          error: 'Limit Reached',
          message:
            'You have reached your free lifetime limit. Please upgrade to Pro for unlimited access.',
        });
      }
      throw e;
    }

    return true;
  }
}
