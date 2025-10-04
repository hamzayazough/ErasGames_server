import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaUploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET');

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing required AWS configuration');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = bucketName;
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    contentType: string,
    folder: 'images' | 'audio' = 'images',
  ): Promise<{ url: string; key: string }> {
    const fileExtension = filename.split('.').pop();
    const uniqueKey = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uniqueKey,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    });

    try {
      await this.s3Client.send(command);
      const url = `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${uniqueKey}`;

      return {
        url,
        key: uniqueKey,
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadImage(
    file: Buffer,
    filename: string,
  ): Promise<{ url: string; key: string }> {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    const contentType = this.getContentType(filename);

    if (!allowedTypes.includes(contentType)) {
      throw new Error('Invalid image file type. Allowed: JPEG, PNG, GIF, WebP');
    }

    return this.uploadFile(file, filename, contentType, 'images');
  }

  async uploadAudio(
    file: Buffer,
    filename: string,
  ): Promise<{ url: string; key: string }> {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    const contentType = this.getContentType(filename);

    if (!allowedTypes.includes(contentType)) {
      throw new Error('Invalid audio file type. Allowed: MP3, WAV, OGG');
    }

    return this.uploadFile(file, filename, contentType, 'audio');
  }

  private getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    if (!extension) {
      return 'application/octet-stream';
    }

    const mimeTypes: { [key: string]: string } = {
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      // Audio
      mp3: 'audio/mpeg',
      mpeg: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }
}
