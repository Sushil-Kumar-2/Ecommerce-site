import {
  Controller,
  Delete,
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
import { NotificationsService } from './notifications.service';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import {
  SWAGGER_BEARER_AUTH,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Notifications')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated notifications with unread count',
  })
  @ApiResponse(ApiUnauthorizedResponse)
  findAll(
    @CurrentUser() user: JwtUser,
    @Query() filter: NotificationFilterDto,
  ) {
    return this.notificationsService.findAll(user.userId, filter);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count object' })
  @ApiResponse(ApiUnauthorizedResponse)
  getUnreadCount(@CurrentUser() user: JwtUser) {
    return this.notificationsService
      .getUnreadCount(user.userId)
      .then((count) => ({ unreadCount: count }));
  }

  @Get('unread')
  @ApiOperation({ summary: 'List unread notifications' })
  @ApiResponse({ status: 200, description: 'Paginated unread notifications' })
  @ApiResponse(ApiUnauthorizedResponse)
  findUnread(
    @CurrentUser() user: JwtUser,
    @Query() filter: NotificationFilterDto,
  ) {
    return this.notificationsService.findUnread(user.userId, filter);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'Count of modified notifications' })
  @ApiResponse(ApiUnauthorizedResponse)
  markAllAsRead(@CurrentUser() user: JwtUser) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Updated notification' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  markAsRead(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Deletion confirmation' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  deleteNotification(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.notificationsService.deleteNotification(user.userId, id);
  }
}
