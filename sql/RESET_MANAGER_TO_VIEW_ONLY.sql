-- ================================================
-- Reset Manager Role to View-Only Permissions
-- ================================================
-- This script removes ALL permissions from Manager role,
-- then assigns ONLY view/read permissions
-- ================================================

DO $$
DECLARE
    manager_role_id UUID;
    perm_record RECORD;
    assigned_count INT := 0;
    removed_count INT := 0;
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'RESETTING MANAGER ROLE TO VIEW-ONLY';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';

    -- Get Manager role ID
    SELECT "Id" INTO manager_role_id 
    FROM "Roles" 
    WHERE "Name" = 'Manager' 
    LIMIT 1;

    IF manager_role_id IS NULL THEN
        RAISE NOTICE '❌ Manager role not found!';
        RETURN;
    END IF;

    RAISE NOTICE '✓ Manager Role ID: %', manager_role_id;
    RAISE NOTICE '';
    
    -- Count existing permissions
    SELECT COUNT(*) INTO removed_count
    FROM "RolePermissions" 
    WHERE "RoleId" = manager_role_id;
    
    RAISE NOTICE 'Current permissions count: %', removed_count;
    
    -- Delete ALL existing permissions for Manager role
    DELETE FROM "RolePermissions" WHERE "RoleId" = manager_role_id;
    RAISE NOTICE '✓ Cleared all existing permissions for Manager role';
    RAISE NOTICE '';
    
    RAISE NOTICE 'Assigning VIEW-ONLY permissions...';
    RAISE NOTICE '';

    -- Assign ONLY VIEW/READ permissions to Manager role
    FOR perm_record IN 
        SELECT "Id", "Code", "Name", "Module"
        FROM "Permissions" 
        WHERE "Code" LIKE '%:view' 
           OR "Code" LIKE '%:read'
           OR "Code" = 'dashboard:access'  -- Allow dashboard access
        ORDER BY "Module", "DisplayOrder", "Code"
    LOOP
        INSERT INTO "RolePermissions" ("Id", "RoleId", "PermissionId", "GrantedAt")
        VALUES (
            gen_random_uuid(),
            manager_role_id,
            perm_record."Id",
            NOW()
        )
        ON CONFLICT DO NOTHING;
        
        assigned_count := assigned_count + 1;
        RAISE NOTICE '  ✓ % - %', perm_record."Code", perm_record."Name";
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'SUMMARY';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Removed: % permissions', removed_count;
    RAISE NOTICE 'Assigned: % VIEW-ONLY permissions', assigned_count;
    RAISE NOTICE '';
    RAISE NOTICE '✓ Manager role is now VIEW-ONLY';
    RAISE NOTICE '';
    RAISE NOTICE '⚠ IMPORTANT: All Manager users MUST LOG OUT and LOG IN again';
    RAISE NOTICE '             to get new tokens with updated permissions!';
    RAISE NOTICE '================================================';
END $$;

-- Verify the assignments
\echo ''
\echo 'Verification - Permission Type Summary:'
\echo ''

SELECT 
    CASE 
        WHEN p."Code" LIKE '%:view' OR p."Code" LIKE '%.view' THEN 'VIEW'
        WHEN p."Code" LIKE '%:read' OR p."Code" LIKE '%.read' THEN 'READ'
        WHEN p."Code" LIKE '%:create' OR p."Code" LIKE '%.create' THEN 'CREATE (SHOULD BE 0!)'
        WHEN p."Code" LIKE '%:update' OR p."Code" LIKE '%.update' THEN 'UPDATE (SHOULD BE 0!)'
        WHEN p."Code" LIKE '%:delete' OR p."Code" LIKE '%.delete' THEN 'DELETE (SHOULD BE 0!)'
        WHEN p."Code" LIKE '%:execute' OR p."Code" LIKE '%.execute' THEN 'EXECUTE (SHOULD BE 0!)'
        WHEN p."Code" LIKE '%:approve' OR p."Code" LIKE '%.approve' THEN 'APPROVE (SHOULD BE 0!)'
        ELSE 'OTHER'
    END as "Permission Type",
    COUNT(*) as "Count"
FROM "Permissions" p
JOIN "RolePermissions" rp ON p."Id" = rp."PermissionId"
JOIN "Roles" r ON rp."RoleId" = r."Id"
WHERE r."Name" = 'Manager'
GROUP BY 
    CASE 
        WHEN p."Code" LIKE '%:view' OR p."Code" LIKE '%.view' THEN 'VIEW'
        WHEN p."Code" LIKE '%:read' OR p."Code" LIKE '%.read' THEN 'READ'
        WHEN p."Code" LIKE '%:create' OR p."Code" LIKE '%.create' THEN 'CREATE (SHOULD BE 0!)'
        WHEN p."Code" LIKE '%:update' OR p."Code" LIKE '%.update' THEN 'UPDATE (SHOULD BE 0!)'
        WHEN p."Code" LIKE '%:delete' OR p."Code" LIKE '%.delete' THEN 'DELETE (SHOULD BE 0!)'
        WHEN p."Code" LIKE '%:execute' OR p."Code" LIKE '%.execute' THEN 'EXECUTE (SHOULD BE 0!)'
        WHEN p."Code" LIKE '%:approve' OR p."Code" LIKE '%.approve' THEN 'APPROVE (SHOULD BE 0!)'
        ELSE 'OTHER'
    END
ORDER BY "Count" DESC;
