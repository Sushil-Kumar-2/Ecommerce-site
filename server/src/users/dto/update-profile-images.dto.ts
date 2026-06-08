import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

export class UpdateProfileImagesDto {
  @ApiPropertyOptional({
    description: 'URL of the user profile avatar image',
    example: 'https://cdn.example.com/avatars/user-123.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'avatar must be a valid URL' })
  avatar?: string;

  @ApiPropertyOptional({
    description: 'URL of the merchant shop logo (merchants and admins only)',
    example: 'https://cdn.example.com/shops/logo-456.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'shopLogo must be a valid URL' })
  shopLogo?: string;
}
