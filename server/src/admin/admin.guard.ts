import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

// Hardcoded admin email - only this user can access admin endpoints
const ADMIN_EMAIL = 'maindocley@gmail.com';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly supabaseService: SupabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = this.supabaseService.getClient();

        // Verify user from JWT
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new UnauthorizedException('Invalid token');
        }

        // Check if user email matches the hardcoded admin email
        if (user.email !== ADMIN_EMAIL) {
            throw new ForbiddenException('Access denied. You are not authorized to access admin resources.');
        }

        // Attach user to request for downstream use
        request.user = user;
        return true;
    }
}
