import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsBooleanString,
} from 'class-validator';
import { ProductSort } from '../product-sort.enum';

export class ProductFilterDto {
  @ApiPropertyOptional({
    description: 'Search term matched against product title and description',
    example: 'headphones',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter products by category MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter (inclusive)',
    example: '10',
  })
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({
    description: 'Maximum price filter (inclusive)',
    example: '500',
  })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @ApiPropertyOptional({
    description: 'Minimum average rating filter, e.g. ?rating=4',
    example: '4',
  })
  /** Minimum average rating, e.g. ?rating=4 */
  @IsOptional()
  @IsNumberString()
  rating?: string;

  @ApiPropertyOptional({
    description: 'Minimum average rating filter (alias for rating)',
    example: '3.5',
  })
  @IsOptional()
  @IsNumberString()
  minRating?: string;

  @ApiPropertyOptional({
    description: 'Sort order for the product list',
    enum: ProductSort,
    example: ProductSort.NEWEST,
  })
  @IsOptional()
  @IsEnum(ProductSort)
  sort?: ProductSort;

  @ApiPropertyOptional({
    description: 'Page number for pagination (1-based)',
    example: '1',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Number of products per page',
    example: '20',
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Filter featured products only',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  featured?: string;

  @ApiPropertyOptional({
    description: 'Filter by stock availability',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  inStock?: string;

  @ApiPropertyOptional({
    description: 'Filter by product approval status',
    enum: ['draft', 'pending', 'approved', 'rejected'],
    example: 'approved',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter products by merchant MongoDB ObjectId',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsString()
  merchantId?: string;
}
