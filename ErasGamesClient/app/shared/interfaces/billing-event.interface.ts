import {
  PaymentProvider,
  BillingEventType,
  ProcessingState,
} from '../enums/subscription.enums';

/**
 * Interface representing a billing event from payment providers
 * with processing state and audit information.
 */
export interface BillingEvent {
  id: string;
  provider: PaymentProvider;
  providerEventId: string;
  eventType: BillingEventType;
  receivedAt: Date;
  processedAt: Date | null;
  processingState: ProcessingState;
  rawPayload: Record<string, any>;
  signedTransactionInfo: string | null;
  signedRenewalInfo: string | null;
  subscriptionId: string | null;
  userId: string | null;
  processingNotes: Record<string, any> | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
