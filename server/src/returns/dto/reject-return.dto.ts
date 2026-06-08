import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectReturnDto {
  @ApiPropertyOptional({
    description: 'Admin note explaining why the return was rejected',
    example: 'Return window has expired',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}
