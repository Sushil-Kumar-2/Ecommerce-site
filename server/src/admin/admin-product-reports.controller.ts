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
import { AdminProductReportsService } from './admin-product-reports.service';
import { AdminProductReportFilterDto } from './dto/admin-product-report-filter.dto';

@ApiTags('Admin Product Reports')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('admin/product-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductReportsController {
  constructor(
    private readonly adminProductReportsService: AdminProductReportsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List product reports (admin only)' })
  findAll(@Query() filter: AdminProductReportFilterDto) {
    return this.adminProductReportsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product report by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Report MongoDB ObjectId' })
  @ApiResponse(ApiNotFoundResponse)
  findOne(@Param('id') id: string) {
    return this.adminProductReportsService.findOne(id);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Mark report as reviewed (admin only)' })
  review(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminProductReportsService.review(id, user.userId);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve product report (admin only)' })
  resolve(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminProductReportsService.resolve(id, user.userId);
  }
}
