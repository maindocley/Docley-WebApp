import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
const compression = require('compression');

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Security: Set secure HTTP headers with relaxed CSP for SPA + dev
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // allow inline styles (React/Tailwind runtime)
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Vite dev + some libs
          imgSrc: ["'self'", 'data:', 'blob:'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: [
            "'self'",
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            process.env.SUPABASE_URL || 'https://*.supabase.co',
            'ws:',
            'wss:',
          ],
          frameSrc: [
            "'self'",
            process.env.SUPABASE_URL || 'https://*.supabase.co',
          ],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Performance: Compress responses
  app.use(compression());

  // Enable CORS for local-first development and production fallback
  const allowedOrigins = [
    'http://localhost:5173', // Local Vite
    'http://localhost:5174', // Add this line - your actual frontend port
    'http://localhost:3000', // Local NestJS (for internal testing)
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174', // Add this too
    'https://docley.vercel.app', // Production Frontend
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  // Also include any origins from environment variables
  if (process.env.CORS_ORIGINS) {
    allowedOrigins.push(...process.env.CORS_ORIGINS.split(','));
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') // Allow all Vercel preview deployments
      ) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Client-Info',
      'Apikey',
    ],
  });

  // Global validation pipe - auto-reject malformed JSON/data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO types
    }),
  );

  // Global exception filter for clear error reporting
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is listening on port ${port}`);

  // Keep-Alive Heartbeat: Ping self every 14 minutes to prevent Render free tier from sleeping
  const HEARTBEAT_INTERVAL = 14 * 60 * 1000; // 14 minutes in ms
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://docley.onrender.com';

  setInterval(async () => {
    try {
      const response = await fetch(`${RENDER_URL}/health`);
      if (response.ok) {
        console.log(`💓 Heartbeat successful at ${new Date().toISOString()}`);
      } else {
        console.log(`💔 Heartbeat failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`💔 Heartbeat failed: ${error.message}`);
    }
  }, HEARTBEAT_INTERVAL);
}
bootstrap();
