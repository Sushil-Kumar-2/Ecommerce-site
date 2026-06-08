export interface UploadedImageResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  folder: string;
}

export interface UploadImageResponse {
  success: boolean;
  image: UploadedImageResult;
}

export interface UploadMultipleResponse {
  success: boolean;
  count: number;
  images: UploadedImageResult[];
}
