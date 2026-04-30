-- ============================================
-- Fix DisplayOrder Column Issue
-- Run this in your PostgreSQL database NOW
-- ============================================

-- Step 1: Check if column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Permissions' 
        AND column_name = 'DisplayOrder'
    ) THEN
        -- Add the column
        ALTER TABLE "Permissions" ADD COLUMN "DisplayOrder" integer DEFAULT 0 NOT NULL;
        RAISE NOTICE 'DisplayOrder column added successfully';
    ELSE
        RAISE NOTICE 'DisplayOrder column already exists';
    END IF;
END $$;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS "IX_Permissions_DisplayOrder" ON "Permissions" ("DisplayOrder");

-- Step 3: Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Permissions' 
AND column_name = 'DisplayOrder';

-- Step 4: Count existing permissions
SELECT COUNT(*) as "Current Permission Count" FROM "Permissions";

-- Step 5: Show sample permissions
SELECT "Id", "Code", "Name", "Module", "DisplayOrder"
FROM "Permissions"
LIMIT 5;
