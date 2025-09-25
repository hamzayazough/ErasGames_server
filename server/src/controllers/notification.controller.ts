import { Controller, Post, Body, Logger } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';

@Controller('api/notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post('register-token')
  async registerToken(@Body() body: {
    userId: string;
    fcmToken: string;
    platform: 'ios' | 'android';
    appVersion?: string;
    deviceModel?: string;
  }) {
    this.logger.log(`Registering FCM token for user ${body.userId} on ${body.platform}`);

    try {
      await this.notificationService.registerUserToken(
        body.userId,
        body.fcmToken,
        body.platform,
        body.appVersion,
        body.deviceModel
      );

      return {
        success: true,
        message: 'FCM token registered successfully'
      };
    } catch (error) {
      this.logger.error('Failed to register FCM token', error);
      throw error;
    }
  }

  @Post('test-notification')
  async sendTestNotification(@Body() body: { fcmToken: string }) {
    this.logger.log('Sending test notification');

    try {
      await this.notificationService.sendTestNotification(body.fcmToken);

      return {
        success: true,
        message: 'Test notification sent successfully'
      };
    } catch (error) {
      this.logger.error('Failed to send test notification', error);
      throw error;
    }
  }
}