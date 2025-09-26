-- 08_purchases.sql
-- Migration for Purchase entity
-- Eras Quiz: One-time purchases (hints, restarts, bundles) with Stripe integration

-- Create purchase type enum
CREATE TYPE purchase_type AS ENUM ('hint', 'restart', 'bundle');

-- Create purchase status enum
CREATE TYPE purchase_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create purchase provider enum
CREATE TYPE purchase_provider AS ENUM ('stripe', 'apple', 'google');

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(128) NOT NULL,
    type purchase_type NOT NULL,
    quantity INTEGER DEFAULT 1,
    status purchase_status NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    provider purchase_provider DEFAULT 'stripe',
    provider_payment_id VARCHAR(100),
    provider_customer_id VARCHAR(100),
    metadata JSONB,
    fulfilled BOOLEAN DEFAULT FALSE,
    fulfilled_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount_cents INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key to users table
ALTER TABLE purchases 
ADD CONSTRAINT fk_purchases_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_purchase_user_type 
ON purchases(user_id, type);

CREATE INDEX IF NOT EXISTS idx_purchase_status_created 
ON purchases(status, created_at);

CREATE INDEX IF NOT EXISTS idx_purchase_provider_id 
ON purchases(provider_payment_id);

-- Index for unfulfilled purchases (for background jobs)
CREATE INDEX IF NOT EXISTS idx_purchase_unfulfilled 
ON purchases(fulfilled, status, created_at)
WHERE fulfilled = FALSE AND status = 'completed';

-- Idempotency constraint on provider payment ID
CREATE UNIQUE INDEX IF NOT EXISTS uq_purchases_provider_payment 
ON purchases(provider, provider_payment_id)
WHERE provider_payment_id IS NOT NULL;

-- Comments for key fields
COMMENT ON COLUMN purchases.amount_cents IS 
'Purchase amount in cents to avoid floating point precision issues';

COMMENT ON COLUMN purchases.metadata IS 
'Purchase-specific metadata including grant details, daily quiz context, and user timezone';

COMMENT ON COLUMN purchases.fulfilled IS 
'Whether the purchase has been processed and items granted to user entitlements';

COMMENT ON COLUMN purchases.quantity IS 
'Number of items purchased (e.g., 5 hints, 3 restarts)';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_purchases_updated_at
    BEFORE UPDATE ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_purchases_updated_at();

-- Example usage patterns:
-- 1. Get unfulfilled completed purchases for processing:
--    SELECT * FROM purchases 
--    WHERE fulfilled = FALSE AND status = 'completed'
--    ORDER BY created_at ASC;
--
-- 2. Mark purchase as fulfilled:
--    UPDATE purchases 
--    SET fulfilled = TRUE, fulfilled_at = NOW(), updated_at = NOW()
--    WHERE id = $1 AND fulfilled = FALSE;
--
-- 3. Get user's purchase history:
--    SELECT * FROM purchases 
--    WHERE user_id = $1 AND status IN ('completed', 'refunded')
--    ORDER BY created_at DESC;
--
-- 4. Handle Stripe webhook payment completion:
--    UPDATE purchases 
--    SET status = 'completed', updated_at = NOW()
--    WHERE provider_payment_id = $1 AND status = 'pending';
