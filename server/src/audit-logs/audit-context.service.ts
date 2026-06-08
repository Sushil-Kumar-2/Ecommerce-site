import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { AuditRequestMeta } from './interfaces/audit-log.interface';

@Injectable()
export class AuditContextService {
  private readonly storage = new AsyncLocalStorage<AuditRequestMeta>();

  run<T>(meta: AuditRequestMeta, callback: () => T): T {
    return this.storage.run(meta, callback);
  }

  getRequestMeta(): AuditRequestMeta | undefined {
    return this.storage.getStore();
  }
}
