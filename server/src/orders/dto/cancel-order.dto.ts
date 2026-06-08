import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CancelOrderDto {
  @ApiProperty({
    description: 'Reason for cancelling the order',
    example: 'Changed my mind',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  reason: string;
}
