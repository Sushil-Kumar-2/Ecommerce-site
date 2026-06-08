import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CouponFilterDto } from './dto/coupon-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Create a discount coupon (admin only)' })
  @ApiResponse({ status: 201, description: 'Coupon created' })
  @ApiResponse(ApiBadRequestResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply a coupon code to an order total' })
  @ApiResponse({ status: 200, description: 'Discount calculation result' })
  @ApiResponse(ApiBadRequestResponse)
  applyCoupon(@Body() dto: ApplyCouponDto) {
    return this.couponsService.applyCoupon(
      dto.code,
      5000,
      'TEMP_USER_ID',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'List all coupons (admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon list' })
  findAll(@Query() filter: CouponFilterDto) {
    return this.couponsService.findAll(filter);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get coupon usage statistics (admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  getStats(@Param('id') id: string) {
    return this.couponsService.getStats(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get coupon by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  @ApiResponse(ApiNotFoundResponse)
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Update coupon by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  @ApiResponse({ status: 200, description: 'Updated coupon' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiBadRequestResponse)
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Delete coupon by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  @ApiResponse({ status: 200, description: 'Coupon deleted' })
  @ApiResponse(ApiNotFoundResponse)
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
