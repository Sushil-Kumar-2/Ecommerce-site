import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MerchantOrdersService } from './merchant-orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { MerchantOrderFilterDto } from './dto/merchant-order-filter.dto';
import { ShipMerchantOrderDto } from './dto/ship-merchant-order.dto';
import { RejectMerchantOrderDto } from './dto/reject-merchant-order.dto';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Merchant Orders')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('merchant/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('merchant')
export class MerchantOrdersController {
  constructor(private readonly merchantOrdersService: MerchantOrdersService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get merchant order fulfillment summary' })
  @ApiResponse({
    status: 200,
    description: 'Order counts by fulfillment status',
  })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  getSummary(@CurrentUser() user: JwtUser) {
    return this.merchantOrdersService.getSummary(user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List orders containing merchant products' })
  @ApiResponse({ status: 200, description: 'Paginated merchant orders' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  findAll(
    @CurrentUser() user: JwtUser,
    @Query() filter: MerchantOrderFilterDto,
  ) {
    return this.merchantOrdersService.findAll(user.userId, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchant order details by order ID' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({
    status: 200,
    description: 'Order with merchant fulfillment slice',
  })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.merchantOrdersService.findOne(user.userId, id);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept order for fulfillment' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Order accepted' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  @ApiResponse(ApiBadRequestResponse)
  accept(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.merchantOrdersService.accept(user.userId, id);
  }

  @Patch(':id/ready-to-ship')
  @ApiOperation({ summary: 'Mark order as ready to ship' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Order marked ready to ship' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  @ApiResponse(ApiBadRequestResponse)
  readyToShip(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.merchantOrdersService.readyToShip(user.userId, id);
  }

  @Patch(':id/ship')
  @ApiOperation({ summary: 'Mark order as shipped with tracking info' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Order shipped' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  @ApiResponse(ApiBadRequestResponse)
  ship(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: ShipMerchantOrderDto,
  ) {
    return this.merchantOrdersService.ship(user.userId, id, dto);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject order fulfillment' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Order rejected by merchant' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  @ApiResponse(ApiBadRequestResponse)
  reject(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: RejectMerchantOrderDto,
  ) {
    return this.merchantOrdersService.reject(user.userId, id, dto.reason);
  }
}
