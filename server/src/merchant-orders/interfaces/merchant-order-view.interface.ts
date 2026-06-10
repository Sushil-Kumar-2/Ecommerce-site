import {
  MerchantFulfillment,
  OrderItem,
  ShippingAddress,
} from '../../orders/schemas/order.schema';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../orders/order.enums';

export interface MerchantOrderView {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  merchantFulfillment: MerchantFulfillment;
  merchantSubtotal: number;
  createdAt: Date;
}

export interface MerchantOrderSummary {
  total: number;
  pending: number;
  accepted: number;
  readyToShip: number;
  shipped: number;
  rejected: number;
}

export interface PaginatedMerchantOrders {
  data: MerchantOrderView[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
