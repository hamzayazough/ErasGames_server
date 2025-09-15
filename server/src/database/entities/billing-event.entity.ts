import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntityTimestamps } from './base.entity';
import { Subscription } from './subscription.entity';
import { User } from './user.entity';
import {
  PaymentProvider,
  BillingEventType,
  ProcessingState,
} from '../enums/subscription.enums';

@Entity('billing_events')
@Index('idx_billing_events_provider_event', ['provider', 'providerEventId'], {
  unique: true,
})
@Index('idx_billing_events_processing', ['processingState', 'receivedAt'])
@Index('idx_billing_events_subscription', ['subscriptionId'])
export class BillingEvent extends BaseEntityTimestamps {
  // Event identification
  @Column({ type: 'enum', enum: PaymentProvider })
  provider!: PaymentProvider;

  @Column({ type: 'varchar', length: 200 })
  providerEventId!: string; // Webhook ID, notificationUUID, etc.

  @Column({ type: 'enum', enum: BillingEventType })
  eventType!: BillingEventType;

  // Processing state
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  receivedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt!: Date | null;

  @Column({
    type: 'enum',
    enum: ProcessingState,
    default: ProcessingState.PENDING,
  })
  processingState!: ProcessingState;

  // Raw webhook data for audit/replay
  @Column({ type: 'jsonb' })
  rawPayload!: Record<string, any>;

  // Apple-specific signed data
  @Column({ type: 'text', nullable: true })
  signedTransactionInfo!: string | null; // Apple JWS blob

  @Column({ type: 'text', nullable: true })
  signedRenewalInfo!: string | null; // Apple JWS blob

  // Links (may be null during processing)
  @Column({ type: 'uuid', nullable: true })
  subscriptionId!: string | null;

  @ManyToOne(() => Subscription, { nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription!: Subscription | null;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  // Processing metadata
  @Column({ type: 'jsonb', nullable: true })
  processingNotes!: Record<string, any> | null;

  @Column({ type: 'int', default: 0 })
  retryCount!: number;
}
