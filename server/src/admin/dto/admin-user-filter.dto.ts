import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminUserFilterDto {
  @ApiPropertyOptional({ example: '1', default: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20', default: '20' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({ example: 'user', enum: ['user', 'merchant', 'admin'] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    example: 'active',
    enum: ['active', 'blocked', 'pending'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'name or email' })
  @IsOptional()
  @IsString()
  search?: string;
}
