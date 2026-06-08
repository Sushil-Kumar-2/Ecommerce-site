import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectProductDto {
  @ApiPropertyOptional({ example: 'Policy violation' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
