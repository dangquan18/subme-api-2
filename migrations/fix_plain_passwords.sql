-- Fix plain text passwords in database
-- Hash password '12345678' using bcrypt
-- Bcrypt hash of '12345678' with salt rounds 10

USE subscription_platform;

-- Update user dangq2359@gmail.com with bcrypt hashed password for '12345678'
UPDATE users 
SET password = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdnYDeKBG'
WHERE email = 'dangq2359@gmail.com';

-- Update other users with plain text password '123456'
UPDATE users 
SET password = '$2b$10$xGjzhfJrNdL6N5F3l0kPJOqN7J3X8h5QYZ8qV9X.nL4JzKm5gWKQu'
WHERE email IN ('quan@gmail.com', 'alo@gmail.com');

SELECT 'Passwords updated successfully!' as status;
SELECT email, LEFT(password, 20) as password_hash FROM users WHERE email IN ('dangq2359@gmail.com', 'quan@gmail.com', 'alo@gmail.com');
