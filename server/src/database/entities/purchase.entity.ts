import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { BaseEntityTimestamps } from './base.entity';
import {
  PurchaseType,
  PurchaseStatus,
  PurchaseProvider,
} from '../enums/subscription.enums';

@Entity('purchases')
@Index('idx_purchase_user_type', ['userId', 'type'])
@Index('idx_purchase_status_created', ['status', 'createdAt'])
@Index('idx_purchase_provider_id', ['providerPaymentId'])
@Index('uq_purchases_provider_payment', ['provider', 'providerPaymentId'], {
  unique: true,
  where: 'provider_payment_id IS NOT NULL',
})
export class Purchase extends BaseEntityTimestamps {
  // Owner relationship
  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Purchase details
  @Column({ type: 'enum', enum: PurchaseType })
  type!: PurchaseType;

  @Column({ type: 'integer', default: 1 })
  quantity!: number;

  @Column({ type: 'enum', enum: PurchaseStatus })
  status!: PurchaseStatus;

  // Pricing (stored in cents to avoid floating point issues)
  @Column({ type: 'integer' })
  amountCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  // Payment provider details
  @Column({
    type: 'enum',
    enum: PurchaseProvider,
    default: PurchaseProvider.STRIPE,
  })
  provider!: PurchaseProvider;

  @Column({ type: 'varchar', length: 100, nullable: true })
  providerPaymentId!: string | null; // pi_... or ch_...

  @Column({ type: 'varchar', length: 100, nullable: true })
  providerCustomerId!: string | null; // cus_...

  // Purchase metadata for your game-specific needs
  @Column({ type: 'jsonb', nullable: true })
  metadata!: {
    // For hint packs: how many hints
    // For restart packs: how many restarts
    // For bundles: what's included
    grantDetails?: Record<string, any>;
    // Reference to daily quiz if purchase was made during specific game
    dailyQuizId?: string;
    // User's timezone at time of purchase (for analytics)
    purchaseTz?: string;
  } | null;

  // Fulfillment tracking
  @Column({ type: 'boolean', default: false })
  fulfilled!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  fulfilledAt!: Date | null;

  // Refund tracking
  @Column({ type: 'timestamptz', nullable: true })
  refundedAt!: Date | null;

  @Column({ type: 'integer', nullable: true })
  refundAmountCents!: number | null;
}
