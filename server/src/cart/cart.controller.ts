import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Cart')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add item to cart (alias of POST /cart/add)' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  create(@Body() addToCartDto: AddToCartDto, @CurrentUser() user: JwtUser) {
    return this.cartService.addToCart(addToCartDto, user.userId);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  addToCart(@Body() addToCartDto: AddToCartDto, @CurrentUser() user: JwtUser) {
    return this.cartService.addToCart(addToCartDto, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Cart with items and totals' })
  @ApiResponse(ApiUnauthorizedResponse)
  findMyCart(@CurrentUser() user: JwtUser) {
    return this.cartService.findMyCart(user.userId);
  }

  @Patch('item/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'productId', description: 'Product MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Updated cart' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  updateItemQuantity(
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.cartService.updateItemQuantity(
      user.userId,
      productId,
      updateCartItemDto.quantity,
    );
  }

  @Delete('item/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'productId', description: 'Product MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Updated cart' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  removeItem(
    @Param('productId') productId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.cartService.removeItem(user.userId, productId);
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Empty cart' })
  @ApiResponse(ApiUnauthorizedResponse)
  clearCart(@CurrentUser() user: JwtUser) {
    return this.cartService.clearCart(user.userId);
  }
}
