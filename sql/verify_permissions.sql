-- =============================================================================
-- VERIFY PERMISSIONS SCRIPT
-- =============================================================================
-- Purpose: Verify that permissions were created with correct colon notation codes
-- This script checks permission structure and reports any issues
-- =============================================================================

\echo '========================================';
\echo 'PERMISSION VERIFICATION REPORT';
\echo '========================================';
\echo '';

-- Check 1: Total permission count
\echo '1. TOTAL PERMISSIONS';
\echo '----------------------------------------';
SELECT 
    COUNT(*) as total_permissions,
    COUNT(CASE WHEN code LIKE '%:%' THEN 1 END) as colon_notation_count,
    COUNT(CASE WHEN code LIKE '%.%' AND code NOT LIKE '%:%' THEN 1 END) as dot_notation_count
FROM permissions;
\echo '';

-- Check 2: Show sample permissions by module
\echo '2. SAMPLE PERMISSIONS BY MODULE';
\echo '----------------------------------------';
SELECT 
    module,
    COUNT(*) as permission_count,
    string_agg(code, ', ' ORDER BY code LIMIT 3) as sample_codes
FROM permissions
GROUP BY module
ORDER BY module
LIMIT 20;
\echo '';

-- Check 3: Check for incorrect dot notation (should be zero)
\echo '3. INCORRECT PERMISSIONS (DOT NOTATION)';
\echo '----------------------------------------';
SELECT 
    code, 
    name, 
    module,
    'Should use colon notation' as issue
FROM permissions
WHERE code LIKE '%.%' 
  AND code NOT LIKE '%:%'
ORDER BY code
LIMIT 10;
\echo '';

-- Check 4: Verify critical permissions exist
\echo '4. CRITICAL PERMISSIONS CHECK';
\echo '----------------------------------------';
WITH critical_permissions AS (
    SELECT unnest(ARRAY[
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'roles:read',
        'roles:create',
        'inventory:view',
        'order:view',
        'production:daily:view',
        'operation:delivery:view',
        'approval:view',
        'approval:approve'
    ]) as expected_code
)
SELECT 
    cp.expected_code,
    CASE 
        WHEN p.code IS NOT NULL THEN '✓ EXISTS'
        ELSE '✗ MISSING'
    END as status
FROM critical_permissions cp
LEFT JOIN permissions p ON p.code = cp.expected_code
ORDER BY cp.expected_code;
\echo '';

-- Check 5: Controllers without matching permissions (potential issues)
\echo '5. PERMISSION GROUPS';
\echo '----------------------------------------';
SELECT 
    CASE 
        WHEN code LIKE 'users:%' THEN 'Users'
        WHEN code LIKE 'roles:%' THEN 'Roles'
        WHEN code LIKE 'inventory:%' THEN 'Inventory'
        WHEN code LIKE 'showroom:%' THEN 'Showroom'
        WHEN code LIKE 'operation:%' THEN 'Operations'
        WHEN code LIKE 'production:%' THEN 'Production'
        WHEN code LIKE 'order:%' OR code LIKE 'delivery_plan:%' THEN 'Orders & Plans'
        WHEN code LIKE 'recipes:%' THEN 'Recipes'
        WHEN code LIKE 'reports:%' THEN 'Reports'
        WHEN code LIKE 'system:%' OR code LIKE 'admin:%' THEN 'System & Admin'
        WHEN code LIKE 'approval:%' THEN 'Approvals'
        ELSE 'Other'
    END as permission_group,
    COUNT(*) as count
FROM permissions
GROUP BY permission_group
ORDER BY permission_group;
\echo '';

-- Check 6: Display order check
\echo '6. DISPLAY ORDER CHECK';
\echo '----------------------------------------';
SELECT 
    CASE 
        WHEN MIN(display_order) IS NULL THEN 'Display order not set'
        WHEN MIN(display_order) = 0 AND MAX(display_order) > 0 THEN 'Display order properly set'
        ELSE 'Check display order values'
    END as display_order_status,
    MIN(display_order) as min_order,
    MAX(display_order) as max_order,
    COUNT(*) as total_permissions
FROM permissions;
\echo '';

-- Check 7: Find permissions with special characters that might cause issues
\echo '7. POTENTIAL PROBLEMATIC PERMISSIONS';
\echo '----------------------------------------';
SELECT 
    code,
    name,
    CASE 
        WHEN code LIKE '% %' THEN 'Contains spaces'
        WHEN code LIKE '%__%' THEN 'Contains double underscore'
        WHEN code LIKE '%..%' THEN 'Contains double dots'
        WHEN code LIKE '%::%' THEN 'Contains double colons'
        ELSE 'Other issue'
    END as issue
FROM permissions
WHERE code LIKE '% %' 
   OR code LIKE '%__%'
   OR code LIKE '%..%'
   OR code LIKE '%::%'
LIMIT 10;
\echo '';

-- Summary
\echo '========================================';
\echo 'VERIFICATION SUMMARY';
\echo '========================================';
DO $$
DECLARE
    total_count INTEGER;
    colon_count INTEGER;
    dot_count INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN code LIKE '%:%' THEN 1 END),
        COUNT(CASE WHEN code LIKE '%.%' AND code NOT LIKE '%:%' THEN 1 END)
    INTO total_count, colon_count, dot_count
    FROM permissions;
    
    RAISE NOTICE 'Total permissions: %', total_count;
    RAISE NOTICE 'Correct format (colon): %', colon_count;
    RAISE NOTICE 'Incorrect format (dot): %', dot_count;
    RAISE NOTICE '';
    
    IF total_count = 0 THEN
        RAISE WARNING '⚠ NO PERMISSIONS FOUND - Run application to seed permissions';
    ELSIF dot_count > 0 THEN
        RAISE WARNING '⚠ FOUND % PERMISSIONS WITH INCORRECT DOT NOTATION', dot_count;
        RAISE WARNING '  Need to clear and reseed permissions';
    ELSIF colon_count = total_count THEN
        RAISE NOTICE '✓ ALL PERMISSIONS USE CORRECT COLON NOTATION';
        RAISE NOTICE '✓ PERMISSION SYSTEM IS CORRECTLY CONFIGURED';
    ELSE
        RAISE WARNING '⚠ MIXED NOTATION FOUND - Some permissions may not work';
    END IF;
END $$;

\echo '';
\echo '========================================';
\echo 'Next steps if issues found:';
\echo '1. Run clear_permissions.sql';
\echo '2. Restart your application';
\echo '3. Run this verification script again';
\echo '========================================';
