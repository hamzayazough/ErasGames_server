import {
  SubscriptionPlan,
  DerivedSubscriptionStatus,
  PaymentProvider,
  Environment,
} from '../enums/subscription.enums';

/**
 * Interface representing a user subscription with billing and lifecycle information.
 */
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  statusDerived: DerivedSubscriptionStatus;
  productSku: string;
  provider: PaymentProvider;
  providerSubId: string;
  environment: Environment;
  currency: string;
  country: string;
  priceAmountMicros: number | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  nextRenewalAt: Date | null;
  trialEndAt: Date | null;
  gracePeriodEnd: Date | null;
  canceledAt: Date | null;
  providerMetadata: Record<string, any>;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}
