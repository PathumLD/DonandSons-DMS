-- ================================================
-- Check Manager Role Current Permissions
-- ================================================
-- This script shows what permissions the Manager role currently has

\echo '================================================'
\echo 'MANAGER ROLE - CURRENT PERMISSIONS'
\echo '================================================'

-- Show summary count
SELECT 
    r."Name" as "Role Name",
    COUNT(rp."Id") as "Total Permissions"
FROM "Roles" r
LEFT JOIN "RolePermissions" rp ON r."Id" = rp."RoleId"
WHERE r."Name" = 'Manager'
GROUP BY r."Name";

\echo ''
\echo 'Permissions by type:'
\echo ''

-- Show permissions by operation type
SELECT 
    CASE 
        WHEN p."Code" LIKE '%:view' OR p."Code" LIKE '%.view' THEN 'VIEW'
        WHEN p."Code" LIKE '%:create' OR p."Code" LIKE '%.create' THEN 'CREATE'
        WHEN p."Code" LIKE '%:update' OR p."Code" LIKE '%.update' THEN 'UPDATE'
        WHEN p."Code" LIKE '%:delete' OR p."Code" LIKE '%.delete' THEN 'DELETE'
        WHEN p."Code" LIKE '%:execute' OR p."Code" LIKE '%.execute' THEN 'EXECUTE'
        WHEN p."Code" LIKE '%:approve' OR p."Code" LIKE '%.approve' THEN 'APPROVE'
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
        WHEN p."Code" LIKE '%:create' OR p."Code" LIKE '%.create' THEN 'CREATE'
        WHEN p."Code" LIKE '%:update' OR p."Code" LIKE '%.update' THEN 'UPDATE'
        WHEN p."Code" LIKE '%:delete' OR p."Code" LIKE '%.delete' THEN 'DELETE'
        WHEN p."Code" LIKE '%:execute' OR p."Code" LIKE '%.execute' THEN 'EXECUTE'
        WHEN p."Code" LIKE '%:approve' OR p."Code" LIKE '%.approve' THEN 'APPROVE'
        ELSE 'OTHER'
    END
ORDER BY "Count" DESC;

\echo ''
\echo 'All CREATE/UPDATE/DELETE permissions (should be NONE for view-only Manager):'
\echo ''

-- Show all non-view permissions (these should NOT be assigned to Manager)
SELECT 
    p."Module",
    p."Code",
    p."Name" as "Permission Name",
    CASE 
        WHEN p."Code" LIKE '%:create' OR p."Code" LIKE '%.create' THEN 'CREATE'
        WHEN p."Code" LIKE '%:update' OR p."Code" LIKE '%.update' THEN 'UPDATE'
        WHEN p."Code" LIKE '%:delete' OR p."Code" LIKE '%.delete' THEN 'DELETE'
        WHEN p."Code" LIKE '%:execute' OR p."Code" LIKE '%.execute' THEN 'EXECUTE'
        WHEN p."Code" LIKE '%:approve' OR p."Code" LIKE '%.approve' THEN 'APPROVE'
        ELSE 'OTHER'
    END as "Type"
FROM "Permissions" p
JOIN "RolePermissions" rp ON p."Id" = rp."PermissionId"
JOIN "Roles" r ON rp."RoleId" = r."Id"
WHERE r."Name" = 'Manager'
  AND p."Code" NOT LIKE '%:view'
  AND p."Code" NOT LIKE '%.view'
  AND p."Code" NOT LIKE '%:read'
  AND p."Code" NOT LIKE '%.read'
ORDER BY "Type", p."Module", p."DisplayOrder", p."Code";

\echo ''
\echo 'Delivery-related permissions:'
\echo ''

-- Show all delivery-related permissions
SELECT 
    p."Code",
    p."Name",
    CASE WHEN rp."Id" IS NOT NULL THEN '✓ ASSIGNED' ELSE '✗ NOT ASSIGNED' END as "Status"
FROM "Permissions" p
LEFT JOIN "RolePermissions" rp ON p."Id" = rp."PermissionId" 
    AND rp."RoleId" = (SELECT "Id" FROM "Roles" WHERE "Name" = 'Manager' LIMIT 1)
WHERE p."Code" LIKE '%delivery%'
ORDER BY p."Code";
