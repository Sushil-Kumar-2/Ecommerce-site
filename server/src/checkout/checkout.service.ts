import { Injectable } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { AddressesService } from '../addresses/addresses.service';
import { CheckoutPreviewResponse } from './interfaces/checkout-preview.interface';
import { AddressDocument } from '../addresses/schemas/address.schema';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly cartService: CartService,
    private readonly addressesService: AddressesService,
  ) {}

  async getPreview(
    userId: string,
    addressId?: string,
  ): Promise<CheckoutPreviewResponse> {
    const [cart, addresses] = await Promise.all([
      this.cartService.findMyCart(userId),
      this.addressesService.findMyAddresses(userId),
    ]);

    const issues: string[] = [];

    if (!cart || cart.items.length === 0) {
      issues.push('Cart is empty');
    } else if (!cart.canCheckout) {
      issues.push('Some cart items are unavailable or out of stock');
    }

    if (addresses.length === 0) {
      issues.push('Add a shipping address to continue');
    }

    let selectedAddress: AddressDocument | null = null;
    let selectionMode: CheckoutPreviewResponse['selectionMode'] = 'none';

    if (addressId) {
      try {
        selectedAddress = await this.addressesService.resolveForCheckout(
          userId,
          addressId,
        );
        selectionMode = 'explicit';
      } catch (error) {
        issues.push(this.extractErrorMessage(error));
      }
    } else {
      const defaultAddress =
        await this.addressesService.getDefaultAddress(userId);

      if (defaultAddress) {
        try {
          selectedAddress = await this.addressesService.resolveForCheckout(
            userId,
            defaultAddress._id.toString(),
          );
          selectionMode = 'default';
        } catch (error) {
          issues.push(this.extractErrorMessage(error));
        }
      } else if (addresses.length > 0) {
        issues.push(
          'No default address set. Select an address or mark one as default.',
        );
      }
    }

    const canCheckout =
      Boolean(cart?.canCheckout && cart.items.length > 0) &&
      Boolean(selectedAddress) &&
      issues.length === 0;

    return {
      cart,
      addresses,
      selectedAddress,
      selectionMode,
      canCheckout,
      issues,
    };
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Address validation failed';
  }
}
