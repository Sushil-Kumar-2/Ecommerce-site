import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product display title',
    example: 'Wireless Bluetooth Headphones',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'URL-friendly unique identifier for the product',
    example: 'wireless-bluetooth-headphones',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Full product description',
    example: 'Premium over-ear headphones with active noise cancellation.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'MongoDB ObjectId of the product category',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  categoryId: string;

  @ApiProperty({
    description: 'Regular price in the store currency',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Discounted sale price; must be less than or equal to price',
    example: 79.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @ApiProperty({
    description: 'Available inventory count for the base product',
    example: 50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'List of product image URLs',
    example: [
      'https://cdn.example.com/products/headphones-1.jpg',
      'https://cdn.example.com/products/headphones-2.jpg',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Product variants with independent stock levels',
    example: [
      { name: 'Color', value: 'Black', stock: 20 },
      { name: 'Color', value: 'White', stock: 15 },
    ],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Color' },
        value: { type: 'string', example: 'Black' },
        stock: { type: 'number', example: 20 },
      },
    },
  })
  @IsOptional()
  @IsArray()
  variants?: {
    name: string;
    value: string;
    stock: number;
  }[];
}
