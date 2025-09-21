import {
  Column,
  Entity,
  Index,
  OneToMany,
  Unique,
  PrimaryColumn,
} from 'typeorm';

import { UserRole, UserStatus, AuthProvider } from '../enums/user.enums';
import { BaseEntityTimestamps } from './base.entity';

// Import related entities for relationships
import { Subscription } from './subscription.entity';
import { Purchase } from './purchase.entity';
import { DailyEntitlements } from './daily-entitlements.entity';
import { Attempt } from './attempt.entity';
import { PracticeAttempt } from './practice-attempt.entity';

@Entity('users')
@Unique('uniq_users_provider_identity', ['authProvider', 'providerUserId'])
@Index('idx_users_email_unique', ['email'], { unique: true })
@Index('idx_users_handle_unique', ['handle'], { unique: true })
@Index('idx_users_country_tz', ['country', 'tz'])
@Index('idx_users_lastseen', ['lastSeenAt'])
export class User extends BaseEntityTimestamps {
  @PrimaryColumn({ type: 'varchar', length: 128 })
  declare id: string; // Firebase UID as primary key
  @Column({ type: 'citext', nullable: true })
  email!: string | null;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.FIREBASE })
  authProvider!: AuthProvider;

  @Column({ type: 'varchar', length: 190, nullable: true })
  providerUserId!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  handle!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', length: 64, default: 'America/Toronto' })
  tz!: string;

  @Column({ type: 'smallint', nullable: true })
  lastSeenOffset!: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  notifWindowJSON!: { start: string; end: string } | null;

  @Column({ type: 'boolean', default: true })
  pushEnabled!: boolean;

  @Column({ type: 'boolean', default: false })
  leaderboardOptOut!: boolean;

  @Column({ type: 'boolean', default: true })
  shareCountryOnLB!: boolean;

  @Column({ type: 'boolean', default: true })
  analyticsConsent!: boolean;

  @Column({ type: 'boolean', default: false })
  marketingConsent!: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ type: 'text', nullable: true })
  suspensionReason!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  tzStableSince!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  tzChangeFrozenUntil!: Date | null;

  @Column({ type: 'int', default: 0 })
  tzChangeCount30d!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stripeCustomerId!: string | null;

  // Relations
  @OneToMany(() => Subscription, (s) => s.user)
  subscriptions!: Subscription[];

  @OneToMany(() => Purchase, (p) => p.user)
  purchases!: Purchase[];

  @OneToMany(() => DailyEntitlements, (e) => e.user)
  entitlements!: DailyEntitlements[];

  @OneToMany(() => Attempt, (a) => a.user)
  attempts!: Attempt[];

  @OneToMany(() => PracticeAttempt, (a) => a.user)
  practiceAttempts!: PracticeAttempt[];

  // Helper method to get active subscription
  getActiveSubscription(): Subscription | null {
    return (
      this.subscriptions?.find(
        (sub) =>
          ['active', 'trialing', 'in_grace_period'].includes(
            sub.statusDerived,
          ) &&
          (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date()),
      ) || null
    );
  }
}
