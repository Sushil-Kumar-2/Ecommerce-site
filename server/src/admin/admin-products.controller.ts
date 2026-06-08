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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/roles.enum';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import {
  SWAGGER_BEARER_AUTH,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';
import { AdminProductsService } from './admin-products.service';
import { AdminProductFilterDto } from './dto/admin-product-filter.dto';
import { RejectProductDto } from './dto/reject-product.dto';

@ApiTags('Admin Products')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products for moderation (admin only)' })
  findAll(@Query() filter: AdminProductFilterDto) {
    return this.adminProductsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Product MongoDB ObjectId' })
  @ApiResponse(ApiNotFoundResponse)
  findOne(@Param('id') id: string) {
    return this.adminProductsService.findOne(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve product (admin only)' })
  approve(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminProductsService.approve(id, user.userId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject product (admin only)' })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectProductDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.adminProductsService.reject(id, user.userId, dto);
  }

  @Patch(':id/feature')
  @ApiOperation({ summary: 'Feature product (admin only)' })
  feature(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminProductsService.feature(id, user.userId);
  }

  @Patch(':id/unfeature')
  @ApiOperation({ summary: 'Unfeature product (admin only)' })
  unfeature(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminProductsService.unfeature(id, user.userId);
  }
}
