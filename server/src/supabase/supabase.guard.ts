import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class SupabaseGuard implements CanActivate {
    constructor(private readonly supabaseService: SupabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('No authorization header found');
        }

        const token = authHeader.replace('Bearer ', '');
        const client = this.supabaseService.getClient();

        const { data: { user }, error } = await client.auth.getUser(token);

        if (error || !user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        request.user = user;
        return true;
    }
}
