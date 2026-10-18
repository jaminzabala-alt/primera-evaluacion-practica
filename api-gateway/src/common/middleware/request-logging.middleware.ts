import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startedAt;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });

    next();
  }
}
