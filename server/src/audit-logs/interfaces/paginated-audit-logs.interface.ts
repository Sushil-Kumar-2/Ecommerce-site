import { AuditLogDocument } from '../schemas/audit-log.schema';

export interface PaginatedAuditLogsResponse {
  data: AuditLogDocument[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
