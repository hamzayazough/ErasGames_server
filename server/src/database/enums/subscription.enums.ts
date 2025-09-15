// Subscription-related enums
export enum SubscriptionPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
}

export enum DerivedSubscriptionStatus {
  // Active states
  ACTIVE = 'active', // Currently valid subscription
  TRIALING = 'trialing', // In trial period

  // Pending states
  IN_GRACE_PERIOD = 'in_grace_period', // Apple grace period
  IN_RETRY = 'in_retry', // Google retry period
  ON_HOLD = 'on_hold', // Google account hold
  PAST_DUE = 'past_due', // Stripe past due

  // Terminal states
  EXPIRED = 'expired', // Subscription expired
  CANCELED = 'canceled', // User canceled
  REVOKED = 'revoked', // Apple/Google revoked

  // Processing states
  PENDING_VALIDATION = 'pending_validation', // Awaiting server validation
  VALIDATION_FAILED = 'validation_failed', // Server validation failed
  INCOMPLETE = 'incomplete', // Stripe incomplete payment
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  APPLE = 'apple',
  GOOGLE = 'google',
}

export enum Environment {
  SANDBOX = 'sandbox',
  PRODUCTION = 'production',
}

export enum ProcessingState {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
  IGNORED = 'ignored',
}

export enum PurchaseProvider {
  STRIPE = 'stripe',
  APPLE = 'apple',
  GOOGLE = 'google',
}

export enum BillingEventType {
  // Purchase events
  INITIAL_PURCHASE = 'initial_purchase',
  RENEWAL = 'renewal',
  RESUBSCRIBE = 'resubscribe',

  // Change events
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  PLAN_CHANGE = 'plan_change',

  // Cancellation events
  CANCEL = 'cancel',
  EXPIRE = 'expire',
  REVOKE = 'revoke',

  // Recovery events
  BILLING_RECOVERY = 'billing_recovery',
  GRACE_PERIOD_START = 'grace_period_start',
  GRACE_PERIOD_END = 'grace_period_end',

  // Financial events
  REFUND = 'refund',
  PRICE_INCREASE = 'price_increase',
  PRICE_CONSENT = 'price_consent',
}

export enum PurchaseType {
  HINT = 'hint',
  RESTART = 'restart',
  BUNDLE = 'bundle',
}

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}
