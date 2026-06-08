import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import {
  SWAGGER_BEARER_AUTH,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  @Get('products/:productId/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get inventory movement history for a product' })
  @ApiParam({ name: 'productId', description: 'Product MongoDB ObjectId' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({ status: 200, description: 'Inventory transaction history' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  async getProductTransactions(
    @Param('productId') productId: string,
    @CurrentUser() user: JwtUser,
    @Query('limit') limit?: string,
  ) {
    if (!isValidObjectId(productId)) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      user.role !== 'admin' &&
      product.merchantId.toString() !== user.userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.inventoryService.findByProduct(
      productId,
      limit ? Number(limit) : 50,
    );
  }
}
