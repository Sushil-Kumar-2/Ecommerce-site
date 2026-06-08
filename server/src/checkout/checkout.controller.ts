import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CheckoutPreviewQueryDto } from './dto/checkout-preview-query.dto';
import {
  SWAGGER_BEARER_AUTH,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Checkout')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get()
  @ApiOperation({ summary: 'Get checkout preview with cart, addresses, and totals' })
  @ApiResponse({ status: 200, description: 'Checkout preview payload' })
  @ApiResponse(ApiUnauthorizedResponse)
  getPreview(
    @CurrentUser() user: JwtUser,
    @Query() query: CheckoutPreviewQueryDto,
  ) {
    return this.checkoutService.getPreview(user.userId, query.addressId);
  }
}
