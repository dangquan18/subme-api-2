-- Run All Migrations
-- Execute this file to run all migrations in order

USE subscription_platform;

-- 1. Add columns to plans table
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 COMMENT 'Is plan active';

ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS subscriber_count INT DEFAULT 0 COMMENT 'Number of subscribers';

ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Average rating from reviews';

UPDATE plans SET is_active = 1 WHERE is_active IS NULL;
UPDATE plans SET subscriber_count = 0 WHERE subscriber_count IS NULL;
UPDATE plans SET average_rating = 0.00 WHERE average_rating IS NULL;

-- 2. Add columns to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS auto_renew TINYINT(1) DEFAULT 1 COMMENT 'Auto renew subscription';

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS paused_at DATETIME NULL COMMENT 'When subscription was paused';

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancelled_at DATETIME NULL COMMENT 'When subscription was cancelled';

UPDATE subscriptions SET auto_renew = 1 WHERE auto_renew IS NULL;

-- 3. Add type column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type ENUM('delivery', 'payment', 'promotion', 'system', 'subscription') 
DEFAULT 'system' 
COMMENT 'Notification type';

UPDATE notifications SET type = 'system' WHERE type IS NULL;

-- 4. Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_plan (user_id, plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_plan_review (user_id, plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'All migrations completed successfully!' as status;
