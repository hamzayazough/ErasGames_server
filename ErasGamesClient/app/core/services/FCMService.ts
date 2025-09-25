import messaging from '@react-native-firebase/messaging';
import {Platform, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = '@fcm_token';
const FCM_PERMISSION_REQUESTED = '@fcm_permission_requested';

export class FCMService {
  /**
   * Request notification permission and get FCM token
   */
  static async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      // Check if permission was already requested
      const permissionRequested = await AsyncStorage.getItem(FCM_PERMISSION_REQUESTED);
      
      if (!permissionRequested) {
        const authStatus = await messaging().requestPermission();
        await AsyncStorage.setItem(FCM_PERMISSION_REQUESTED, 'true');
        
        const enabled = 
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('Push notification permission denied');
          return null;
        }
        
        console.log('🔔 Push notification permission granted');
      }

      // Get FCM token
      const fcmToken = await messaging().getToken();
      
      if (fcmToken) {
        console.log('📱 FCM Token received:', fcmToken.substring(0, 20) + '...');
        
        // Store token locally
        await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
        
        return fcmToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Get stored FCM token
   */
  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(FCM_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting stored FCM token:', error);
      return null;
    }
  }

  /**
   * Register FCM token with server
   */
  static async registerTokenWithServer(token: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch('http://10.0.2.2:3000/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          fcmToken: token,
          platform: Platform.OS,
          appVersion: '1.0.0', // You can get this from app info
          deviceModel: Platform.OS === 'ios' ? 'iPhone' : 'Android Device'
        }),
      });

      if (response.ok) {
        console.log('✅ FCM token registered with server');
        return true;
      } else {
        console.error('❌ Failed to register FCM token with server');
        return false;
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
      return false;
    }
  }

  /**
   * Setup foreground message handler
   */
  static setupForegroundMessageHandler() {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground notification received:', remoteMessage);
      
      if (remoteMessage.data?.type === 'daily_quiz') {
        // Show in-app notification for daily quiz
        Alert.alert(
          remoteMessage.notification?.title || '🎵 Daily Quiz Ready!',
          remoteMessage.notification?.body || "Today's quiz is now available!",
          [
            {
              text: 'Play Now',
              onPress: () => {
                // Navigate to quiz screen
                console.log('Navigate to quiz:', remoteMessage.data?.quizId);
                // You'll implement navigation logic here
              }
            },
            {
              text: 'Later',
              style: 'cancel'
            }
          ]
        );
      }
    });

    return unsubscribe;
  }

  /**
   * Setup background message handler
   */
  static setupBackgroundMessageHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📩 Background notification received:', remoteMessage);
      
      // Handle background notification
      // This runs even when app is closed
    });
  }

  /**
   * Setup notification opened handler (when user taps notification)
   */
  static setupNotificationOpenedHandler(navigationRef: any) {
    // Handle notification when app is opened from background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📱 App opened via notification:', remoteMessage);
      
      if (remoteMessage.data?.type === 'daily_quiz') {
        // Navigate to quiz screen
        navigationRef?.current?.navigate('Quiz', {
          quizId: remoteMessage.data.quizId
        });
      }
    });

    // Handle notification when app is opened from quit state
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('📱 App opened from quit state via notification:', remoteMessage);
        
        if (remoteMessage.data?.type === 'daily_quiz') {
          // Navigate to quiz screen after app loads
          setTimeout(() => {
            navigationRef?.current?.navigate('Quiz', {
              quizId: remoteMessage.data?.quizId
            });
          }, 1000); // Wait for navigation to be ready
        }
      }
    });
  }

  /**
   * Handle token refresh
   */
  static setupTokenRefreshHandler(userId: string) {
    messaging().onTokenRefresh(async token => {
      console.log('🔄 FCM token refreshed:', token.substring(0, 20) + '...');
      
      // Store new token
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      
      // Register new token with server
      await this.registerTokenWithServer(token, userId);
    });
  }
}