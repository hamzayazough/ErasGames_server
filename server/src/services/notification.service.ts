import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as admin from 'firebase-admin';
import { UserDevice } from '../database/entities/user-device.entity';

/**
 * Notification service using Firebase Cloud Messaging (FCM)
 * Sends real push notifications to user devices
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(UserDevice)
    private readonly userDeviceRepository: Repository<UserDevice>,
  ) {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    this.logger.log('NotificationService initialized with FCM');
  }

  /**
   * Send push notification to all users about new daily quiz
   */
  async sendDailyQuizNotification(
    quizId: string,
    dropTime: Date,
  ): Promise<void> {
    this.logger.log(`Sending daily quiz notification for quiz ${quizId}`);

    try {
      // Get all active FCM tokens from database
      const userTokens = await this.getUserFCMTokens();

      if (userTokens.length === 0) {
        this.logger.warn('No active user tokens found');
        return;
      }

      // Prepare notification payload
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: '🎵 Daily Quiz is Ready!',
          body: "Today's Taylor Swift quiz is now available. Test your knowledge!",
          imageUrl: 'https://your-cdn.com/quiz-notification-image.png',
        },
        data: {
          type: 'daily_quiz',
          quizId: quizId,
          dropTime: dropTime.toISOString(),
          action: 'open_quiz',
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#FF6B9D', // Taylor Swift themed color
            channelId: 'daily_quiz_channel',
            priority: 'high' as const,
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              'mutable-content': 1,
              category: 'DAILY_QUIZ',
            },
          },
        },
        tokens: userTokens,
      };

      // Send notification via FCM (send to each token individually for better error handling)
      const responses = await Promise.allSettled(
        userTokens.map((token) =>
          admin.messaging().send({
            notification: message.notification,
            data: message.data,
            android: message.android,
            apns: message.apns,
            token,
          }),
        ),
      );

      const successCount = responses.filter(
        (r) => r.status === 'fulfilled',
      ).length;
      const failureCount = responses.filter(
        (r) => r.status === 'rejected',
      ).length;

      const response = { successCount, failureCount };

      this.logger.log('📱 REAL PUSH NOTIFICATION SENT:');
      this.logger.log(`   👥 Target Users: ${userTokens.length}`);
      this.logger.log(`   ✅ Successful: ${response.successCount}`);
      this.logger.log(`   ❌ Failed: ${response.failureCount}`);
      this.logger.log(`   📊 Quiz ID: ${quizId}`);

      // Handle failed tokens (cleanup invalid tokens)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        responses.forEach((result, index) => {
          if (result.status === 'rejected') {
            const error = result.reason as Error;
            if (
              error.message?.includes('invalid-registration-token') ||
              error.message?.includes('registration-token-not-registered')
            ) {
              failedTokens.push(userTokens[index]);
            }
          }
        });

        if (failedTokens.length > 0) {
          await this.removeInvalidTokens(failedTokens);
        }
      }
    } catch (error) {
      this.logger.error('Failed to send daily quiz notification', error);
      throw error;
    }
  }

  /**
   * Get all active FCM tokens from database
   */
  private async getUserFCMTokens(): Promise<string[]> {
    try {
      const activeDevices = await this.userDeviceRepository.find({
        where: { isActive: true },
        select: ['fcmToken'],
      });

      const tokens = activeDevices.map((device) => device.fcmToken);
      this.logger.log(
        `Retrieved ${tokens.length} active FCM tokens from database`,
      );

      return tokens;
    } catch (error) {
      this.logger.error('Failed to retrieve FCM tokens from database', error);
      // Return empty array to prevent notification failure
      return [];
    }
  }

  /**
   * Remove invalid FCM tokens from database
   */
  private async removeInvalidTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;

    try {
      // Mark devices as inactive instead of deleting them
      const result = await this.userDeviceRepository.update(
        { fcmToken: In(tokens) },
        { isActive: false, updatedAt: new Date() },
      );

      this.logger.log(
        `Marked ${result.affected} devices as inactive due to invalid FCM tokens`,
      );

      // Optional: Delete tokens that are older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleteResult = await this.userDeviceRepository
        .createQueryBuilder()
        .delete()
        .from(UserDevice)
        .where('fcmToken IN (:...tokens)', { tokens })
        .andWhere('isActive = :isActive', { isActive: false })
        .andWhere('updatedAt < :thirtyDaysAgo', { thirtyDaysAgo })
        .execute();

      if (deleteResult.affected && deleteResult.affected > 0) {
        this.logger.log(
          `Permanently deleted ${deleteResult.affected} old inactive devices`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to remove invalid FCM tokens', error);
    }
  }

  /**
   * Register a new FCM token for a user
   */
  async registerUserToken(
    userId: string,
    fcmToken: string,
    platform: 'ios' | 'android',
    appVersion?: string,
    deviceModel?: string,
  ): Promise<void> {
    try {
      // Use upsert to handle existing devices
      await this.userDeviceRepository.upsert(
        {
          userId,
          fcmToken,
          platform,
          isActive: true,
          appVersion,
          deviceModel,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        },
        {
          conflictPaths: ['userId', 'platform'],
          skipUpdateIfNoValuesChanged: false,
        },
      );

      this.logger.log(`Registered FCM token for user ${userId} on ${platform}`);

      // Update last seen time for existing token if it changed
      if (fcmToken) {
        await this.userDeviceRepository.update(
          { userId, platform },
          { lastSeenAt: new Date() },
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to register FCM token for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send test notification to specific user
   */
  async sendTestNotification(fcmToken: string): Promise<void> {
    const message: admin.messaging.Message = {
      notification: {
        title: '🧪 Test Notification',
        body: 'Your notifications are working perfectly!',
      },
      token: fcmToken,
    };

    await admin.messaging().send(message);
    this.logger.log('✅ Test notification sent successfully');
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{
    totalActiveDevices: number;
    iosDevices: number;
    androidDevices: number;
    inactiveDevices: number;
  }> {
    const [totalActive, ios, android, inactive] = await Promise.all([
      this.userDeviceRepository.count({ where: { isActive: true } }),
      this.userDeviceRepository.count({
        where: { isActive: true, platform: 'ios' },
      }),
      this.userDeviceRepository.count({
        where: { isActive: true, platform: 'android' },
      }),
      this.userDeviceRepository.count({ where: { isActive: false } }),
    ]);

    return {
      totalActiveDevices: totalActive,
      iosDevices: ios,
      androidDevices: android,
      inactiveDevices: inactive,
    };
  }

  /**
   * Remove a specific user's device
   */
  async removeUserDevice(
    userId: string,
    platform: 'ios' | 'android',
  ): Promise<void> {
    await this.userDeviceRepository.update(
      { userId, platform },
      { isActive: false, updatedAt: new Date() },
    );

    this.logger.log(`Deactivated device for user ${userId} on ${platform}`);
  }

  /**
   * Get all devices for a specific user
   */
  async getUserDevices(userId: string): Promise<UserDevice[]> {
    return this.userDeviceRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Send notification to specific users only
   */
  async sendNotificationToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const devices = await this.userDeviceRepository.find({
      where: {
        userId: In(userIds),
        isActive: true,
      },
      select: ['fcmToken'],
    });

    if (devices.length === 0) {
      this.logger.warn(`No active devices found for ${userIds.length} users`);
      return;
    }

    const tokens = devices.map((device) => device.fcmToken);

    // Send to each token individually for better error handling
    const responses = await Promise.allSettled(
      tokens.map((token) =>
        admin.messaging().send({
          notification: { title, body },
          data: data || {},
          token,
        }),
      ),
    );

    const successCount = responses.filter(
      (r) => r.status === 'fulfilled',
    ).length;
    const failureCount = responses.filter(
      (r) => r.status === 'rejected',
    ).length;

    this.logger.log(
      `Sent targeted notification to ${successCount}/${tokens.length} devices`,
    );

    if (failureCount > 0) {
      const failedTokens: string[] = [];
      responses.forEach((result, index) => {
        if (result.status === 'rejected') {
          const error = result.reason as Error;
          if (
            error.message?.includes('invalid-registration-token') ||
            error.message?.includes('registration-token-not-registered')
          ) {
            failedTokens.push(tokens[index]);
          }
        }
      });

      if (failedTokens.length > 0) {
        await this.removeInvalidTokens(failedTokens);
      }
    }
  }
}
