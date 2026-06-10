import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { RejectReturnDto } from './dto/reject-return.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({
    summary: 'Create a return request for a delivered order item',
  })
  @ApiResponse({ status: 201, description: 'Return request created' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(user.userId, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'List return requests for current user' })
  @ApiResponse({ status: 200, description: 'User return requests' })
  @ApiResponse(ApiUnauthorizedResponse)
  findMyReturns(@CurrentUser() user: JwtUser) {
    return this.returnsService.findMyReturns(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get return request by ID' })
  @ApiParam({ name: 'id', description: 'Return request MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Return request details' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.returnsService.findOne(id, user);
  }

  @Patch(':id/approve')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Approve a return request (admin only)' })
  @ApiParam({ name: 'id', description: 'Return request MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Approved return request' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  @ApiResponse(ApiBadRequestResponse)
  approve(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.returnsService.approve(id, user);
  }

  @Patch(':id/reject')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Reject a return request (admin only)' })
  @ApiParam({ name: 'id', description: 'Return request MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Rejected return request' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  @ApiResponse(ApiBadRequestResponse)
  reject(@Param('id') id: string, @Body() dto: RejectReturnDto) {
    return this.returnsService.reject(id, dto.adminNote);
  }

  @Patch(':id/refund')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Process refund for approved return (admin only)' })
  @ApiParam({ name: 'id', description: 'Return request MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Refunded return request' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  @ApiResponse(ApiBadRequestResponse)
  processRefund(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.returnsService.processRefund(id, user);
  }
}
