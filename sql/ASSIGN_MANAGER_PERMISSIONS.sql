-- ================================================
-- Assign View Permissions to Manager Role
-- ================================================
-- This script assigns all "view" permissions to the Manager role
-- so that managers can see and access most screens in the system

DO $$
DECLARE
    manager_role_id UUID;
    perm_record RECORD;
    assigned_count INT := 0;
BEGIN
    -- Get Manager role ID
    SELECT "Id" INTO manager_role_id 
    FROM "Roles" 
    WHERE "Name" = 'Manager' 
    LIMIT 1;

    IF manager_role_id IS NULL THEN
        RAISE NOTICE 'Manager role not found!';
        RETURN;
    END IF;

    RAISE NOTICE 'Manager Role ID: %', manager_role_id;
    
    -- Delete existing permissions for Manager role
    DELETE FROM "RolePermissions" WHERE "RoleId" = manager_role_id;
    RAISE NOTICE 'Cleared existing permissions for Manager role';

    -- Assign all VIEW permissions to Manager role
    FOR perm_record IN 
        SELECT "Id", "Code", "Name" 
        FROM "Permissions" 
        WHERE "Code" LIKE '%.view' 
           OR "Code" LIKE '%.read'
           OR "Code" LIKE '%:view'
           OR "Code" LIKE '%:read'
        ORDER BY "Code"
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
        RAISE NOTICE 'Assigned: % - %', perm_record."Code", perm_record."Name";
    END LOOP;

    RAISE NOTICE '================================================';
    RAISE NOTICE 'Successfully assigned % permissions to Manager role', assigned_count;
    RAISE NOTICE '================================================';
END $$;

-- Verify the assignments
SELECT 
    r."Name" as "Role",
    COUNT(rp."Id") as "Permission Count"
FROM "Roles" r
LEFT JOIN "RolePermissions" rp ON r."Id" = rp."RoleId"
WHERE r."Name" = 'Manager'
GROUP BY r."Name";

-- Show all permissions assigned to Manager
SELECT 
    p."Module",
    p."Code",
    p."Name" as "Permission Name"
FROM "Permissions" p
JOIN "RolePermissions" rp ON p."Id" = rp."PermissionId"
JOIN "Roles" r ON rp."RoleId" = r."Id"
WHERE r."Name" = 'Manager'
ORDER BY p."Module", p."DisplayOrder", p."Code";
