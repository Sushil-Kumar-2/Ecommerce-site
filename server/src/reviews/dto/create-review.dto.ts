import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'MongoDB ID of the product being reviewed',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Star rating from 1 to 5',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Written review comment',
    example: 'Great product, fast delivery!',
  })
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Array of image URLs attached to the review',
    example: ['https://example.com/review1.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  images?: string[];
}
