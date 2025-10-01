import {httpService} from './http';

// Types for User API responses
export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  handle: string | null;
  country: string | null;
  tz: string;
  pushEnabled: boolean;
  shareCountryOnLB: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface UpdateUserProfileRequest {
  name?: string;
  handle?: string;
  country?: string;
  tz?: string;
  pushEnabled?: boolean;
  shareCountryOnLB?: boolean;
  analyticsConsent?: boolean;
  marketingConsent?: boolean;
}

export interface UpdateUserNameRequest {
  name: string;
}

export interface CheckHandleAvailabilityRequest {
  handle: string;
}

export interface HandleAvailabilityResponse {
  available: boolean;
  handle: string;
  suggestions?: string[];
}

export interface UserNotificationPreferences {
  pushEnabled: boolean;
  notifWindowJSON: {start: string; end: string} | null;
}

export interface UpdateNotificationPreferencesRequest {
  pushEnabled?: boolean;
  notifWindowJSON?: {start: string; end: string} | null;
}

// Error response types
export interface UserErrorResponse {
  message: string;
  status?: number;
  code?: string;
}

/**
 * User API Service
 * Handles all user-related API calls
 */
export class UserApiService {
  /**
   * Get current user's profile information
   * Requires authentication
   */
  async getUserProfile(): Promise<UserProfile> {
    return httpService.get<UserProfile>('/user/profile');
  }

  /**
   * Update user profile information
   * Requires authentication
   */
  async updateUserProfile(
    updateData: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    return httpService.put<UserProfile>('/user/profile', updateData);
  }

  /**
   * Update user's name specifically
   * Requires authentication
   */
  async updateUserName(
    updateData: UpdateUserNameRequest,
  ): Promise<UserProfile> {
    return httpService.patch<UserProfile>('/user/name', updateData);
  }

  /**
   * Check if a handle is available (POST method)
   * Public endpoint - no authentication required
   */
  async checkHandleAvailability(
    handleData: CheckHandleAvailabilityRequest,
  ): Promise<HandleAvailabilityResponse> {
    return httpService.post<HandleAvailabilityResponse>(
      '/user/check-handle-availability',
      handleData,
    );
  }

  /**
   * Check if a handle is available (GET method with query parameter)
   * Public endpoint - no authentication required
   */
  async checkHandleAvailabilityQuery(
    handle: string,
  ): Promise<HandleAvailabilityResponse> {
    return httpService.get<HandleAvailabilityResponse>(
      '/user/check-handle-availability',
      {
        params: {handle},
      },
    );
  }

  /**
   * Get user notification preferences
   * Requires authentication
   */
  async getNotificationPreferences(): Promise<UserNotificationPreferences> {
    return httpService.get<UserNotificationPreferences>('/user/notifications');
  }

  /**
   * Update user notification preferences
   * Requires authentication
   */
  async updateNotificationPreferences(
    updateData: UpdateNotificationPreferencesRequest,
  ): Promise<UserNotificationPreferences> {
    return httpService.put<UserNotificationPreferences>(
      '/user/notifications',
      updateData,
    );
  }

  /**
   * Helper method to handle authentication errors
   */
  private async handleAuthenticatedRequest<T>(
    requestFn: () => Promise<T>,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (error?.status === 401) {
        throw new Error(
          'Authentication required. Please log in to access this feature.',
        );
      }
      if (error?.status === 403) {
        throw new Error(
          'Access denied. You do not have permission to perform this action.',
        );
      }
      if (error?.status === 404) {
        throw new Error(
          'User not found. Please check if you are logged in correctly.',
        );
      }
      if (error?.status === 409) {
        throw new Error(
          error?.message ||
            'Conflict: The requested change conflicts with existing data.',
        );
      }
      throw error;
    }
  }

  /**
   * Get user profile with authentication handling
   */
  async getUserProfileSecure(): Promise<UserProfile> {
    return this.handleAuthenticatedRequest(() => this.getUserProfile());
  }

  /**
   * Update user profile with authentication handling
   */
  async updateUserProfileSecure(
    updateData: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    return this.handleAuthenticatedRequest(() =>
      this.updateUserProfile(updateData),
    );
  }

  /**
   * Update user name with authentication handling
   */
  async updateUserNameSecure(
    updateData: UpdateUserNameRequest,
  ): Promise<UserProfile> {
    return this.handleAuthenticatedRequest(() =>
      this.updateUserName(updateData),
    );
  }

  /**
   * Get notification preferences with authentication handling
   */
  async getNotificationPreferencesSecure(): Promise<UserNotificationPreferences> {
    return this.handleAuthenticatedRequest(() =>
      this.getNotificationPreferences(),
    );
  }

  /**
   * Update notification preferences with authentication handling
   */
  async updateNotificationPreferencesSecure(
    updateData: UpdateNotificationPreferencesRequest,
  ): Promise<UserNotificationPreferences> {
    return this.handleAuthenticatedRequest(() =>
      this.updateNotificationPreferences(updateData),
    );
  }

  /**
   * Validate handle format on frontend before sending to backend
   */
  validateHandleFormat(handle: string): {isValid: boolean; message?: string} {
    if (!handle) {
      return {isValid: false, message: 'Handle cannot be empty'};
    }

    if (handle.length < 3) {
      return {
        isValid: false,
        message: 'Handle must be at least 3 characters long',
      };
    }

    if (handle.length > 60) {
      return {
        isValid: false,
        message: 'Handle cannot be longer than 60 characters',
      };
    }

    const validFormat = /^[a-zA-Z0-9_-]+$/;
    if (!validFormat.test(handle)) {
      return {
        isValid: false,
        message:
          'Handle can only contain letters, numbers, underscores and hyphens',
      };
    }

    return {isValid: true};
  }

  /**
   * Validate name format on frontend before sending to backend
   */
  validateNameFormat(name: string): {isValid: boolean; message?: string} {
    if (!name) {
      return {isValid: false, message: 'Name cannot be empty'};
    }

    if (name.length < 1) {
      return {
        isValid: false,
        message: 'Name must be at least 1 character long',
      };
    }

    if (name.length > 120) {
      return {
        isValid: false,
        message: 'Name cannot be longer than 120 characters',
      };
    }

    return {isValid: true};
  }

  /**
   * Validate country code format (2-letter ISO code)
   */
  validateCountryFormat(country: string): {isValid: boolean; message?: string} {
    if (!country) {
      return {isValid: false, message: 'Country code cannot be empty'};
    }

    if (country.length !== 2) {
      return {isValid: false, message: 'Country must be a 2-letter ISO code'};
    }

    const validFormat = /^[A-Z]{2}$/;
    if (!validFormat.test(country.toUpperCase())) {
      return {
        isValid: false,
        message: 'Country must be a valid 2-letter ISO code (e.g., US, CA, GB)',
      };
    }

    return {isValid: true};
  }

  /**
   * Validate timezone format
   */
  validateTimezoneFormat(tz: string): {isValid: boolean; message?: string} {
    if (!tz) {
      return {isValid: false, message: 'Timezone cannot be empty'};
    }

    // Basic timezone format validation (can be enhanced with a proper timezone list)
    const validFormat = /^[A-Za-z_]+\/[A-Za-z_]+$/;
    if (!validFormat.test(tz)) {
      return {
        isValid: false,
        message:
          'Timezone must be in format like "America/Toronto" or "Europe/London"',
      };
    }

    return {isValid: true};
  }

  /**
   * Get all available timezones (this would typically come from a separate API or static list)
   */
  getCommonTimezones(): Array<{value: string; label: string; offset: string}> {
    return [
      {value: 'America/New_York', label: 'Eastern Time', offset: 'GMT-5/-4'},
      {value: 'America/Chicago', label: 'Central Time', offset: 'GMT-6/-5'},
      {value: 'America/Denver', label: 'Mountain Time', offset: 'GMT-7/-6'},
      {value: 'America/Los_Angeles', label: 'Pacific Time', offset: 'GMT-8/-7'},
      {value: 'America/Toronto', label: 'Toronto', offset: 'GMT-5/-4'},
      {value: 'America/Vancouver', label: 'Vancouver', offset: 'GMT-8/-7'},
      {value: 'Europe/London', label: 'London', offset: 'GMT+0/+1'},
      {value: 'Europe/Paris', label: 'Paris', offset: 'GMT+1/+2'},
      {value: 'Europe/Berlin', label: 'Berlin', offset: 'GMT+1/+2'},
      {value: 'Asia/Tokyo', label: 'Tokyo', offset: 'GMT+9'},
      {value: 'Asia/Shanghai', label: 'Shanghai', offset: 'GMT+8'},
      {value: 'Australia/Sydney', label: 'Sydney', offset: 'GMT+10/+11'},
      {value: 'UTC', label: 'UTC', offset: 'GMT+0'},
    ];
  }
}

// Create and export singleton instance
export const userApiService = new UserApiService();

// Export individual functions for convenience
export const {
  getUserProfile,
  updateUserProfile,
  updateUserName,
  checkHandleAvailability,
  checkHandleAvailabilityQuery,
  getNotificationPreferences,
  updateNotificationPreferences,
  getUserProfileSecure,
  updateUserProfileSecure,
  updateUserNameSecure,
  getNotificationPreferencesSecure,
  updateNotificationPreferencesSecure,
  validateHandleFormat,
  validateNameFormat,
  validateCountryFormat,
  validateTimezoneFormat,
  getCommonTimezones,
} = userApiService;
