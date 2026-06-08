import { Injectable, NotFoundException } from '@nestjs/common';

import { AddToCartDto } from './dto/add-to-cart.dto';

import { InjectModel } from '@nestjs/mongoose';

import { Model, ClientSession } from 'mongoose';

import { Cart, CartDocument } from './schemas/cart.schema';

import { ProductsService } from '../products/products.service';

import {
  CartItemAvailabilityStatus,
  EnrichedCartItem,
  EnrichedCartResponse,
} from './interfaces/enriched-cart.interface';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,

    private readonly productsService: ProductsService,
  ) {}

  /** Amazon-style: allow adding even when product is out of stock. */

  async addToCart(addToCartDto: AddToCartDto, userId: string) {
    const product = await this.productsService.findOne(addToCartDto.productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cart = await this.cartModel.findOne({
      userId,
    });

    if (!cart) {
      const newCart = new this.cartModel({
        userId,

        items: [
          {
            productId: product._id.toString(),

            quantity: addToCartDto.quantity,

            price: product.price,

            variantName: addToCartDto.variantName,

            variantValue: addToCartDto.variantValue,
          },
        ],

        totalAmount: product.price * addToCartDto.quantity,
      });

      return newCart.save();
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId === product._id.toString() &&
        item.variantName === addToCartDto.variantName &&
        item.variantValue === addToCartDto.variantValue,
    );

    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
    } else {
      cart.items.push({
        productId: product._id.toString(),

        quantity: addToCartDto.quantity,

        price: product.price,

        variantName: addToCartDto.variantName,

        variantValue: addToCartDto.variantValue,
      });
    }

    cart.totalAmount += product.price * addToCartDto.quantity;

    await cart.save();

    return cart;
  }

  /** Backward-compatible alias for existing POST /cart clients. */

  async create(addToCartDto: AddToCartDto, userId: string) {
    return this.addToCart(addToCartDto, userId);
  }

  async findMyCart(userId: string): Promise<EnrichedCartResponse | null> {
    const cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      return null;
    }

    return this.buildEnrichedCart(cart);
  }

  /** Raw cart document — used internally by order flow. */

  async findRawCart(userId: string) {
    return this.cartModel.findOne({ userId });
  }

  private resolveItemAvailability(
    availableStock: number,

    requestedQuantity: number,
  ): Pick<EnrichedCartItem, 'is_available' | 'status'> {
    if (availableStock === 0) {
      return { is_available: false, status: 'OUT_OF_STOCK' };
    }

    if (availableStock < requestedQuantity) {
      return { is_available: false, status: 'INSUFFICIENT_STOCK' };
    }

    return { is_available: true, status: 'IN_STOCK' };
  }

  private async buildEnrichedCart(
    cart: CartDocument,
  ): Promise<EnrichedCartResponse> {
    const productIds = cart.items.map((item) => String(item.productId));

    const products = await this.productsService.findByIds(productIds);

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    const items: EnrichedCartItem[] = cart.items.map((item) => {
      const product = productMap.get(String(item.productId));

      const availableStock = product?.stock ?? 0;

      const title = product?.title ?? 'Unknown product';

      const availability = this.resolveItemAvailability(
        availableStock,

        item.quantity,
      );

      return {
        productId: String(item.productId),

        quantity: item.quantity,

        price: item.price,

        variantName: item.variantName,

        variantValue: item.variantValue,

        image: product?.images?.[0] ?? undefined,

        title,

        availableStock,

        ...availability,
      };
    });

    return {
      _id: cart._id.toString(),

      userId: cart.userId,

      items,

      totalAmount: cart.totalAmount,

      canCheckout: items.length > 0 && items.every((item) => item.is_available),

      createdAt: (cart as Cart & { createdAt?: Date }).createdAt,

      updatedAt: (cart as Cart & { updatedAt?: Date }).updatedAt,
    };
  }

  async updateItemQuantity(
    userId: string,

    productId: string,

    quantity: number,
  ) {
    const cart = await this.cartModel.findOne({
      userId,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find((item) => item.productId === productId);

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    item.quantity = quantity;

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,

      0,
    );

    await cart.save();

    return this.buildEnrichedCart(cart);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({
      userId,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,

      0,
    );

    await cart.save();

    return this.buildEnrichedCart(cart);
  }

  async clearCart(userId: string, session?: ClientSession) {
    const query = this.cartModel.findOne({ userId });
    const cart = session ? await query.session(session) : await query;

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    cart.totalAmount = 0;

    await cart.save({ session: session ?? undefined });

    return cart;
  }
}
