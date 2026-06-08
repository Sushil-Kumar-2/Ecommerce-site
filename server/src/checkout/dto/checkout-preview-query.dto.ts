import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsMongoId } from 'class-validator';

export class CheckoutPreviewQueryDto {
  @ApiPropertyOptional({
    description: 'MongoDB ID of the shipping address to use for checkout preview',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  addressId?: string;
}
