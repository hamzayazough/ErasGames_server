-- 09_billing_events.sql
-- Migration for BillingEvent entity (Audit Trail)
-- Raw webhook/notification storage for all providers
-- NOTE: This file assumes enums from 07_subscriptions.sql are available

-- Create billing events table
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
    user_id VARCHAR(128) REFERENCES users(id),
    
    -- Processing metadata
    processing_notes JSONB,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint on provider event IDs for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_events_provider_event 
ON billing_events(provider, provider_event_id);

-- Processing state index
CREATE INDEX IF NOT EXISTS idx_billing_events_processing 
ON billing_events(processing_state, received_at);

-- Subscription link index
CREATE INDEX IF NOT EXISTS idx_billing_events_subscription 
ON billing_events(subscription_id);

-- Event type analysis
CREATE INDEX IF NOT EXISTS idx_billing_events_type_time 
ON billing_events(event_type, received_at);

-- Comments
COMMENT ON TABLE billing_events IS 
'Audit trail of all webhook/notification events from payment providers';

COMMENT ON COLUMN billing_events.provider_event_id IS 
'Unique event ID from provider for idempotency (Stripe event.id, Apple notificationUUID, etc.)';

COMMENT ON COLUMN billing_events.raw_payload IS 
'Complete webhook payload for audit, debugging, and replay capabilities';

COMMENT ON COLUMN billing_events.signed_transaction_info IS 
'Apple JWS signed transaction data for cryptographic verification';

COMMENT ON COLUMN billing_events.processing_state IS 
'Event processing status: pending, processed, failed, ignored';
