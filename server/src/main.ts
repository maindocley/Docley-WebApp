import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
const compression = require('compression');

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Set secure HTTP headers
  app.use(helmet());

  // Performance: Compress responses
  app.use(compression());

  // Enable CORS for local-first development and production fallback
  const allowedOrigins = [
    'http://localhost:5173',  // Local Vite
    'http://localhost:3000',  // Local NestJS (for internal testing)
    'http://127.0.0.1:5173',
    'https://docley.vercel.app' // Production Frontend
  ];

  // Also include any origins from environment variables
  if (process.env.CORS_ORIGINS) {
    allowedOrigins.push(...process.env.CORS_ORIGINS.split(','));
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Info', 'Apikey'],
  });

  // Global validation pipe - auto-reject malformed JSON/data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO types
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is listening on port ${port}`);
}
bootstrap();
