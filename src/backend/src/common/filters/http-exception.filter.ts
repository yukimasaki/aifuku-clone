import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const r = JSON.stringify(exception.getResponse());
    const statusMessage = JSON.parse(r).error;
    const message = JSON.parse(r).message;

    res
      .status(statusCode)
      .json({
        statusCode,
        statusMessage,
        message,
        timestamp: new Date().toISOString(),
        path: req.url,
      });
  }
}
