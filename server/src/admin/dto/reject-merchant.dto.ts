import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectMerchantDto {
  @ApiPropertyOptional({
    description: 'Reason for rejecting the merchant application',
    example: 'Incomplete business documentation',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
