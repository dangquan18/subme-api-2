-- Update vendor status enum to add 'rejected' status
-- Migration: update_vendor_status_enum.sql
-- Date: 2025-12-18
-- Purpose: Add 'rejected' to vendor status enum

-- Add 'rejected' status while keeping 'active' and 'approved'
ALTER TABLE vendors 
MODIFY COLUMN status ENUM('pending', 'approved', 'active', 'rejected') 
COLLATE utf8mb4_unicode_ci 
DEFAULT 'pending';
