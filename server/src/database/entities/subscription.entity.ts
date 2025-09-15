import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { BaseEntityTimestamps } from './base.entity';
import {
  SubscriptionPlan,
  DerivedSubscriptionStatus,
  PaymentProvider,
  Environment,
} from '../enums/subscription.enums';
import {
  PriceNonNegativeCheck,
  CurrencyLengthCheck,
  CountryLengthCheck,
} from './validation.decorators';

@Entity('subscriptions')
@Index('idx_sub_user_status', ['userId', 'statusDerived'])
@Index('idx_sub_provider_sub', ['provider', 'providerSubId'])
@Index('idx_sub_environment', ['environment'])
@Index('idx_sub_current_period', ['currentPeriodEnd'])
@Index('uq_sub_active_user_env_sku', ['userId', 'environment', 'productSku'], {
  unique: true,
  where:
    "status_derived IN ('active', 'trialing', 'in_grace_period', 'in_retry')",
})
@PriceNonNegativeCheck
@CurrencyLengthCheck
@CountryLengthCheck
export class Subscription extends BaseEntityTimestamps {
  // Owner relationship
  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Core subscription info
  @Column({ type: 'enum', enum: SubscriptionPlan })
  plan!: SubscriptionPlan;

  @Column({ type: 'enum', enum: DerivedSubscriptionStatus })
  statusDerived!: DerivedSubscriptionStatus;

  @Column({ type: 'varchar', length: 100 })
  productSku!: string; // com.erasgames.premium_monthly

  // Provider identification
  @Column({ type: 'enum', enum: PaymentProvider })
  provider!: PaymentProvider;

  @Column({ type: 'varchar', length: 100 })
  providerSubId!: string; // Main subscription identifier

  @Column({ type: 'enum', enum: Environment })
  environment!: Environment; // 'sandbox' | 'production'

  // Financial info
  @Column({ type: 'varchar', length: 3 })
  currency!: string; // USD, CAD, EUR

  @Column({ type: 'varchar', length: 2 })
  country!: string; // ISO country code

  @Column({ type: 'bigint', nullable: true })
  priceAmountMicros!: number | null; // Price in micros

  // Billing cycle
  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodStart!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodEnd!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  nextRenewalAt!: Date | null;

  // Lifecycle dates
  @Column({ type: 'timestamptz', nullable: true })
  trialEndAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  gracePeriodEnd!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  canceledAt!: Date | null;

  // Provider-specific metadata (JSONB for flexibility)
  @Column({ type: 'jsonb', default: {} })
  providerMetadata!: Record<string, any>;

  // Event ordering and conflict resolution
  @Column({ type: 'int', default: 0 })
  revision!: number;
}
