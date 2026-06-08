import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import {
  SWAGGER_BEARER_AUTH,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Audit Logs')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs with filters and pagination (admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated audit logs' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  getLogs(@Query() filter: AuditLogFilterDto) {
    return this.auditLogsService.getLogs(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Audit log MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Audit log details' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}
