import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';
import { ReferenceType } from '../enums/reference-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'MongoDB ID of the user to notify',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Order Shipped',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification message body',
    example: 'Your order #12345 has been shipped.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Type of notification event',
    enum: NotificationType,
    example: NotificationType.ORDER_SHIPPED,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({
    description: 'MongoDB ID of the related entity (order, product, etc.)',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Type of the referenced entity',
    enum: ReferenceType,
    example: ReferenceType.ORDER,
  })
  @IsOptional()
  @IsEnum(ReferenceType)
  referenceType?: ReferenceType;

  @ApiPropertyOptional({
    description: 'Additional metadata attached to the notification',
    example: { orderNumber: '12345', trackingUrl: 'https://track.example.com' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
