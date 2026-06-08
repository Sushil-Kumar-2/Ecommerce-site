import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'Full name of the recipient',
    example: 'Jane Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Contact phone number (10-15 digits, optional leading +)',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'phone must be 10-15 digits',
  })
  phone: string;

  @ApiProperty({
    description: 'Primary address line (street, building, etc.)',
    example: '123 Main Street, Apt 4B',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Secondary address line (apartment, suite, etc.)',
    example: 'Near Central Park',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @ApiProperty({
    description: 'City name',
    example: 'Mumbai',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'State or province',
    example: 'Maharashtra',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @ApiProperty({
    description: 'Country name',
    example: 'India',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiProperty({
    description: 'Postal/ZIP code (exactly 6 digits)',
    example: '400001',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'pincode must be exactly 6 digits' })
  pincode: string;

  @ApiPropertyOptional({
    description: 'Nearby landmark for easier delivery',
    example: 'Opposite City Mall',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  landmark?: string;

  @ApiPropertyOptional({
    description: 'Whether this address should be set as the default',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
