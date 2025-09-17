import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Service for handling CDN uploads to AWS S3
 *
 * Manages the upload of quiz templates and other static assets
 * to S3 for delivery via CloudFront CDN.
 */
@Injectable()
export class CdnService {
  private readonly logger = new Logger(CdnService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cdnBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    // Get AWS credentials and validate they exist
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'AWS credentials not provided. CDN functionality will be limited.',
      );
    }

    // Initialize S3 client
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'ca-central-1',
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });

    this.bucketName =
      this.configService.get<string>('AWS_S3_BUCKET') ||
      'erasgames-quiz-templates';
    this.cdnBaseUrl =
      this.configService.get<string>('CDN_BASE_URL') ||
      'https://d178zw1odq16p.cloudfront.net';
  }

  /**
   * Upload a quiz template JSON to S3/CloudFront
   */
  async uploadTemplate(
    templateKey: string,
    templateContent: any,
    contentType: string = 'application/json',
  ): Promise<{ templateUrl: string; key: string }> {
    try {
      // Check if credentials are available
      const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.configService.get<string>(
        'AWS_SECRET_ACCESS_KEY',
      );

      if (!accessKeyId || !secretAccessKey) {
        throw new Error(
          'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.',
        );
      }

      this.logger.debug(`Uploading template to S3: ${templateKey}`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: templateKey,
        Body: JSON.stringify(templateContent, null, 2),
        ContentType: contentType,
        CacheControl: 'public, max-age=86400', // 24 hours cache
        ContentEncoding: 'utf-8',
        Metadata: {
          uploadedAt: new Date().toISOString(),
          service: 'daily-quiz-composer',
        },
      });

      await this.s3Client.send(command);

      // Construct the CloudFront URL
      const templateUrl = `${this.cdnBaseUrl}/${templateKey}`;

      this.logger.log(`Template uploaded successfully: ${templateUrl}`);

      return {
        templateUrl,
        key: templateKey,
      };
    } catch (error) {
      this.logger.error(`Failed to upload template ${templateKey}:`, error);
      throw new Error(`CDN upload failed: ${error.message}`);
    }
  }

  /**
   * Generate a unique template key for S3 storage
   */
  generateTemplateKey(dailyQuizId: string, version: number): string {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return `quiz/${dateStr}/${dailyQuizId}/v${version}-${timestamp}.json`;
  }

  /**
   * Check if S3 connection is working
   */
  async healthCheck(): Promise<{ isHealthy: boolean; message: string }> {
    try {
      // Check if credentials are available
      const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.configService.get<string>(
        'AWS_SECRET_ACCESS_KEY',
      );

      if (!accessKeyId || !secretAccessKey) {
        return {
          isHealthy: false,
          message:
            'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.',
        };
      }

      // Try to list objects in the bucket (this validates permissions)
      const { HeadBucketCommand } = await import('@aws-sdk/client-s3');
      const command = new HeadBucketCommand({ Bucket: this.bucketName });

      await this.s3Client.send(command);

      return {
        isHealthy: true,
        message: `S3 connection healthy. Bucket: ${this.bucketName}`,
      };
    } catch (error) {
      this.logger.warn(`S3 health check failed:`, error);
      return {
        isHealthy: false,
        message: `S3 connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Get CDN base URL
   */
  getCdnBaseUrl(): string {
    return this.cdnBaseUrl;
  }

  /**
   * Delete a template from S3 (cleanup old versions)
   */
  async deleteTemplate(templateKey: string): Promise<void> {
    try {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: templateKey,
      });

      await this.s3Client.send(command);
      this.logger.debug(`Deleted template: ${templateKey}`);
    } catch (error) {
      this.logger.warn(`Failed to delete template ${templateKey}:`, error);
      // Don't throw - deletion failures shouldn't break the main flow
    }
  }
}
