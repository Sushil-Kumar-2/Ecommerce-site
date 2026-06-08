import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateAvatarDto {
  @ApiProperty({
    description: 'URL of the new profile avatar image',
    example: 'https://cdn.example.com/avatars/user-123.jpg',
  })
  @IsUrl({}, { message: 'avatar must be a valid URL' })
  @IsNotEmpty()
  avatar: string;
}
