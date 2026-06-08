import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { ImageProcessorService } from './services/image-processor.service';
import { CloudinaryService } from './services/cloudinary.service';
import { LocalStorageService } from './services/local-storage.service';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    ImageProcessorService,
    CloudinaryService,
    LocalStorageService,
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
