import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RecentlyViewedService } from './recently-viewed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import {
  SWAGGER_BEARER_AUTH,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Recently Viewed')
@Controller('recently-viewed')
export class RecentlyViewedController {
  constructor(private readonly recentlyViewedService: RecentlyViewedService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get recently viewed products for current user' })
  @ApiResponse({ status: 200, description: 'Recently viewed product list' })
  @ApiResponse(ApiUnauthorizedResponse)
  findAll(@CurrentUser() user: JwtUser) {
    return this.recentlyViewedService.findAll(user.userId);
  }
}
