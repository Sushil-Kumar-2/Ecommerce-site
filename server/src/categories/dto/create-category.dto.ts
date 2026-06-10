import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Display name of the category',
    example: 'Electronics',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'URL-friendly unique identifier for the category',
    example: 'electronics',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'Optional category description',
    example: 'Devices, gadgets, and electronic accessories.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Category banner or icon image URL',
    example: 'https://cdn.example.com/categories/electronics.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'image must be a valid URL' })
  image?: string;

  @ApiPropertyOptional({
    description: 'Parent category ObjectId for nested categories',
  })
  @IsOptional()
  @IsMongoId()
  parentCategory?: string;

  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
    default: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({
    description: 'Whether the category is visible and selectable',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
