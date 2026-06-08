import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Profile')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile details' })
  @ApiResponse(ApiUnauthorizedResponse)
  getProfile(@CurrentUser() user: JwtUser) {
    return this.profileService.getProfile(user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update profile name, email, or phone' })
  @ApiResponse({ status: 200, description: 'Updated profile' })
  @ApiResponse(ApiBadRequestResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  updateProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.userId, dto);
  }

  @Patch('avatar')
  @ApiOperation({ summary: 'Update profile avatar URL' })
  @ApiResponse({ status: 200, description: 'Updated profile with new avatar' })
  @ApiResponse(ApiBadRequestResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  updateAvatar(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateAvatarDto,
  ) {
    return this.profileService.updateAvatar(user.userId, dto);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change account password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse(ApiBadRequestResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  changePassword(
    @CurrentUser() user: JwtUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(user.userId, dto);
  }
}
