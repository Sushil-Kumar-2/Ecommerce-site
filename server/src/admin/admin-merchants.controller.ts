import {
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
import { AdminMerchantsService } from './admin-merchants.service';
import { AdminMerchantFilterDto } from './dto/admin-merchant-filter.dto';

@ApiTags('Admin Merchants')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('admin/merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminMerchantsController {
  constructor(private readonly adminMerchantsService: AdminMerchantsService) {}

  @Get()
  @ApiOperation({ summary: 'List merchants (admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated merchant list' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  findAll(@Query() filter: AdminMerchantFilterDto) {
    return this.adminMerchantsService.findAll(filter);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get merchant products (admin only)' })
  @ApiParam({ name: 'id', description: 'Merchant MongoDB ObjectId' })
  findProducts(@Param('id') id: string) {
    return this.adminMerchantsService.findMerchantProducts(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchant by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Merchant MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Merchant details' })
  @ApiResponse(ApiNotFoundResponse)
  findOne(@Param('id') id: string) {
    return this.adminMerchantsService.findOne(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate merchant (admin only)' })
  activate(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminMerchantsService.activate(id, user.userId);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Block merchant (admin only)' })
  block(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminMerchantsService.block(id, user.userId);
  }
}
