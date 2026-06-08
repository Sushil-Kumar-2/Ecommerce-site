import { AuditAction } from '../audit-log.enums';

export interface CreateAuditLogInput {
  userId?: string;
  role: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditRequestMeta {
  ipAddress?: string;
  userAgent?: string;
}
