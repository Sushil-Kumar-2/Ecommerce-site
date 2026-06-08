import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { UploadFolder } from '../enums/upload-folder.enum';

interface ImagePreset {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

const IMAGE_PRESETS: Record<UploadFolder, ImagePreset> = {
  [UploadFolder.PRODUCTS]: { maxWidth: 2000, maxHeight: 2000, quality: 82 },
  [UploadFolder.REVIEWS]: { maxWidth: 1600, maxHeight: 1600, quality: 80 },
  [UploadFolder.AVATARS]: { maxWidth: 512, maxHeight: 512, quality: 85 },
  [UploadFolder.MERCHANT_LOGOS]: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
  },
  [UploadFolder.CATEGORIES]: { maxWidth: 1200, maxHeight: 800, quality: 82 },
};

@Injectable()
export class ImageProcessorService {
  async compress(
    buffer: Buffer,
    folder: UploadFolder = UploadFolder.PRODUCTS,
  ): Promise<{ buffer: Buffer; format: string }> {
    const preset = IMAGE_PRESETS[folder];

    const processed = await sharp(buffer)
      .rotate()
      .resize(preset.maxWidth, preset.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: preset.quality })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: processed.data,
      format: processed.info.format,
    };
  }
}
