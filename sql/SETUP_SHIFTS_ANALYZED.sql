-- =====================================================
-- SHIFT MANAGEMENT SETUP - ANALYZED FROM CODEBASE
-- Based on ApplicationDbContextModelSnapshot.cs analysis
-- Database: don_sons_dms (PostgreSQL)
-- =====================================================

-- STEP 1: Create shifts table matching BaseEntity structure
-- Table follows snake_case convention like other tables (daily_productions, approval_queue, etc.)
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    start_time INTERVAL NOT NULL,
    end_time INTERVAL NOT NULL,
    description VARCHAR(500),
    display_order INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by_id UUID,
    updated_by_id UUID
);

-- STEP 2: Create indexes (following pattern from ApplicationDbContext.cs)
CREATE UNIQUE INDEX IF NOT EXISTS ix_shifts_code ON shifts(code);
CREATE INDEX IF NOT EXISTS ix_shifts_name ON shifts(name);
CREATE INDEX IF NOT EXISTS ix_shifts_display_order ON shifts(display_order);
CREATE INDEX IF NOT EXISTS ix_shifts_is_active ON shifts(is_active);
CREATE INDEX IF NOT EXISTS ix_shifts_created_by_id ON shifts(created_by_id);
CREATE INDEX IF NOT EXISTS ix_shifts_updated_by_id ON shifts(updated_by_id);

-- STEP 3: Add foreign key constraints to users table
-- Based on the pattern: CreatedBy and UpdatedBy FKs with SET NULL on delete
DO $$ 
BEGIN
    -- Check if users table exists (from ApplicationDbContextModelSnapshot line 4624)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        
        -- Add created_by_id foreign key
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_shifts_created_by_id_users_id'
            AND table_name = 'shifts'
        ) THEN
            ALTER TABLE shifts 
            ADD CONSTRAINT fk_shifts_created_by_id_users_id 
            FOREIGN KEY (created_by_id) 
            REFERENCES users(id) 
            ON DELETE SET NULL;
        END IF;
        
        -- Add updated_by_id foreign key
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_shifts_updated_by_id_users_id'
            AND table_name = 'shifts'
        ) THEN
            ALTER TABLE shifts 
            ADD CONSTRAINT fk_shifts_updated_by_id_users_id 
            FOREIGN KEY (updated_by_id) 
            REFERENCES users(id) 
            ON DELETE SET NULL;
        END IF;
        
        RAISE NOTICE '✓ Foreign keys to users table created successfully';
    ELSE
        RAISE NOTICE '⚠ Users table not found - skipping foreign key creation';
    END IF;
END $$;

-- STEP 4: Insert default shifts
-- Using specific UUIDs for easy data migration
INSERT INTO shifts (id, name, code, start_time, end_time, description, display_order, is_active, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 
     'Morning Shift', 
     'MORNING', 
     '06:00:00'::INTERVAL, 
     '14:00:00'::INTERVAL, 
     'Morning production shift (6:00 AM - 2:00 PM)', 
     1, 
     TRUE, 
     NOW(), 
     NOW()),
    
    ('22222222-2222-2222-2222-222222222222'::UUID, 
     'Evening Shift', 
     'EVENING', 
     '14:00:00'::INTERVAL, 
     '22:00:00'::INTERVAL, 
     'Evening production shift (2:00 PM - 10:00 PM)', 
     2, 
     TRUE, 
     NOW(), 
     NOW()),
    
    ('33333333-3333-3333-3333-333333333333'::UUID, 
     'Night Shift', 
     'NIGHT', 
     '22:00:00'::INTERVAL, 
     '06:00:00'::INTERVAL, 
     'Night production shift (10:00 PM - 6:00 AM)', 
     3, 
     TRUE, 
     NOW(), 
     NOW())
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

DO $$ 
BEGIN
    RAISE NOTICE '✓ Default shifts inserted: Morning, Evening, Night';
END $$;

-- STEP 5: Update daily_productions table
-- Based on ApplicationDbContextModelSnapshot.cs line 521-524
-- Current: shift column is TEXT type
-- Target: shift_id column as UUID with FK to shifts
DO $$ 
BEGIN
    -- Check if daily_productions table exists (from snapshot line 556)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_productions') THEN
        
        RAISE NOTICE '→ Processing daily_productions table...';
        
        -- 5A: Add shift_id column (temporarily nullable)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'daily_productions' 
            AND column_name = 'shift_id'
        ) THEN
            ALTER TABLE daily_productions ADD COLUMN shift_id UUID;
            RAISE NOTICE '  ✓ Added shift_id column';
        END IF;

        -- 5B: Migrate data from old 'shift' TEXT column to new 'shift_id' UUID column
        -- Mapping based on enum values: Morning, Evening, Night
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'daily_productions' 
            AND column_name = 'shift'
            AND data_type = 'text'
        ) THEN
            -- Perform the migration
            UPDATE daily_productions
            SET shift_id = CASE 
                WHEN shift = 'Morning' THEN '11111111-1111-1111-1111-111111111111'::UUID
                WHEN shift = 'Evening' THEN '22222222-2222-2222-2222-222222222222'::UUID
                WHEN shift = 'Night' THEN '33333333-3333-3333-3333-333333333333'::UUID
                ELSE '11111111-1111-1111-1111-111111111111'::UUID  -- Default to Morning for any other values
            END
            WHERE shift_id IS NULL;
            
            RAISE NOTICE '  ✓ Migrated existing shift data (% rows updated)', 
                (SELECT COUNT(*) FROM daily_productions WHERE shift_id IS NOT NULL);
        ELSE
            -- No old shift column, set all to Morning by default
            UPDATE daily_productions
            SET shift_id = '11111111-1111-1111-1111-111111111111'::UUID
            WHERE shift_id IS NULL;
            
            RAISE NOTICE '  ✓ Initialized shift_id for all rows';
        END IF;

        -- 5C: Make shift_id NOT NULL after data migration
        ALTER TABLE daily_productions ALTER COLUMN shift_id SET NOT NULL;
        RAISE NOTICE '  ✓ Made shift_id required (NOT NULL)';

        -- 5D: Add foreign key constraint to shifts table
        -- Following pattern from ApplicationDbContext.cs line 1595-1598
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_daily_productions_shift_id_shifts_id'
            AND table_name = 'daily_productions'
        ) THEN
            ALTER TABLE daily_productions 
            ADD CONSTRAINT fk_daily_productions_shift_id_shifts_id 
            FOREIGN KEY (shift_id) 
            REFERENCES shifts(id) 
            ON DELETE RESTRICT;
            
            RAISE NOTICE '  ✓ Added foreign key to shifts table';
        END IF;

        -- 5E: Create index on shift_id (from ApplicationDbContext.cs line 1609)
        CREATE INDEX IF NOT EXISTS ix_daily_productions_shift_id ON daily_productions(shift_id);
        RAISE NOTICE '  ✓ Created index on shift_id';

        -- 5F: Drop old 'shift' TEXT column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'daily_productions' 
            AND column_name = 'shift'
            AND data_type = 'text'
        ) THEN
            ALTER TABLE daily_productions DROP COLUMN shift;
            RAISE NOTICE '  ✓ Removed old shift TEXT column';
        END IF;

        RAISE NOTICE '✓ daily_productions table updated successfully';
    ELSE
        RAISE NOTICE '⚠ daily_productions table not found - will be created by EF migrations';
    END IF;
END $$;

-- STEP 6: Add shift management permissions
-- Based on permissions table structure (snapshot line 2631)
DO $$
DECLARE
    perm_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'permissions') THEN
        
        RAISE NOTICE '→ Adding shift permissions...';
        
        -- Get next display_order value
        SELECT COALESCE(MAX(display_order), 439) + 1 INTO perm_count FROM permissions;
        
        INSERT INTO permissions (id, name, code, module, description, display_order, is_system_permission, created_at)
        VALUES 
            (gen_random_uuid(), 'View Shifts', 'production:shift:view', 'Production', 'View production shifts', perm_count, TRUE, NOW()),
            (gen_random_uuid(), 'Create Shifts', 'production:shift:create', 'Production', 'Create production shifts', perm_count + 1, TRUE, NOW()),
            (gen_random_uuid(), 'Update Shifts', 'production:shift:update', 'Production', 'Update production shifts', perm_count + 2, TRUE, NOW()),
            (gen_random_uuid(), 'Delete Shifts', 'production:shift:delete', 'Production', 'Delete production shifts', perm_count + 3, TRUE, NOW())
        ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            module = EXCLUDED.module,
            description = EXCLUDED.description;
            
        RAISE NOTICE '✓ Shift permissions added (4 permissions)';
        
    ELSE
        RAISE NOTICE '⚠ permissions table not found - will be created by EF migrations';
    END IF;
END $$;

-- STEP 7: Grant shift permissions to Manager role
-- Based on role_permissions table structure (snapshot line 3636)
DO $$
DECLARE
    manager_role_id UUID;
    shift_perm_ids UUID[];
    perm_id UUID;
    granted_count INTEGER := 0;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'permissions')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_permissions') THEN
        
        RAISE NOTICE '→ Granting permissions to Manager role...';
        
        -- Get Manager role ID
        SELECT id INTO manager_role_id 
        FROM roles 
        WHERE name = 'Manager' AND is_active = TRUE 
        LIMIT 1;
        
        IF manager_role_id IS NOT NULL THEN
            -- Get all shift permission IDs
            SELECT ARRAY_AGG(id) INTO shift_perm_ids
            FROM permissions 
            WHERE code LIKE 'production:shift:%';
            
            -- Grant each permission
            IF shift_perm_ids IS NOT NULL THEN
                FOREACH perm_id IN ARRAY shift_perm_ids
                LOOP
                    INSERT INTO role_permissions (id, role_id, permission_id, granted_at)
                    VALUES (gen_random_uuid(), manager_role_id, perm_id, NOW())
                    ON CONFLICT DO NOTHING;
                    granted_count := granted_count + 1;
                END LOOP;
                
                RAISE NOTICE '✓ Granted % shift permissions to Manager role', granted_count;
            END IF;
        ELSE
            RAISE NOTICE '⚠ Manager role not found - permissions not granted';
        END IF;
        
    ELSE
        RAISE NOTICE '⚠ Role/permission tables not found - skipping permission grants';
    END IF;
END $$;

-- =====================================================
-- VERIFICATION AND SUMMARY
-- =====================================================

-- Show created shifts
SELECT 
    '✓ SHIFTS TABLE' as section,
    COUNT(*) as total_shifts,
    COUNT(*) FILTER (WHERE is_active = TRUE) as active_shifts
FROM shifts;

SELECT 
    display_order,
    code,
    name,
    start_time::TEXT as start_time,
    end_time::TEXT as end_time,
    is_active
FROM shifts 
ORDER BY display_order;

-- Show daily_productions status
DO $$
DECLARE
    dp_count INTEGER;
    dp_with_shift INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_productions') THEN
        SELECT COUNT(*) INTO dp_count FROM daily_productions;
        SELECT COUNT(*) INTO dp_with_shift FROM daily_productions WHERE shift_id IS NOT NULL;
        
        RAISE NOTICE '';
        RAISE NOTICE '✓ DAILY PRODUCTIONS TABLE';
        RAISE NOTICE '  Total productions: %', dp_count;
        RAISE NOTICE '  With shift_id: %', dp_with_shift;
    END IF;
END $$;

-- Show permissions status
DO $$
DECLARE
    perm_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        SELECT COUNT(*) INTO perm_count FROM permissions WHERE code LIKE 'production:shift:%';
        RAISE NOTICE '';
        RAISE NOTICE '✓ PERMISSIONS';
        RAISE NOTICE '  Shift permissions: %', perm_count;
    END IF;
END $$;

-- Final success message
SELECT '' as blank_line;
SELECT '🎉 SHIFT MANAGEMENT SETUP COMPLETE!' as status;
SELECT '📌 3 default shifts created: Morning (6AM-2PM), Evening (2PM-10PM), Night (10PM-6AM)' as info;
SELECT '🔗 daily_productions table updated with shift_id foreign key' as info;
SELECT '🔑 4 permissions added: view, create, update, delete' as info;
SELECT '✨ Navigate to Administrator → Shifts to manage shifts' as next_step;
SELECT '🔄 Refresh your frontend to see the changes' as next_step;
