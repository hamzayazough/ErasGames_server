
-- 01_init_tables.sql: Base entity and users table

-- Enable citext extension for case-insensitive text (required for email)
CREATE EXTENSION IF NOT EXISTS citext;

-- BaseEntityTimestamps columns are included in each table as needed

CREATE TABLE IF NOT EXISTS users (
	id VARCHAR(128) PRIMARY KEY, -- Firebase UID as primary key
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	-- Identity / auth
	email CITEXT,
	email_verified BOOLEAN NOT NULL DEFAULT FALSE,
	auth_provider VARCHAR(16) NOT NULL DEFAULT 'firebase',
	provider_user_id VARCHAR(190), -- This will be the same as id for Firebase users

	-- Profile
	name VARCHAR(120),
	handle VARCHAR(60),
	country VARCHAR(2),
	tz VARCHAR(64) NOT NULL DEFAULT 'America/Toronto',
	last_seen_offset SMALLINT,
	last_seen_at TIMESTAMPTZ,

	-- Notifications
	notif_window_json JSONB,
	push_enabled BOOLEAN NOT NULL DEFAULT TRUE,

	-- Privacy & consent
	leaderboard_opt_out BOOLEAN NOT NULL DEFAULT FALSE,
	share_country_on_lb BOOLEAN NOT NULL DEFAULT TRUE,
	analytics_consent BOOLEAN NOT NULL DEFAULT TRUE,
	marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,

	-- Moderation / account state
	role VARCHAR(16) NOT NULL DEFAULT 'user',
	status VARCHAR(16) NOT NULL DEFAULT 'active',
	suspension_reason TEXT,

	-- TZ fairness / anti-abuse
	tz_stable_since TIMESTAMPTZ,
	tz_change_frozen_until TIMESTAMPTZ,
	tz_change_count_30d INT NOT NULL DEFAULT 0,

	-- Commerce
	stripe_customer_id VARCHAR(100),

	-- Unique constraints and indexes
	CONSTRAINT uniq_users_provider_identity UNIQUE (auth_provider, provider_user_id),
	CONSTRAINT idx_users_email_unique UNIQUE (email),
	CONSTRAINT idx_users_handle_unique UNIQUE (handle)
);

CREATE INDEX IF NOT EXISTS idx_users_country_tz ON users (country, tz);
CREATE INDEX IF NOT EXISTS idx_users_lastseen ON users (last_seen_at);
