-- ========================================
-- STEP 1: Add DisplayOrder Column
-- ========================================
DO $$ 
BEGIN
    -- Add DisplayOrder column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'permissions' 
        AND column_name = 'DisplayOrder'
    ) THEN
        ALTER TABLE permissions ADD COLUMN "DisplayOrder" integer DEFAULT 0;
        RAISE NOTICE '✓ DisplayOrder column added successfully';
    ELSE
        RAISE NOTICE '✓ DisplayOrder column already exists';
    END IF;
END $$;

-- ========================================
-- STEP 2: Create Index on DisplayOrder
-- ========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'permissions'
        AND indexname = 'IX_Permissions_DisplayOrder'
    ) THEN
        CREATE INDEX "IX_Permissions_DisplayOrder" ON permissions ("DisplayOrder");
        RAISE NOTICE '✓ Index created successfully';
    ELSE
        RAISE NOTICE '✓ Index already exists';
    END IF;
END $$;

-- ========================================
-- STEP 3: Mark Migration as Applied (so EF Core doesn't try to run it again)
-- ========================================
-- First, check if the migration is already in the history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM "__EFMigrationsHistory" 
        WHERE "MigrationId" = '20260429100131_AddDisplayOrderToPermission'
    ) THEN
        INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
        VALUES ('20260429100131_AddDisplayOrderToPermission', '10.0.6');
        RAISE NOTICE '✓ Migration marked as applied';
    ELSE
        RAISE NOTICE '✓ Migration already in history';
    END IF;
END $$;

-- ========================================
-- VERIFICATION
-- ========================================
-- Verify the column exists and has the correct type
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'permissions' 
AND column_name = 'DisplayOrder';

-- Show success message
SELECT '✓ DisplayOrder column is ready! You can now start your backend.' AS status;
