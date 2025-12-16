-- Migration: Add missing columns to plans table
-- Run this SQL in your MySQL database

USE subscription_platform;

-- Check if is_active column exists, if not add it
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 COMMENT 'Is plan active';

-- Check if subscriber_count column exists, if not add it
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS subscriber_count INT DEFAULT 0 COMMENT 'Number of subscribers';

-- Check if average_rating column exists, if not add it
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Average rating from reviews';

-- Update existing plans to set is_active = 1 if NULL
UPDATE plans SET is_active = 1 WHERE is_active IS NULL;

-- Update existing plans to set subscriber_count = 0 if NULL
UPDATE plans SET subscriber_count = 0 WHERE subscriber_count IS NULL;

-- Update existing plans to set average_rating = 0.00 if NULL
UPDATE plans SET average_rating = 0.00 WHERE average_rating IS NULL;

SELECT 'Migration completed successfully!' as status;
