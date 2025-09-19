import { Controller, Get, Logger } from '@nestjs/common';
import { CdnService } from '../../database/services/daily-quiz-composer/cdn.service';

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(private readonly cdnService: CdnService) {}

  @Get('cdn-health')
  async testCdnHealth() {
    try {
      this.logger.log('Testing CDN health...');

      const healthCheck = await this.cdnService.healthCheck();

      return {
        success: true,
        cdn: healthCheck,
        baseUrl: this.cdnService.getCdnBaseUrl(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('CDN health check failed:', error);
      return {
        success: false,
        error: error,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('cdn-upload')
  async testCdnUpload() {
    try {
      this.logger.log('Testing CDN upload...');

      // Create a test template
      const testTemplate = {
        id: 'test-quiz-123',
        version: 1,
        questions: [
          {
            id: 'test-q1',
            prompt: { text: 'Test question?' },
            choices: [
              { id: 'a', text: 'Option A' },
              { id: 'b', text: 'Option B' },
            ],
          },
        ],
        metadata: {
          generatedAt: new Date().toISOString(),
          totalQuestions: 1,
        },
      };

      const templateKey = this.cdnService.generateTemplateKey(
        'test-quiz-123',
        1,
      );
      const result = await this.cdnService.uploadTemplate(
        templateKey,
        testTemplate,
      );

      return {
        success: true,
        upload: result,
        message: 'Test template uploaded successfully!',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('CDN upload test failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
