import type { DemoUserKey } from './users.data';

export interface SeedOrderItemDef {
  productSlug: string;
  quantity: number;
  variantDetails?: string;
}

export interface SeedOrderDef {
  orderNumber: string;
  customerKey: Extract<DemoUserKey, 'customer' | 'customer2'>;
  paymentMethod: 'cod' | 'razorpay';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  items: SeedOrderItemDef[];
  couponCode?: string;
  cancelReason?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  fulfillmentStatus?: 'pending' | 'accepted' | 'ready_to_ship' | 'shipped' | 'rejected';
  trackingNumber?: string;
}

export const SEED_ORDERS: SeedOrderDef[] = [
  {
    orderNumber: 'DEMO-ORD-001',
    customerKey: 'customer',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    items: [{ productSlug: 'demo-phone-case', quantity: 2 }],
    fulfillmentStatus: 'pending',
  },
  {
    orderNumber: 'DEMO-ORD-002',
    customerKey: 'customer',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    items: [{ productSlug: 'demo-mechanical-keyboard', quantity: 1 }],
    fulfillmentStatus: 'pending',
  },
  {
    orderNumber: 'DEMO-ORD-003',
    customerKey: 'customer',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    items: [{ productSlug: 'demo-bluetooth-headphones', quantity: 1 }],
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    fulfillmentStatus: 'pending',
  },
  {
    orderNumber: 'DEMO-ORD-004',
    customerKey: 'customer',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderStatus: 'processing',
    items: [
      { productSlug: 'demo-power-bank', quantity: 1 },
      { productSlug: 'demo-cotton-tshirt', quantity: 1, variantDetails: 'Size: L' },
    ],
    paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    fulfillmentStatus: 'accepted',
  },
  {
    orderNumber: 'DEMO-ORD-005',
    customerKey: 'customer',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    items: [{ productSlug: 'demo-wireless-mouse', quantity: 1 }],
    paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    shippedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    fulfillmentStatus: 'shipped',
    trackingNumber: 'DEMO123456789',
  },
  {
    orderNumber: 'DEMO-ORD-006',
    customerKey: 'customer2',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'cancelled',
    items: [{ productSlug: 'demo-yoga-mat', quantity: 1 }],
    cancelReason: 'Changed my mind',
    cancelledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fulfillmentStatus: 'pending',
  },
];
