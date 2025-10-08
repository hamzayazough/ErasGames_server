import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Body,
  MaxFileSizeValidator,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../guards/admin.guard';
import { MediaUploadService } from '../services/media-upload.service';

@Controller('admin/media')
@UseGuards(AdminGuard)
export class MediaUploadController {
  constructor(private readonly mediaUploadService: MediaUploadService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/i }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    try {
      if (!image) {
        throw new BadRequestException('No image file provided');
      }

      const result = await this.mediaUploadService.uploadImage(
        image.buffer,
        image.originalname,
      );

      return {
        success: true,
        data: {
          url: result.url,
          key: result.key,
          filename: image.originalname,
          size: image.size,
          type: 'image',
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('upload-audio')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadAudio(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: /(mp3|wav|ogg|mpeg)$/i }),
        ],
      }),
    )
    audio: Express.Multer.File,
  ) {
    try {
      if (!audio) {
        throw new BadRequestException('No audio file provided');
      }

      const result = await this.mediaUploadService.uploadAudio(
        audio.buffer,
        audio.originalname,
      );

      return {
        success: true,
        data: {
          url: result.url,
          key: result.key,
          filename: audio.originalname,
          size: audio.size,
          type: 'audio',
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('upload-multiple')
  @UseInterceptors(FileInterceptor('files'))
  async uploadMultipleFiles(
    @Body() body: { type: 'image' | 'audio' },
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      let result;
      if (body.type === 'image') {
        result = await this.mediaUploadService.uploadImage(
          file.buffer,
          file.originalname,
        );
      } else if (body.type === 'audio') {
        result = await this.mediaUploadService.uploadAudio(
          file.buffer,
          file.originalname,
        );
      } else {
        throw new BadRequestException('Invalid file type specified');
      }

      return {
        success: true,
        data: {
          url: result.url,
          key: result.key,
          filename: file.originalname,
          size: file.size,
          type: body.type,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
