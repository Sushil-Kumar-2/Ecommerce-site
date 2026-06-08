import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current account password for verification',
    example: 'oldPassword123',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password to set (minimum 6 characters)',
    example: 'newSecurePass456',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
