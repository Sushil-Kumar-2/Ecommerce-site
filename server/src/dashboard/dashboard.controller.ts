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
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../auth/roles.enum';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import {
  SWAGGER_BEARER_AUTH,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly dashboardService: DashboardService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create dashboard record (legacy/internal)' })
  @ApiResponse({ status: 201, description: 'Record created' })
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.orderModel.create(createDashboardDto);
  }

  @Get()
  @ApiOperation({ summary: 'List dashboard records (legacy/internal)' })
  @ApiResponse({ status: 200, description: 'Records list' })
  findAll() {
    return this.orderModel.find();
  }

  @Get('merchant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get merchant dashboard overview' })
  @ApiResponse({ status: 200, description: 'Merchant KPIs and stats' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  getMerchantDashboard(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getMerchantDashboard(user.userId);
  }

  @Get('merchant/monthly-sales')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get merchant monthly sales analytics' })
  @ApiResponse({ status: 200, description: 'Monthly sales chart data' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  getMonthlySales(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getMonthlySalesAnalytics(user.userId);
  }

  @Get('merchant/low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get merchant low-stock products' })
  @ApiResponse({ status: 200, description: 'Low stock product list' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  getLowStockProducts(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getLowStockProducts(user.userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get admin analytics dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Platform overview, revenue, top lists',
  })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('admin/monthly-revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get admin monthly revenue analytics' })
  @ApiResponse({ status: 200, description: 'Monthly revenue chart data' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  getAdminMonthlyRevenue() {
    return this.dashboardService.getAdminMonthlyRevenue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dashboard record by ID (legacy/internal)' })
  @ApiParam({ name: 'id', description: 'Record MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Record details' })
  @ApiResponse(ApiNotFoundResponse)
  findOne(@Param('id') id: string) {
    return this.orderModel.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dashboard record (legacy/internal)' })
  @ApiParam({ name: 'id', description: 'Record MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Updated record' })
  @ApiResponse(ApiNotFoundResponse)
  update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
  ) {
    return this.orderModel.findByIdAndUpdate(id, updateDashboardDto, {
      new: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dashboard record (legacy/internal)' })
  @ApiParam({ name: 'id', description: 'Record MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Deleted record' })
  @ApiResponse(ApiNotFoundResponse)
  remove(@Param('id') id: string) {
    return this.orderModel.findByIdAndDelete(id);
  }
}
