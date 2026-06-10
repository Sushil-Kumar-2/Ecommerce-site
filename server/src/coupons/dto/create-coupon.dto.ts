import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export class CreateCouponDto {
  @ApiProperty({
    description: 'Unique coupon code',
    example: 'SAVE20',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Display name for the coupon',
    example: '20% Off Summer Sale',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description of the coupon offer',
    example: 'Get 20% off on orders above ₹500',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of discount applied',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    description:
      'Discount value (percentage 1–100 or fixed amount in currency units)',
    example: 20,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Minimum order amount required to use this coupon',
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional({
    description:
      'Maximum discount amount cap (useful for percentage discounts)',
    example: 200,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiProperty({
    description: 'Date when the coupon becomes active (ISO 8601)',
    example: '2026-06-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Date when the coupon expires (ISO 8601)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional({
    description: 'Whether the coupon is currently active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of times this coupon can be used',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;
}
