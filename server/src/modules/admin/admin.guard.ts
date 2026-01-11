import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';

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

        // Backend source of truth: check admin role from public.users
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            throw new InternalServerErrorException('Failed to load user role');
        }

        if (!profile || profile.role !== 'admin') {
            throw new ForbiddenException('Access denied. Admin role required.');
        }

        // Attach user to request for downstream use
        request.user = user;
        request.profile = profile;
        return true;
    }
}
