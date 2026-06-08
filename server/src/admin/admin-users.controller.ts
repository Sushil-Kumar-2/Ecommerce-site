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
import { AdminUsersService } from './admin-users.service';
import { AdminUserFilterDto } from './dto/admin-user-filter.dto';

@ApiTags('Admin Users')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users (admin only)' })
  findAll(@Query() filter: AdminUserFilterDto) {
    return this.adminUsersService.findAll(filter);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Get user order history (admin only)' })
  findOrders(@Param('id') id: string) {
    return this.adminUsersService.findUserOrders(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User MongoDB ObjectId' })
  @ApiResponse(ApiNotFoundResponse)
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user (admin only)' })
  deactivate(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminUsersService.deactivate(id, user.userId);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user (admin only)' })
  activate(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminUsersService.activate(id, user.userId);
  }
}
