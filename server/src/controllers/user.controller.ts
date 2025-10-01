import {
  Controller,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  UserProfileDto,
  UpdateUserProfileDto,
  UpdateUserNameDto,
  CheckHandleAvailabilityDto,
  HandleAvailabilityResponseDto,
  UserNotificationPreferencesDto,
  UpdateNotificationPreferencesDto,
} from '../dto/user.dto';
import { FirebaseUser } from '../decorators/firebase-user.decorator';
import type { FirebaseUser as FirebaseUserType } from '../decorators/firebase-user.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * GET /user/profile - Get current user's profile information
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(
    @FirebaseUser() firebaseUser: FirebaseUserType,
  ): Promise<UserProfileDto> {
    return await this.userService.getUserProfile(firebaseUser.uid);
  }

  /**
   * PUT /user/profile - Update user profile information
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateUserProfile(
    @FirebaseUser() firebaseUser: FirebaseUserType,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    return await this.userService.updateUserProfile(
      firebaseUser.uid,
      updateUserProfileDto,
    );
  }

  /**
   * PATCH /user/name - Update user's name specifically
   */
  @Patch('name')
  @HttpCode(HttpStatus.OK)
  async updateUserName(
    @FirebaseUser() firebaseUser: FirebaseUserType,
    @Body() updateUserNameDto: UpdateUserNameDto,
  ): Promise<UserProfileDto> {
    return await this.userService.updateUserName(
      firebaseUser.uid,
      updateUserNameDto,
    );
  }

  /**
   * POST /user/check-handle-availability - Check if a handle is available
   */
  @Post('check-handle-availability')
  @HttpCode(HttpStatus.OK)
  async checkHandleAvailability(
    @Body() checkHandleDto: CheckHandleAvailabilityDto,
  ): Promise<HandleAvailabilityResponseDto> {
    return await this.userService.checkHandleAvailability(checkHandleDto);
  }

  /**
   * GET /user/check-handle-availability - Alternative endpoint using query parameter
   */
  @Get('check-handle-availability')
  @HttpCode(HttpStatus.OK)
  async checkHandleAvailabilityQuery(
    @Query('handle') handle: string,
  ): Promise<HandleAvailabilityResponseDto> {
    const checkHandleDto: CheckHandleAvailabilityDto = { handle };
    return await this.userService.checkHandleAvailability(checkHandleDto);
  }

  /**
   * GET /user/notifications - Get user notification preferences
   */
  @Get('notifications')
  @HttpCode(HttpStatus.OK)
  async getNotificationPreferences(
    @FirebaseUser() firebaseUser: FirebaseUserType,
  ): Promise<UserNotificationPreferencesDto> {
    return await this.userService.getNotificationPreferences(firebaseUser.uid);
  }

  /**
   * PUT /user/notifications - Update user notification preferences
   */
  @Put('notifications')
  @HttpCode(HttpStatus.OK)
  async updateNotificationPreferences(
    @FirebaseUser() firebaseUser: FirebaseUserType,
    @Body() updateDto: UpdateNotificationPreferencesDto,
  ): Promise<UserNotificationPreferencesDto> {
    return await this.userService.updateNotificationPreferences(
      firebaseUser.uid,
      updateDto,
    );
  }

  /**
   * DELETE /user/account - Delete user account (soft delete)
   */
  @Delete('account')
  @HttpCode(HttpStatus.OK)
  async deleteUserAccount(
    @FirebaseUser() firebaseUser: FirebaseUserType,
  ): Promise<{ success: boolean; message: string }> {
    return await this.userService.deleteUserAccount(firebaseUser.uid);
  }
}
