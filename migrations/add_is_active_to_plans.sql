-- Migration: Add is_active column to plans table
-- Date: 2025-12-15

USE subscription_platform;

-- Add is_active column to plans table
ALTER TABLE plans 
ADD COLUMN is_active TINYINT(1) DEFAULT 1 COMMENT 'Plan is active or inactive' 
AFTER duration_value;

-- Set all existing plans to active
UPDATE plans SET is_active = 1 WHERE is_active IS NULL;

SELECT 'Migration completed: is_active column added to plans table' as status;
