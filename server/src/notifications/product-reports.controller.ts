import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductReportsService } from './product-reports.service';
import { CreateProductReportDto } from './dto/create-product-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Product Reports')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('product-reports')
@UseGuards(JwtAuthGuard)
export class ProductReportsController {
  constructor(private readonly productReportsService: ProductReportsService) {}

  @Post(':productId')
  @ApiOperation({ summary: 'Report a product for review by admins' })
  @ApiParam({ name: 'productId', description: 'Product MongoDB ObjectId' })
  @ApiResponse({ status: 201, description: 'Product report submitted' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  @ApiResponse(ApiNotFoundResponse)
  create(
    @Param('productId') productId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateProductReportDto,
  ) {
    return this.productReportsService.create(productId, user.userId, dto);
  }
}
