-- Step 1: Add user_id column to vendors table
ALTER TABLE vendors 
ADD COLUMN user_id INT NULL;

-- Step 2: Update existing vendor records to link with users by email
UPDATE vendors v
INNER JOIN users u ON v.email = u.email
SET v.user_id = u.id
WHERE u.role = 'vendor';

-- Step 3: Add foreign key constraint
ALTER TABLE vendors
ADD CONSTRAINT fk_vendors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 4: Create index for faster lookups
CREATE INDEX idx_vendors_user_id ON vendors(user_id);
