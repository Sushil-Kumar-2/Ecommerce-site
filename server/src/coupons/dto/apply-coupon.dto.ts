import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({
    description: 'Coupon code to validate and apply',
    example: 'SAVE20',
  })
  @IsString()
  code: string;
}
