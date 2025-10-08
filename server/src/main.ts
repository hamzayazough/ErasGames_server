import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend application
  app.enableCors({
    origin: [
      'http://localhost:3001', // Next.js dev server
      'http://127.0.0.1:3001',
      'https://localhost:3001', // HTTPS variants
      'https://127.0.0.1:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
    ],
    exposedHeaders: ['Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
