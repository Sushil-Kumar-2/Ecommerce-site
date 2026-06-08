import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

import { UploadFolder } from '../enums/upload-folder.enum';

@Injectable()
export class LocalStorageService {
  private readonly uploadRoot: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadRoot = join(process.cwd(), 'uploads');
    const port = this.configService.get<string>('PORT') ?? '3000';
    this.publicBaseUrl =
      this.configService.get<string>('PUBLIC_API_URL') ??
      `http://localhost:${port}`;
  }

  async saveBuffer(
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
    const folderPath = join(this.uploadRoot, folder);
    await mkdir(folderPath, { recursive: true });

    const filename = `${randomUUID()}.${format}`;
    const filePath = join(folderPath, filename);
    await writeFile(filePath, buffer);

    const url = `${this.publicBaseUrl}/static/uploads/${folder}/${filename}`;

    return {
      url,
      publicId: `${folder}/${filename}`,
      width: 0,
      height: 0,
      format,
      bytes: buffer.length,
    };
  }
}
