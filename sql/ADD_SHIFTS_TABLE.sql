-- =====================================================
-- ADD SHIFTS TABLE AND UPDATE DAILY PRODUCTIONS
-- Run this script in pgAdmin to enable shift management
-- =====================================================

-- Step 1: Create the shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    start_time INTERVAL NOT NULL,
    end_time INTERVAL NOT NULL,
    description VARCHAR(500),
    display_order INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by_id UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_shifts_created_by FOREIGN KEY (created_by_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_shifts_updated_by FOREIGN KEY (updated_by_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for shifts table
CREATE INDEX IF NOT EXISTS ix_shifts_code ON shifts(code);
CREATE INDEX IF NOT EXISTS ix_shifts_name ON shifts(name);
CREATE INDEX IF NOT EXISTS ix_shifts_display_order ON shifts(display_order);
CREATE INDEX IF NOT EXISTS ix_shifts_is_active ON shifts(is_active);
CREATE INDEX IF NOT EXISTS ix_shifts_created_by_id ON shifts(created_by_id);
CREATE INDEX IF NOT EXISTS ix_shifts_updated_by_id ON shifts(updated_by_id);

-- Step 2: Insert default shifts (Morning, Evening, Night)
INSERT INTO shifts (id, name, code, start_time, end_time, description, display_order, is_active, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'Morning Shift', 'MORNING', '06:00:00'::INTERVAL, '14:00:00'::INTERVAL, 'Morning production shift (6:00 AM - 2:00 PM)', 1, TRUE, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'Evening Shift', 'EVENING', '14:00:00'::INTERVAL, '22:00:00'::INTERVAL, 'Evening production shift (2:00 PM - 10:00 PM)', 2, TRUE, NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'Night Shift', 'NIGHT', '22:00:00'::INTERVAL, '06:00:00'::INTERVAL, 'Night production shift (10:00 PM - 6:00 AM)', 3, TRUE, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Step 3: Add shift_id column to daily_productions (temporarily nullable)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_productions' AND column_name = 'shift_id'
    ) THEN
        ALTER TABLE daily_productions ADD COLUMN shift_id UUID;
    END IF;
END $$;

-- Step 4: Migrate existing shift data from enum to shift_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_productions' AND column_name = 'shift'
    ) THEN
        -- Map old enum values to new shift IDs
        UPDATE daily_productions
        SET shift_id = CASE 
            WHEN shift = 'Morning' THEN '11111111-1111-1111-1111-111111111111'::UUID
            WHEN shift = 'Evening' THEN '22222222-2222-2222-2222-222222222222'::UUID
            WHEN shift = 'Night' THEN '33333333-3333-3333-3333-333333333333'::UUID
            ELSE '11111111-1111-1111-1111-111111111111'::UUID  -- Default to Morning
        END
        WHERE shift_id IS NULL;
    END IF;
END $$;

-- Step 5: Make shift_id NOT NULL after data migration
ALTER TABLE daily_productions ALTER COLUMN shift_id SET NOT NULL;

-- Step 6: Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_daily_productions_shifts_shift_id'
    ) THEN
        ALTER TABLE daily_productions 
        ADD CONSTRAINT fk_daily_productions_shifts_shift_id 
        FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- Step 7: Create index on shift_id
CREATE INDEX IF NOT EXISTS ix_daily_productions_shift_id ON daily_productions(shift_id);

-- Step 8: Drop old shift column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_productions' AND column_name = 'shift' AND column_name != 'shift_id'
    ) THEN
        ALTER TABLE daily_productions DROP COLUMN shift;
    END IF;
END $$;

-- Step 9: Add shift management permissions
INSERT INTO permissions (id, name, code, module, description, display_order, is_system_permission, created_at)
VALUES 
    (gen_random_uuid(), 'View Shifts', 'production:shift:view', 'Production', 'View production shifts', 440, TRUE, NOW()),
    (gen_random_uuid(), 'Create Shifts', 'production:shift:create', 'Production', 'Create production shifts', 441, TRUE, NOW()),
    (gen_random_uuid(), 'Update Shifts', 'production:shift:update', 'Production', 'Update production shifts', 442, TRUE, NOW()),
    (gen_random_uuid(), 'Delete Shifts', 'production:shift:delete', 'Production', 'Delete production shifts', 443, TRUE, NOW())
ON CONFLICT (code) DO NOTHING;

-- Step 10: Grant shift permissions to Manager role (assuming role exists)
DO $$
DECLARE
    manager_role_id UUID;
    shift_view_perm_id UUID;
    shift_create_perm_id UUID;
    shift_update_perm_id UUID;
BEGIN
    -- Get Manager role ID
    SELECT id INTO manager_role_id FROM roles WHERE name = 'Manager' LIMIT 1;
    
    -- Get permission IDs
    SELECT id INTO shift_view_perm_id FROM permissions WHERE code = 'production:shift:view' LIMIT 1;
    SELECT id INTO shift_create_perm_id FROM permissions WHERE code = 'production:shift:create' LIMIT 1;
    SELECT id INTO shift_update_perm_id FROM permissions WHERE code = 'production:shift:update' LIMIT 1;
    
    -- Grant permissions if role and permissions exist
    IF manager_role_id IS NOT NULL AND shift_view_perm_id IS NOT NULL THEN
        INSERT INTO role_permissions (id, role_id, permission_id, granted_at)
        VALUES 
            (gen_random_uuid(), manager_role_id, shift_view_perm_id, NOW()),
            (gen_random_uuid(), manager_role_id, shift_create_perm_id, NOW()),
            (gen_random_uuid(), manager_role_id, shift_update_perm_id, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Verification queries
SELECT 'Shifts table created and populated:' as status;
SELECT id, name, code, start_time, end_time, display_order, is_active FROM shifts ORDER BY display_order;

SELECT 'Daily productions updated with shift_id:' as status;
SELECT COUNT(*) as total_productions, COUNT(shift_id) as productions_with_shift FROM daily_productions;

SELECT 'Shift permissions added:' as status;
SELECT code, name, module FROM permissions WHERE code LIKE 'production:shift:%' ORDER BY code;

-- Success message
SELECT '✅ Shifts functionality has been successfully added!' as result;
SELECT '📌 Default shifts created: Morning (6AM-2PM), Evening (2PM-10PM), Night (10PM-6AM)' as info;
SELECT '🔑 Permissions granted to Manager role' as info;
SELECT '✨ You can now manage shifts from Administrator → Shifts menu' as info;
