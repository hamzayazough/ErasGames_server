import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntityTimestamps } from './base.entity';
import { Subscription } from './subscription.entity';
import { BillingEvent } from './billing-event.entity';
import { PaymentProvider } from '../enums/subscription.enums';
import {
  TransactionAmountNonNegativeCheck,
  TaxAmountNonNegativeCheck,
} from './validation.decorators';

@Entity('provider_transactions')
@Index('idx_transactions_subscription_time', [
  'subscriptionId',
  'transactionTime',
])
@Index('idx_transactions_provider_type', ['provider', 'transactionType'])
@Index('idx_transactions_provider_tx_id', ['provider', 'providerTransactionId'])
@Index('uq_provider_transactions', ['provider', 'providerTransactionId'], {
  unique: true,
})
@TransactionAmountNonNegativeCheck
@TaxAmountNonNegativeCheck
export class ProviderTransaction extends BaseEntityTimestamps {
  @Column({ type: 'uuid' })
  subscriptionId!: string;

  @ManyToOne(() => Subscription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscriptionId' })
  subscription!: Subscription;

  // Transaction identification
  @Column({ type: 'enum', enum: PaymentProvider })
  provider!: PaymentProvider;

  @Column({ type: 'varchar', length: 200 })
  providerTransactionId!: string; // Stripe: invoice_id, Apple: transactionId, Google: purchaseToken

  @Column({ type: 'varchar', length: 200, nullable: true })
  originalTransactionId!: string | null; // For grouping (Apple) or plan changes

  // Transaction details
  @Column({ type: 'timestamptz' })
  transactionTime!: Date;

  @Column({ type: 'varchar', length: 50 })
  transactionType!:
    | 'purchase'
    | 'renewal'
    | 'cancel'
    | 'refund'
    | 'upgrade'
    | 'downgrade';

  // Financial details
  @Column({ type: 'bigint' })
  grossAmountMicros!: number;

  @Column({ type: 'varchar', length: 3 })
  currency!: string;

  @Column({ type: 'bigint', nullable: true })
  taxAmountMicros!: number | null;

  // Offer/promotion tracking
  @Column({ type: 'varchar', length: 100, nullable: true })
  offerType!: string | null; // Apple: offer_type, Google: basePlanId

  @Column({ type: 'varchar', length: 100, nullable: true })
  offerIdentifier!: string | null; // Apple: offer_identifier, Google: offerId

  // Raw provider data for reconciliation
  @Column({ type: 'jsonb' })
  rawProviderData!: Record<string, any>;

  // Link to billing event that created this transaction
  @Column({ type: 'uuid', nullable: true })
  billingEventId!: string | null;

  @ManyToOne(() => BillingEvent, { nullable: true })
  @JoinColumn({ name: 'billingEventId' })
  billingEvent!: BillingEvent | null;
}
