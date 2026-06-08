import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { ProductFilterDto } from './dto/product-filter.dto';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Create a new product (merchant)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.productsService.create(createProductDto, user.userId);
  }

  @Get('my-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({
    summary: 'List products owned by the authenticated merchant',
  })
  @ApiResponse({ status: 200, description: 'Merchant product list' })
  @ApiResponse(ApiUnauthorizedResponse)
  findMyProducts(@CurrentUser() user: JwtUser) {
    return this.productsService.findMyProducts(user.userId);
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best-selling products' })
  @ApiResponse({ status: 200, description: 'Best seller products' })
  getBestSellers() {
    return this.productsService.getBestSellers();
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top-rated products' })
  @ApiResponse({ status: 200, description: 'Top rated products' })
  getTopRatedProducts() {
    return this.productsService.getTopRatedProducts();
  }

  @Get()
  @ApiOperation({
    summary: 'Browse products with search, filters, and sorting',
  })
  @ApiResponse({ status: 200, description: 'Paginated product catalog' })
  findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products for a product' })
  @ApiParam({ name: 'id', description: 'Product MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Related products' })
  @ApiResponse(ApiNotFoundResponse)
  getRelatedProducts(@Param('id') id: string) {
    return this.productsService.getRelatedProducts(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiParam({ name: 'id', description: 'Product MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.productsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Update a product (owner merchant)' })
  @ApiParam({ name: 'id', description: 'Product MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Updated product' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.productsService.update(id, updateProductDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Delete a product (owner merchant)' })
  @ApiParam({ name: 'id', description: 'Product MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.productsService.remove(id, user.userId);
  }
}
