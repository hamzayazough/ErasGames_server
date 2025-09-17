import {UserRole, UserStatus, AuthProvider} from '../enums/user.enums';

/**
 * Interface representing a user entity with authentication, profile,
 * and preference information.
 */
export interface User {
  id: string;
  email: string | null;
  emailVerified: boolean;
  authProvider: AuthProvider;
  providerUserId: string | null;
  name: string | null;
  handle: string | null;
  country: string | null;
  tz: string;
  lastSeenOffset: number | null;
  lastSeenAt: Date | null;
  notifWindowJSON: {start: string; end: string} | null;
  pushEnabled: boolean;
  leaderboardOptOut: boolean;
  shareCountryOnLB: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  role: UserRole;
  status: UserStatus;
  suspensionReason: string | null;
  tzStableSince: Date | null;
  tzChangeFrozenUntil: Date | null;
  tzChangeCount30d: number;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
