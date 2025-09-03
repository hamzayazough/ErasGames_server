-- 07_subscriptions.sql
-- Production-Ready Multi-Provider Subscription System
-- Eras Quiz: Stripe + Apple App Store + Google Play billing

-- ===============================================
-- ENUMS
-- ===============================================

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM ('basic', 'premium');

-- Derived subscription status (computed from provider events)
CREATE TYPE derived_subscription_status AS ENUM (
  -- Active states
  'active', 'trialing',
  -- Pending states  
  'in_grace_period', 'in_retry', 'on_hold', 'past_due',
  -- Terminal states
  'expired', 'canceled', 'revoked',
  -- Processing states
  'pending_validation', 'validation_failed', 'incomplete'
);

-- Payment providers
CREATE TYPE payment_provider AS ENUM ('stripe', 'apple', 'google');

-- Environment type (prevents typos)
CREATE TYPE environment_t AS ENUM ('sandbox', 'production');

-- Processing state enum for billing events
CREATE TYPE processing_state_t AS ENUM ('pending', 'processed', 'failed', 'ignored');

-- Billing event types for audit trail
CREATE TYPE billing_event_type AS ENUM (
  -- Purchase events
  'initial_purchase', 'renewal', 'resubscribe',
  -- Change events
  'upgrade', 'downgrade', 'plan_change',
  -- Cancellation events
  'cancel', 'expire', 'revoke',
  -- Recovery events
  'billing_recovery', 'grace_period_start', 'grace_period_end',
  -- Financial events
  'refund', 'price_increase', 'price_consent'
);

-- ===============================================
-- CORE SUBSCRIPTION TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Core subscription info
    plan subscription_plan NOT NULL,
    status_derived derived_subscription_status NOT NULL,
    product_sku VARCHAR(100) NOT NULL,          -- com.erasgames.premium_monthly
    
    -- Provider identification
    provider payment_provider NOT NULL,
    provider_sub_id VARCHAR(100) NOT NULL,      -- Main subscription ID
    environment environment_t NOT NULL,         -- 'sandbox' | 'production'
    
    -- Financial info
    currency VARCHAR(3) NOT NULL,               -- ISO currency code
    country VARCHAR(2) NOT NULL,                -- ISO country code  
    price_amount_micros BIGINT,                 -- Price in micros
    
    -- Billing cycle
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    next_renewal_at TIMESTAMPTZ,
    
    -- Lifecycle dates
    trial_end_at TIMESTAMPTZ,
    grace_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    -- Provider-specific metadata (JSONB for flexibility)
    provider_metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Event ordering and conflict resolution
    revision INTEGER NOT NULL DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================================
-- BILLING EVENTS TABLE (Audit Trail)
-- ===============================================

CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event identification
    provider payment_provider NOT NULL,
    provider_event_id VARCHAR(200) NOT NULL,    -- Webhook ID, notificationUUID, etc.
    event_type billing_event_type NOT NULL,
    
    -- Processing state
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processing_state processing_state_t NOT NULL DEFAULT 'pending',
    
    -- Raw webhook data for audit/replay
    raw_payload JSONB NOT NULL,
    
    -- Apple-specific signed data
    signed_transaction_info TEXT,               -- Apple JWS blob
    signed_renewal_info TEXT,                   -- Apple JWS blob
    
    -- Links (may be null during processing)
    subscription_id UUID REFERENCES subscriptions(id),
    user_id UUID REFERENCES users(id),
    
    -- Processing metadata
    processing_notes JSONB,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================================
-- PROVIDER TRANSACTIONS TABLE (Financial Trail)
-- ===============================================

CREATE TABLE IF NOT EXISTS provider_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    
    -- Transaction identification
    provider payment_provider NOT NULL,
    provider_transaction_id VARCHAR(200) NOT NULL,
    original_transaction_id VARCHAR(200),       -- For grouping/plan changes
    
    -- Transaction details
    transaction_time TIMESTAMPTZ NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,      -- 'purchase', 'renewal', etc.
    
    -- Financial details
    gross_amount_micros BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    tax_amount_micros BIGINT,
    
    -- Offer/promotion tracking
    offer_type VARCHAR(100),                    -- Apple: offer_type, Google: basePlanId
    offer_identifier VARCHAR(100),              -- Apple: offer_identifier, Google: offerId
    
    -- Raw provider data for reconciliation
    raw_provider_data JSONB NOT NULL,
    
    -- Link to billing event that created this transaction
    billing_event_id UUID REFERENCES billing_events(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================================
-- FOREIGN KEYS
-- ===============================================

-- Subscription to user relationship
ALTER TABLE subscriptions 
ADD CONSTRAINT fk_subscriptions_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ===============================================
-- CRITICAL INDEXES
-- ===============================================

-- Subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
ON subscriptions(user_id, status_derived);

CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub 
ON subscriptions(provider, provider_sub_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_environment 
ON subscriptions(environment);

CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period 
ON subscriptions(current_period_end);

-- Billing event processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_events_provider_event 
ON billing_events(provider, provider_event_id);

CREATE INDEX IF NOT EXISTS idx_billing_events_processing 
ON billing_events(processing_state, received_at);

CREATE INDEX IF NOT EXISTS idx_billing_events_subscription 
ON billing_events(subscription_id);

-- Transaction analysis
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_time 
ON provider_transactions(subscription_id, transaction_time);

CREATE INDEX IF NOT EXISTS idx_transactions_provider_type 
ON provider_transactions(provider, transaction_type);

CREATE INDEX IF NOT EXISTS idx_transactions_provider_tx_id 
ON provider_transactions(provider, provider_transaction_id);

-- ===============================================
-- BUSINESS RULES
-- ===============================================

-- Provider transactions must be globally idempotent per provider
ALTER TABLE provider_transactions
ADD CONSTRAINT uq_provider_transactions UNIQUE (provider, provider_transaction_id);

-- Non-negative amounts (catch data drifts and provider quirks)
ALTER TABLE provider_transactions
ADD CONSTRAINT ck_tx_amount_nonneg CHECK (gross_amount_micros >= 0),
ADD CONSTRAINT ck_tx_tax_nonneg CHECK (tax_amount_micros IS NULL OR tax_amount_micros >= 0);

ALTER TABLE subscriptions
ADD CONSTRAINT ck_price_nonneg CHECK (price_amount_micros IS NULL OR price_amount_micros >= 0);

-- Tighten country/currency shapes (cheap validation)
ALTER TABLE subscriptions
ADD CONSTRAINT ck_currency_len CHECK (char_length(currency) = 3),
ADD CONSTRAINT ck_country_len  CHECK (char_length(country)  = 2);

-- Enforce one active subscription per user per product and environment
CREATE UNIQUE INDEX IF NOT EXISTS uq_sub_active_user_env_sku
ON subscriptions(user_id, environment, product_sku)
WHERE status_derived IN ('active', 'trialing', 'in_grace_period', 'in_retry');

-- ===============================================
-- COLUMN COMMENTS
-- ===============================================

COMMENT ON COLUMN subscriptions.status_derived IS 
'Derived status computed from provider events - never set directly by client';

COMMENT ON COLUMN subscriptions.product_sku IS 
'Platform-specific product identifier (e.g., com.erasgames.premium_monthly)';

COMMENT ON COLUMN subscriptions.provider_sub_id IS 
'Main subscription identifier per provider (sub_xxx for Stripe, originalTransactionId for Apple, etc.)';

COMMENT ON COLUMN subscriptions.provider_metadata IS 
'Provider-specific fields like Apple autoRenewStatus, Google acknowledgementState, Stripe customerId';

COMMENT ON COLUMN subscriptions.revision IS 
'Event ordering counter to prevent old events from overwriting newer state';

COMMENT ON COLUMN billing_events.provider_event_id IS 
'Unique event ID from provider for idempotency (Stripe event.id, Apple notificationUUID, etc.)';

COMMENT ON COLUMN billing_events.signed_transaction_info IS 
'Apple JWS signed transaction data for verification';

COMMENT ON COLUMN provider_transactions.gross_amount_micros IS 
'Transaction amount in micros for precision (divide by 1,000,000 for actual amount)';

-- ===============================================
-- UPDATE TRIGGERS
-- ===============================================

-- Subscription updated_at trigger
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Auto-stamp processed_at when state becomes processed/ignored/failed
CREATE OR REPLACE FUNCTION touch_billing_events_processed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.processing_state IN ('processed','ignored','failed') AND NEW.processed_at IS NULL THEN
    NEW.processed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_touch_billing_events_processed_at
BEFORE UPDATE ON billing_events
FOR EACH ROW EXECUTE FUNCTION touch_billing_events_processed_at();

-- ===============================================
-- EXAMPLE USAGE PATTERNS
-- ===============================================

-- 1. Get active subscription for entitlement calculation:
--    SELECT * FROM subscriptions 
--    WHERE user_id = $1 
--    AND status_derived IN ('active', 'trialing', 'in_grace_period')
--    AND environment = 'production'
--    ORDER BY current_period_end DESC LIMIT 1;

-- 2. Process Apple webhook (idempotent):
--    INSERT INTO billing_events (provider, provider_event_id, event_type, raw_payload, signed_transaction_info)
--    VALUES ('apple', $1, $2, $3, $4)
--    ON CONFLICT (provider, provider_event_id) DO NOTHING;

-- 3. Find subscription drift (resync check):
--    SELECT s.id, s.status_derived, s.updated_at
--    FROM subscriptions s
--    WHERE s.status_derived IN ('active', 'in_grace_period', 'in_retry')
--    AND s.updated_at < NOW() - INTERVAL '2 hours'
--    AND s.environment = 'production';

-- 4. Revenue analysis by provider:
--    SELECT provider, currency, SUM(gross_amount_micros) / 1000000.0 as total_revenue
--    FROM provider_transactions 
--    WHERE transaction_type IN ('purchase', 'renewal')
--    AND transaction_time >= DATE_TRUNC('month', NOW())
--    GROUP BY provider, currency;
