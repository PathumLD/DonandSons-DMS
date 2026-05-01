-- Add DisplayOrder column to Permissions table
DO $$
BEGIN
    -- Check if column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Permissions' 
        AND column_name = 'DisplayOrder'
    ) THEN
        ALTER TABLE "Permissions" ADD COLUMN "DisplayOrder" integer DEFAULT 0;
        RAISE NOTICE 'DisplayOrder column added successfully';
    ELSE
        RAISE NOTICE 'DisplayOrder column already exists';
    END IF;
    
    -- Create index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'Permissions'
        AND indexname = 'IX_Permissions_DisplayOrder'
    ) THEN
        CREATE INDEX "IX_Permissions_DisplayOrder" ON "Permissions" ("DisplayOrder");
        RAISE NOTICE 'Index created successfully';
    ELSE
        RAISE NOTICE 'Index already exists';
    END IF;
END $$;
