-- Migration: Add missing columns to subscriptions table
-- Run this SQL in your MySQL database

USE subscription_platform;

-- Check if auto_renew column exists, if not add it
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS auto_renew TINYINT(1) DEFAULT 1 COMMENT 'Auto renew subscription';

-- Check if paused_at column exists, if not add it
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS paused_at DATETIME NULL COMMENT 'When subscription was paused';

-- Check if cancelled_at column exists, if not add it
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancelled_at DATETIME NULL COMMENT 'When subscription was cancelled';

-- Update existing subscriptions to set auto_renew = 1 if NULL
UPDATE subscriptions SET auto_renew = 1 WHERE auto_renew IS NULL;

SELECT 'Migration completed successfully!' as status;
