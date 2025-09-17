import {
  PurchaseType,
  PurchaseStatus,
  PurchaseProvider,
} from '../enums/subscription.enums';

/**
 * Interface representing a purchase transaction with payment and fulfillment details.
 */
export interface Purchase {
  id: string;
  userId: string;
  type: PurchaseType;
  quantity: number;
  status: PurchaseStatus;
  amountCents: number;
  currency: string;
  provider: PurchaseProvider;
  providerPaymentId: string | null;
  providerCustomerId: string | null;
  metadata: {
    grantDetails?: Record<string, any>;
    dailyQuizId?: string;
    purchaseTz?: string;
  } | null;
  fulfilled: boolean;
  fulfilledAt: Date | null;
  refundedAt: Date | null;
  refundAmountCents: number | null;
  createdAt: Date;
  updatedAt: Date;
}
