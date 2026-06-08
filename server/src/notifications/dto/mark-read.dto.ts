import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MarkReadDto {
  @ApiPropertyOptional({
    description: 'MongoDB ID of a specific notification to mark as read; omit to mark all as read',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  notificationId?: string;
}
