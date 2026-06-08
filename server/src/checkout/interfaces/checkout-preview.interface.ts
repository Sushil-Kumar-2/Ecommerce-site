import { AddressDocument } from '../../addresses/schemas/address.schema';
import { EnrichedCartResponse } from '../../cart/interfaces/enriched-cart.interface';

export type AddressSelectionMode = 'default' | 'explicit' | 'none';

export interface CheckoutPreviewResponse {
  cart: EnrichedCartResponse | null;
  addresses: AddressDocument[];
  selectedAddress: AddressDocument | null;
  selectionMode: AddressSelectionMode;
  canCheckout: boolean;
  issues: string[];
}
