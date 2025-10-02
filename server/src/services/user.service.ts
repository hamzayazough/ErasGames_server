import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import {
  UserProfileDto,
  UpdateUserProfileDto,
  UpdateUserNameDto,
  CheckHandleAvailabilityDto,
  HandleAvailabilityResponseDto,
  UserNotificationPreferencesDto,
  UpdateNotificationPreferencesDto,
} from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get user profile information
   */
  async getUserProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToProfileDto(user);
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if handle is being updated and if it's available
    if (updateData.handle && updateData.handle !== user.handle) {
      const isAvailable = await this.isHandleAvailable(
        updateData.handle,
        userId,
      );
      if (!isAvailable) {
        throw new ConflictException('Handle is already taken');
      }
    }

    // Check timezone change restrictions
    if (updateData.tz && updateData.tz !== user.tz) {
      this.validateTimezoneChange(user);
    }

    // Update the user
    Object.assign(user, updateData);
    user.updatedAt = new Date();

    // Handle timezone change tracking
    if (updateData.tz && updateData.tz !== user.tz) {
      user.tzChangeCount30d += 1;
      user.tzStableSince = new Date();

      // Set freeze period if user has changed timezone multiple times
      if (user.tzChangeCount30d >= 3) {
        const freezeUntil = new Date();
        freezeUntil.setDate(freezeUntil.getDate() + 7); // 7 day freeze
        user.tzChangeFrozenUntil = freezeUntil;
      }
    }

    const updatedUser = await this.userRepository.save(user);
    return this.mapUserToProfileDto(updatedUser);
  }

  /**
   * Update user's name specifically
   */
  async updateUserName(
    userId: string,
    updateNameDto: UpdateUserNameDto,
  ): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = updateNameDto.name;
    user.updatedAt = new Date();

    const updatedUser = await this.userRepository.save(user);
    return this.mapUserToProfileDto(updatedUser);
  }

  /**
   * Check if a handle is available
   */
  async checkHandleAvailability(
    checkHandleDto: CheckHandleAvailabilityDto,
    currentUserId?: string,
  ): Promise<HandleAvailabilityResponseDto> {
    const { handle } = checkHandleDto;
    const isAvailable = await this.isHandleAvailable(handle, currentUserId);

    const response: HandleAvailabilityResponseDto = {
      available: isAvailable,
      handle: handle,
    };

    // If handle is not available, provide suggestions
    if (!isAvailable) {
      response.suggestions = await this.generateHandleSuggestions(
        handle,
        currentUserId,
      );
    }

    return response;
  }

  /**
   * Get user notification preferences
   */
  async getNotificationPreferences(
    userId: string,
  ): Promise<UserNotificationPreferencesDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['pushEnabled', 'notifWindowJSON'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      pushEnabled: user.pushEnabled,
      notifWindowJSON: user.notifWindowJSON,
    };
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    updateDto: UpdateNotificationPreferencesDto,
  ): Promise<UserNotificationPreferencesDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.pushEnabled !== undefined) {
      user.pushEnabled = updateDto.pushEnabled;
    }

    if (updateDto.notifWindowJSON !== undefined) {
      user.notifWindowJSON = updateDto.notifWindowJSON;
    }

    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return {
      pushEnabled: user.pushEnabled,
      notifWindowJSON: user.notifWindowJSON,
    };
  }

  // Private helper methods
  private async isHandleAvailable(
    handle: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.handle = :handle', { handle });

    // Exclude current user if provided
    if (excludeUserId) {
      query.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    const existingUser = await query.getOne();
    return !existingUser;
  }

  private async generateHandleSuggestions(
    baseHandle: string,
    excludeUserId?: string,
  ): Promise<string[]> {
    const suggestions: string[] = [];
    const maxSuggestions = 3;

    for (let i = 1; suggestions.length < maxSuggestions && i <= 100; i++) {
      const suggestion = `${baseHandle}${i}`;
      if (await this.isHandleAvailable(suggestion, excludeUserId)) {
        suggestions.push(suggestion);
      }
    }

    // Add some creative variations
    if (suggestions.length < maxSuggestions) {
      const variations = [
        `${baseHandle}_user`,
        `${baseHandle}_player`,
        `the_${baseHandle}`,
      ];

      for (const variation of variations) {
        if (suggestions.length >= maxSuggestions) break;
        if (await this.isHandleAvailable(variation, excludeUserId)) {
          suggestions.push(variation);
        }
      }
    }

    return suggestions;
  }

  private validateTimezoneChange(user: User): void {
    // Check if user is in a timezone change freeze period
    if (user.tzChangeFrozenUntil && user.tzChangeFrozenUntil > new Date()) {
      throw new BadRequestException(
        `Timezone changes are temporarily restricted until ${user.tzChangeFrozenUntil.toISOString()}`,
      );
    }

    // Check daily change limit (assuming we track changes in the last 30 days)
    if (user.tzChangeCount30d >= 5) {
      throw new BadRequestException(
        'You have reached the maximum number of timezone changes for this period',
      );
    }
  }

  private mapUserToProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      country: user.country,
      tz: user.tz,
      pushEnabled: user.pushEnabled,
      shareCountryOnLB: user.shareCountryOnLB,
      analyticsConsent: user.analyticsConsent,
      marketingConsent: user.marketingConsent,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
