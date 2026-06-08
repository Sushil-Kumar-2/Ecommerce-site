import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the product to add',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Number of units to add to the cart',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Variant attribute name when adding a specific product variant',
    example: 'Color',
  })
  @IsOptional()
  @IsString()
  variantName?: string;

  @ApiPropertyOptional({
    description: 'Variant attribute value matching variantName',
    example: 'Black',
  })
  @IsOptional()
  @IsString()
  variantValue?: string;
}
