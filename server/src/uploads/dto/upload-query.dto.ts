import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UploadFolder } from '../enums/upload-folder.enum';

export class UploadQueryDto {
  @ApiPropertyOptional({
    description: 'Target folder for the uploaded file',
    enum: UploadFolder,
    example: UploadFolder.PRODUCTS,
  })
  @IsOptional()
  @IsEnum(UploadFolder)
  folder?: UploadFolder;
}
