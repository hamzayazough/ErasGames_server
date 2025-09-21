import {httpService} from './http';
import {AuthenticatedUser} from './config';
import auth from '@react-native-firebase/auth';

export class AuthApiService {
  /**
   * Authenticate user with server using Firebase token
   * This should be called when:
   * - User logs in for the first time
   * - App starts and we need to sync user data
   * - Token is refreshed and we need to update server
   */
  async authenticate(): Promise<AuthenticatedUser> {
    try {
      // Get current Firebase user
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated Firebase user found');
      }

      // Get fresh Firebase ID token
      const firebaseToken = await currentUser.getIdToken(true); // Force refresh

      // Set the token in HTTP service for authentication
      httpService.setAuthToken(firebaseToken);

      // Call server authenticate endpoint
      const response = await httpService.post<AuthenticatedUser>(
        '/auth/authenticate',
      );

      console.log('✅ User authenticated with server:', response.id);
      return response;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      httpService.setAuthToken(null); // Clear token on failure
      throw error;
    }
  }

  /**
   * Refresh user data from server
   * Call this when you need fresh user information
   */
  async refreshUserData(): Promise<AuthenticatedUser> {
    return this.authenticate();
  }

  /**
   * Logout - clear authentication token
   */
  logout() {
    httpService.setAuthToken(null);
    console.log('🚪 Logged out - auth token cleared');
  }

  /**
   * Check if user is authenticated with server
   * This checks if we have a valid Firebase token and user
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return false;
      }

      // Check if token is still valid
      const token = await currentUser.getIdToken(false); // Don't force refresh
      return !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Get current Firebase user ID
   */
  getCurrentUserId(): string | null {
    return auth().currentUser?.uid || null;
  }

  /**
   * Get current Firebase user email
   */
  getCurrentUserEmail(): string | null {
    return auth().currentUser?.email || null;
  }

  /**
   * Set authentication token manually (useful for testing or special cases)
   */
  setAuthToken(token: string | null) {
    httpService.setAuthToken(token);
  }
}

// Create and export singleton instance
export const authApiService = new AuthApiService();
