import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch() // catch all exceptions
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else {
      // Handle non-HTTP exceptions (like database errors, etc.)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }
    this.logger.error(
      `${request.method} ${request.url} → ${JSON.stringify(exception.message)}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
