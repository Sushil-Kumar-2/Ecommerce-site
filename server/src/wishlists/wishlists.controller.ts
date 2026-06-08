import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WishlistService, WishlistItemResponse } from './wishlists.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Wishlists')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  add(@Body() dto: AddToWishlistDto, @CurrentUser() user: JwtUser) {
    return this.wishlistService.add(dto.productId, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist items with product details',
  })
  @ApiResponse(ApiUnauthorizedResponse)
  getMyWishlist(@CurrentUser() user: JwtUser): Promise<WishlistItemResponse[]> {
    return this.wishlistService.getMyWishlist(user.userId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiParam({ name: 'productId', description: 'Product MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  remove(@Param('productId') productId: string, @CurrentUser() user: JwtUser) {
    return this.wishlistService.remove(productId, user.userId);
  }
}
