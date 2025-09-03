-- 10_provider_transactions.sql
-- Migration for ProviderTransaction entity (Financial Trail)
-- Additional indexes and constraints for provider_transactions table
-- NOTE: Table is created in 07_subscriptions.sql - this file adds supplementary indexes

-- This file assumes provider_transactions table exists from 07_subscriptions.sql

-- Provider transactions must be globally idempotent per provider
ALTER TABLE provider_transactions
ADD CONSTRAINT uq_provider_transactions UNIQUE (provider, provider_transaction_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_time 
ON provider_transactions(subscription_id, transaction_time);

CREATE INDEX IF NOT EXISTS idx_transactions_provider_type 
ON provider_transactions(provider, transaction_type);

CREATE INDEX IF NOT EXISTS idx_transactions_provider_tx_id 
ON provider_transactions(provider, provider_transaction_id);

-- Financial analysis indexes
CREATE INDEX IF NOT EXISTS idx_transactions_currency_time 
ON provider_transactions(currency, transaction_time);

CREATE INDEX IF NOT EXISTS idx_transactions_amount_time 
ON provider_transactions(gross_amount_micros, transaction_time);

-- Offer analysis
CREATE INDEX IF NOT EXISTS idx_transactions_offers 
ON provider_transactions(provider, offer_type, offer_identifier);

-- Comments
COMMENT ON TABLE provider_transactions IS 
'Financial transaction history for revenue tracking, reconciliation, and analytics';

COMMENT ON COLUMN provider_transactions.gross_amount_micros IS 
'Transaction amount in micros for precision (divide by 1,000,000 for actual amount)';

COMMENT ON COLUMN provider_transactions.transaction_type IS 
'Type of financial transaction: purchase, renewal, cancel, refund, upgrade, downgrade';

COMMENT ON COLUMN provider_transactions.raw_provider_data IS 
'Complete provider transaction data for reconciliation and debugging';

COMMENT ON COLUMN provider_transactions.original_transaction_id IS 
'For Apple: groups subscription renewals. For Google: links plan changes.';
