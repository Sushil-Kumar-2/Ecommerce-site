import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ImageProcessorService } from './services/image-processor.service';
import { CloudinaryService } from './services/cloudinary.service';
import { LocalStorageService } from './services/local-storage.service';
import { UploadFolder } from './enums/upload-folder.enum';
import {
  UploadImageResponse,
  UploadMultipleResponse,
  UploadedImageResult,
} from './interfaces/upload-response.interface';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE,
} from './config/multer.config';

@Injectable()
export class UploadsService {
  constructor(
    private readonly imageProcessor: ImageProcessorService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly localStorageService: LocalStorageService,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder = UploadFolder.PRODUCTS,
  ): Promise<UploadImageResponse> {
    this.assertValidFile(file);

    const image = await this.processAndUpload(file, folder);

    return {
      success: true,
      image,
    };
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder: UploadFolder = UploadFolder.PRODUCTS,
  ): Promise<UploadMultipleResponse> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }

    const images: UploadedImageResult[] = [];

    for (const file of files) {
      this.assertValidFile(file);
      images.push(await this.processAndUpload(file, folder));
    }

    return {
      success: true,
      count: images.length,
      images,
    };
  }

  private async processAndUpload(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<UploadedImageResult> {
    try {
      const { buffer, format } = await this.imageProcessor.compress(
        file.buffer,
        folder,
      );

      const uploaded = this.cloudinaryService.isConfigured()
        ? await this.cloudinaryService.uploadBuffer(buffer, folder, format)
        : await this.localStorageService.saveBuffer(buffer, folder, format);

      return {
        url: uploaded.url,
        publicId: uploaded.publicId,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
        folder,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Image upload failed';

      if (message.includes('Cloudinary is not configured')) {
        throw new InternalServerErrorException(message);
      }

      throw new BadRequestException(message);
    }
  }

  private assertValidFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!file.buffer?.length) {
      throw new BadRequestException('Uploaded file is empty');
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds ${MAX_IMAGE_FILE_SIZE / (1024 * 1024)}MB limit`,
      );
    }

    if (
      !ALLOWED_IMAGE_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, and GIF images are allowed',
      );
    }
  }
}
