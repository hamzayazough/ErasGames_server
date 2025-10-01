import {
  IsString,
  IsOptional,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';
import { UserRole, UserStatus } from '../database/enums/user.enums';

export class UserProfileDto {
  id!: string;
  email!: string | null;
  name!: string | null;
  handle!: string | null;
  country!: string | null;
  tz!: string;
  pushEnabled!: boolean;
  shareCountryOnLB!: boolean;
  analyticsConsent!: boolean;
  marketingConsent!: boolean;
  role!: UserRole;
  status!: UserStatus;
  createdAt!: Date;
  updatedAt!: Date;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 60)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Handle can only contain letters, numbers, underscores and hyphens',
  })
  handle?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  tz?: string;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  shareCountryOnLB?: boolean;

  @IsOptional()
  @IsBoolean()
  analyticsConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}

export class UpdateUserNameDto {
  @IsString()
  @Length(1, 120)
  name!: string;
}

export class CheckHandleAvailabilityDto {
  @IsString()
  @Length(3, 60)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Handle can only contain letters, numbers, underscores and hyphens',
  })
  handle!: string;
}

export class HandleAvailabilityResponseDto {
  available!: boolean;
  handle!: string;
  suggestions?: string[];
}

export class UserNotificationPreferencesDto {
  pushEnabled!: boolean;
  notifWindowJSON!: { start: string; end: string } | null;
}

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  notifWindowJSON?: { start: string; end: string } | null;
}
