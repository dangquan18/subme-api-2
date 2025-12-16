-- Migration: Add type column to notifications table
-- Run this SQL in your MySQL database

USE subscription_platform;

-- Check if type column exists, if not add it
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type ENUM('delivery', 'payment', 'promotion', 'system', 'subscription') 
DEFAULT 'system' 
COMMENT 'Notification type';

-- Update existing notifications to set type = 'system' if NULL
UPDATE notifications SET type = 'system' WHERE type IS NULL;

SELECT 'Migration completed successfully!' as status;
