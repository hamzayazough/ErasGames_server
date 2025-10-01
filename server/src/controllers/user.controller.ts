import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
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
import { FirebaseService } from '../services/firebase.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private firebaseService: FirebaseService,
  ) {}

  /**
   * Helper method to optionally verify Firebase token
   */
  private async getOptionalFirebaseUser(
    request: Request,
  ): Promise<string | undefined> {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return undefined;
      }

      const token = authHeader.substring(7);
      if (!token) {
        return undefined;
      }

      const decodedToken = await this.firebaseService.verifyIdToken(token);
      return decodedToken.uid;
    } catch {
      // If token verification fails, treat as anonymous
      return undefined;
    }
  }

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
    @Req() request: Request,
  ): Promise<HandleAvailabilityResponseDto> {
    const currentUserId = await this.getOptionalFirebaseUser(request);
    return await this.userService.checkHandleAvailability(
      checkHandleDto,
      currentUserId,
    );
  }

  /**
   * GET /user/check-handle-availability - Alternative endpoint using query parameter
   */
  @Get('check-handle-availability')
  @HttpCode(HttpStatus.OK)
  async checkHandleAvailabilityQuery(
    @Query('handle') handle: string,
    @Req() request: Request,
  ): Promise<HandleAvailabilityResponseDto> {
    const checkHandleDto: CheckHandleAvailabilityDto = { handle };
    const currentUserId = await this.getOptionalFirebaseUser(request);
    return await this.userService.checkHandleAvailability(
      checkHandleDto,
      currentUserId,
    );
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
}
