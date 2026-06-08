import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({
    description: 'MongoDB ID of the product to add to the wishlist',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  productId: string;
}
