import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Updated quantity for the cart line item',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}
