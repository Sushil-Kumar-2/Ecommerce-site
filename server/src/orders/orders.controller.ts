import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CancelOrderDto } from './dto/cancel-order.dto';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Place a new order from cart' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: JwtUser) {
    return this.ordersService.create(createOrderDto, user.userId);
  }

  @Get()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'List all orders (admin only)' })
  @ApiResponse({ status: 200, description: 'All orders' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'List orders for current user' })
  @ApiResponse({ status: 200, description: 'User order history' })
  @ApiResponse(ApiUnauthorizedResponse)
  findMyOrders(@CurrentUser() user: JwtUser) {
    return this.ordersService.findMyOrders(user.userId);
  }

  @Patch(':id/status')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Updated order' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      updateOrderStatusDto.orderStatus,
    );
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Cancelled order' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  cancelOrder(
    @Param('id') id: string,
    @Body() cancelOrderDto: CancelOrderDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ordersService.cancelOrder(id, user, cancelOrderDto.reason);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.ordersService.findOneForUser(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order fields (internal)' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Updated order' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiBadRequestResponse)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Cancel/delete order (admin action via JWT user)' })
  @ApiParam({ name: 'id', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.ordersService.cancelOrder(id, user, 'Order cancelled by admin');
  }
}
