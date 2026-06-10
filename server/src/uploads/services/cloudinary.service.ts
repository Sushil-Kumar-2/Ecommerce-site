import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadFolder } from '../enums/upload-folder.enum';

@Injectable()
export class CloudinaryService {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseFolder: string;

  constructor(private readonly configService: ConfigService) {
    this.cloudName =
      this.configService.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    this.apiKey = this.configService.get<string>('CLOUDINARY_API_KEY') ?? '';
    this.apiSecret =
      this.configService.get<string>('CLOUDINARY_API_SECRET') ?? '';
    this.baseFolder =
      this.configService.get<string>('CLOUDINARY_BASE_FOLDER') ?? 'ecommerce';
  }

  isConfigured(): boolean {
    return Boolean(this.cloudName && this.apiKey && this.apiSecret);
  }

  async uploadBuffer(
    buffer: Buffer,
    folder: UploadFolder,
    format: string,
  ): Promise<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  }> {
    if (!this.isConfigured()) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    const { v2: cloudinary } = await import('cloudinary');

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });

    const cloudinaryFolder = `${this.baseFolder}/${folder}`;

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: cloudinaryFolder,
          resource_type: 'image',
          format,
          transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      stream.end(buffer);
    });
  }
}
