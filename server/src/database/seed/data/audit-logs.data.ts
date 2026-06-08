import { AuditAction, AuditResource } from '../../../audit-logs/audit-log.enums';
import type { DemoUserKey } from './users.data';

export const SEED_AUDIT_LOGS: Array<{
  role: string;
  actorKey: DemoUserKey;
  action: AuditAction;
  resource: AuditResource;
  productSlug?: string;
  couponCode?: string;
  metadata: Record<string, unknown>;
}> = [
  {
    role: 'admin',
    actorKey: 'admin',
    action: AuditAction.COUPON_CREATED,
    resource: AuditResource.COUPON,
    couponCode: 'WELCOME10',
    metadata: { code: 'WELCOME10' },
  },
  {
    role: 'admin',
    actorKey: 'admin',
    action: AuditAction.PRODUCT_APPROVED,
    resource: AuditResource.PRODUCT,
    productSlug: 'demo-wireless-mouse',
    metadata: { title: 'Zebronics Wireless Mouse with RGB' },
  },
  {
    role: 'user',
    actorKey: 'customer2',
    action: AuditAction.PRODUCT_REPORTED,
    resource: AuditResource.PRODUCT_REPORT,
    productSlug: 'demo-budget-phone',
    metadata: { reason: 'Misleading listing' },
  },
  {
    role: 'admin',
    actorKey: 'admin',
    action: AuditAction.PRODUCT_REPORT_REVIEWED,
    resource: AuditResource.PRODUCT_REPORT,
    productSlug: 'demo-lipstick-set',
    metadata: { status: 'reviewed' },
  },
  {
    role: 'merchant',
    actorKey: 'merchant1',
    action: AuditAction.PRODUCT_CREATED,
    resource: AuditResource.PRODUCT,
    productSlug: 'demo-gaming-laptop',
    metadata: { title: 'Gaming Laptop Pro 15' },
  },
];
