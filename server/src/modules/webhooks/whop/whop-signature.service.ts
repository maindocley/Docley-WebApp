import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WhopSignatureService {
    private readonly logger = new Logger(WhopSignatureService.name);

    verifySignature(
        signature: string,
        id: string,
        timestamp: string,
        rawBody: string,
    ): boolean {
        const secret = process.env.WHOP_WEBHOOK_SECRET;

        if (!secret) {
            this.logger.error('WHOP_WEBHOOK_SECRET is missing from environment');
            return false;
        }

        if (!signature || !id || !timestamp) {
            this.logger.warn('Missing required Whop webhook headers');
            return false;
        }

        try {
            // Whop v2 signatures use SVIX standard
            // Signed content: <id>.<timestamp>.<body_string>
            const signedContent = `${id}.${timestamp}.${rawBody}`;

            // Secret key usually has 'ws_secret_' prefix to strip if needed, 
            // but Whop usually provides the raw secret or specifies format.
            // Based on provided secret "ws_...", we use it as is if it's the full key.
            const secretKey = secret;

            // Whop signature header format is often "v1,SIGNATURE_BASE64"
            const expectedSignatures = signature.split(' ').map((s) => {
                const parts = s.split(',');
                return parts.length > 1 ? parts[1] : parts[0];
            });

            const hmac = crypto.createHmac('sha256', secretKey);
            hmac.update(signedContent);
            const mySignature = hmac.digest('base64');

            const isValid = expectedSignatures.includes(mySignature);

            if (!isValid) {
                this.logger.warn(`Signature verification failed. Expected one of: ${expectedSignatures.join(', ')} | Got: ${mySignature}`);
            }

            return isValid;
        } catch (error) {
            this.logger.error(`Error verifying signature: ${error.message}`);
            return false;
        }
    }
}
