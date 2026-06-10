import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateMerchantDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jane@shopkart.demo' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: 'securePass123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'TechZone Electronics' })
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @ApiProperty({ example: 'Premium electronics and accessories.' })
  @IsString()
  @IsNotEmpty()
  shopDescription: string;

  @ApiProperty({ example: '123 Market Road, Mumbai, Maharashtra' })
  @IsString()
  @IsNotEmpty()
  businessAddress: string;

  @ApiPropertyOptional({ example: '22AAAAA0000A1Z5' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Z]{15}$/i, {
    message: 'GST number must be 15 alphanumeric characters',
  })
  gstNumber?: string;
}
