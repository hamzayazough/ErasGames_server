-- Create user_devices table for FCM token management
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,  -- Firebase user IDs are strings, not UUIDs
    fcm_token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android')),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    app_version VARCHAR(50),
    device_model VARCHAR(100),
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    
    -- Unique constraint: one active device per user per platform
    UNIQUE(user_id, platform)
);

-- Index for quick FCM token lookups
CREATE INDEX idx_user_devices_fcm_token ON user_devices(fcm_token);
CREATE INDEX idx_user_devices_active ON user_devices(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);

COMMENT ON TABLE user_devices IS 'Stores FCM tokens for push notifications to user devices';
COMMENT ON COLUMN user_devices.fcm_token IS 'Firebase Cloud Messaging token for the device';
COMMENT ON COLUMN user_devices.platform IS 'Device platform: ios or android';
COMMENT ON COLUMN user_devices.is_active IS 'Whether the device is active and should receive notifications';
COMMENT ON COLUMN user_devices.last_seen_at IS 'Last time the device was active in the app';