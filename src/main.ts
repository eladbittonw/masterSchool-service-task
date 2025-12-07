import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/globalException.filter';
import { ValidationPipe } from '@nestjs/common';
import { logger } from 'utils/logger/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Create a global validation pipe to validate all the Http request
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties that do not have any decorators
      forbidNonWhitelisted: true, // throws an error if non-whitelisted properties are present
      transform: true, // transforms payloads to be objects typed according to their DTO classes
    }),
  );

  // Create a global exception filter to handle all exceptions
  app.useGlobalFilters(new GlobalExceptionFilter());
  logger.log('Service running on port - ' + String(process.env.PORT ?? 3000));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
