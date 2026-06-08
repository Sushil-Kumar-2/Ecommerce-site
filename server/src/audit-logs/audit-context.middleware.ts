import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditContextService } from './audit-context.service';

@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
  constructor(private readonly auditContextService: AuditContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : undefined) ??
      req.ip ??
      req.socket.remoteAddress;

    const userAgent = req.headers['user-agent'];

    this.auditContextService.run({ ipAddress, userAgent }, () => next());
  }
}
