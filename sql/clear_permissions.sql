-- =============================================================================
-- CLEAR PERMISSIONS SCRIPT
-- =============================================================================
-- Purpose: Clear all existing permissions to allow fresh seeding with correct codes
-- WARNING: This will remove all role-permission assignments!
-- Make sure to backup your database before running this script
-- =============================================================================

-- =============================================================================
-- CLEAR PERMISSIONS SCRIPT
-- =============================================================================
-- Purpose: Clear all existing permissions to allow fresh seeding with correct codes
-- WARNING: This will remove all role-permission assignments!
-- =============================================================================

DO $$
DECLARE
    permission_count INTEGER;
    role_permission_count INTEGER;
BEGIN
    -- Step 1: Delete all role-permission assignments
    DELETE FROM role_permissions;
    RAISE NOTICE 'Deleted all role-permission assignments';

    -- Step 2: Delete all permissions
    DELETE FROM permissions;
    RAISE NOTICE 'Deleted all permissions';

    -- Step 3: Verify deletion
    SELECT COUNT(*) INTO permission_count FROM permissions;
    SELECT COUNT(*) INTO role_permission_count FROM role_permissions;
    
    RAISE NOTICE 'Remaining permissions: %', permission_count;
    RAISE NOTICE 'Remaining role_permissions: %', role_permission_count;
    
    IF permission_count = 0 AND role_permission_count = 0 THEN
        RAISE NOTICE '✓ Successfully cleared all permissions';
    ELSE
        RAISE WARNING '⚠ Some records remain - check for constraints';
    END IF;
END $$;

-- =============================================================================
-- NEXT STEPS:
-- =============================================================================
-- 1. Run your DMS-Backend application
-- 2. The updated ComprehensivePermissionSeeder will automatically seed correct permissions
-- 3. Run verify_permissions.sql to check that new permissions use colon notation
-- 4. Reassign permissions to roles through admin UI or reassign_permissions.sql
-- =============================================================================
