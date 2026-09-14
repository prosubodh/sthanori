import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // 12-Factor Disposability: Enable Nest graceful shutdown hooks
  app.enableShutdownHooks();

  // API-First Swagger OpenAPI v3.1 Documentation
  const config = new DocumentBuilder()
    .setTitle('Sthanori API')
    .setDescription('Multi-Tenant Enterprise SaaS Core API')
    .setVersion('0.1.0')
    .addTag('Health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4000;
  await app.listen(port, '0.0.0.0');
  return { app, port };
}

// Only invoke listen if executed directly
if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    console.error('Fatal bootstrapping error:', err);
    process.exit(1);
  });
}
