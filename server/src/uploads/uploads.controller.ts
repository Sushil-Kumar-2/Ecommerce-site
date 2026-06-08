import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadQueryDto } from './dto/upload-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  imageMulterOptions,
  MAX_IMAGE_FILE_SIZE,
  MAX_MULTIPLE_FILES,
} from './config/multer.config';
import { UploadFolder } from './enums/upload-folder.enum';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Uploads')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', imageMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single image to Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpeg, png, webp, gif)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Uploaded image URL and metadata' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_FILE_SIZE }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|jpg|pjpeg|png|webp|gif)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query() query: UploadQueryDto,
  ) {
    return this.uploadsService.uploadImage(
      file,
      query.folder ?? UploadFolder.PRODUCTS,
    );
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', MAX_MULTIPLE_FILES, imageMulterOptions),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple images to Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Up to 10 image files',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Array of uploaded image URLs' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query() query: UploadQueryDto,
  ) {
    return this.uploadsService.uploadMultiple(
      files,
      query.folder ?? UploadFolder.PRODUCTS,
    );
  }
}
