-- Add DisplayOrder column to Permissions table
ALTER TABLE "Permissions" ADD COLUMN IF NOT EXISTS "DisplayOrder" integer DEFAULT 0 NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS "IX_Permissions_DisplayOrder" ON "Permissions" ("DisplayOrder");

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Permissions' 
ORDER BY ordinal_position;
