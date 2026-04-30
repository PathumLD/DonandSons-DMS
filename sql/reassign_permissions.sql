-- =============================================================================
-- REASSIGN PERMISSIONS SCRIPT
-- =============================================================================
-- Purpose: Reassign permissions to roles after permission codes have been fixed
-- This script provides templates for common role setups
-- =============================================================================
-- IMPORTANT: Modify role names and permission sets based on your needs
-- =============================================================================

BEGIN;

-- =============================================================================
-- ROLE TEMPLATES
-- =============================================================================
-- Adjust these role names to match your actual role names in the database
-- =============================================================================

-- Option 1: Create standard roles if they don't exist
INSERT INTO roles (id, name, description, is_active, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Administrator', 'Full system access', true, NOW(), NOW()),
    (gen_random_uuid(), 'Manager', 'Management level access', true, NOW(), NOW()),
    (gen_random_uuid(), 'Supervisor', 'Supervisor level access', true, NOW(), NOW()),
    (gen_random_uuid(), 'User', 'Standard user access', true, NOW(), NOW()),
    (gen_random_uuid(), 'Viewer', 'Read-only access', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- TEMPLATE 1: ADMINISTRATOR ROLE (Full Access)
-- =============================================================================
-- Give administrator all permissions except super-admin wildcard
-- =============================================================================

\echo 'Assigning permissions to Administrator role...';

DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'Administrator');

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Administrator'),
    id
FROM permissions
WHERE is_system_permission = true;

\echo '✓ Administrator role configured';

-- =============================================================================
-- TEMPLATE 2: MANAGER ROLE (Most Operations)
-- =============================================================================
-- Managers can perform most operations but not system configuration
-- =============================================================================

\echo 'Assigning permissions to Manager role...';

DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'Manager');

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Manager'),
    id
FROM permissions
WHERE code LIKE 'inventory:%'
   OR code LIKE 'order:%'
   OR code LIKE 'delivery_plan:%'
   OR code LIKE 'immediate_order:%'
   OR code LIKE 'default_quantity:%'
   OR code LIKE 'operation:%'
   OR code LIKE 'production:%'
   OR code LIKE 'recipes:%'
   OR code LIKE 'showroom:%'
   OR code LIKE 'reports:%'
   OR code LIKE 'dashboard:%'
   OR code LIKE 'approval:%'
   OR code LIKE 'freezer_stock:%'
   OR code LIKE 'reconciliation:%';

\echo '✓ Manager role configured';

-- =============================================================================
-- TEMPLATE 3: SUPERVISOR ROLE (Operational Access + Limited Approvals)
-- =============================================================================
-- Supervisors can create/update but have limited approval authority
-- =============================================================================

\echo 'Assigning permissions to Supervisor role...';

DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'Supervisor');

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Supervisor'),
    id
FROM permissions
WHERE (code LIKE 'inventory:view'
   OR code LIKE 'order:%'
   OR code LIKE 'delivery_plan:%'
   OR code LIKE 'operation:delivery:view'
   OR code LIKE 'operation:delivery:create'
   OR code LIKE 'operation:delivery:update'
   OR code LIKE 'operation:transfer:%'
   OR code LIKE 'production:daily:%'
   OR code LIKE 'production:plan:%'
   OR code LIKE 'recipes:view'
   OR code LIKE 'showroom:view'
   OR code LIKE 'reports:%'
   OR code LIKE 'dashboard:view')
   AND code NOT LIKE '%:delete'
   AND code NOT LIKE '%:approve';

\echo '✓ Supervisor role configured';

-- =============================================================================
-- TEMPLATE 4: USER ROLE (Standard Operations)
-- =============================================================================
-- Standard users can view and create but not delete or approve
-- =============================================================================

\echo 'Assigning permissions to User role...';

DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'User');

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'User'),
    id
FROM permissions
WHERE (code LIKE '%:view'
   OR code LIKE '%:create'
   OR code LIKE 'order:edit'
   OR code LIKE 'delivery_plan:edit'
   OR code LIKE 'recipes:view'
   OR code LIKE 'reports:%'
   OR code LIKE 'dashboard:view')
   AND code NOT LIKE '%:delete'
   AND code NOT LIKE '%:approve'
   AND code NOT LIKE 'users:%'
   AND code NOT LIKE 'roles:%'
   AND code NOT LIKE 'system:%'
   AND code NOT LIKE 'admin:%';

\echo '✓ User role configured';

-- =============================================================================
-- TEMPLATE 5: VIEWER ROLE (Read-Only)
-- =============================================================================
-- Viewers can only view information, no create/update/delete
-- =============================================================================

\echo 'Assigning permissions to Viewer role...';

DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'Viewer');

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Viewer'),
    id
FROM permissions
WHERE code LIKE '%:view'
   OR code = 'reports:view'
   OR code = 'dashboard:view';

\echo '✓ Viewer role configured';

-- =============================================================================
-- CUSTOM ROLE TEMPLATE
-- =============================================================================
-- Use this template to create custom roles with specific permission sets
-- =============================================================================

-- Example: Production Manager Role
-- DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'Production Manager');
-- 
-- INSERT INTO role_permissions (role_id, permission_id)
-- SELECT 
--     (SELECT id FROM roles WHERE name = 'Production Manager'),
--     id
-- FROM permissions
-- WHERE code LIKE 'production:%'
--    OR code LIKE 'recipes:%'
--    OR code LIKE 'inventory:view'
--    OR code LIKE 'reports:production:%';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

\echo '';
\echo '========================================';
\echo 'PERMISSION ASSIGNMENT SUMMARY';
\echo '========================================';

SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count,
    COUNT(CASE WHEN p.code LIKE '%:view' THEN 1 END) as view_permissions,
    COUNT(CASE WHEN p.code LIKE '%:create' THEN 1 END) as create_permissions,
    COUNT(CASE WHEN p.code LIKE '%:edit' OR p.code LIKE '%:update' THEN 1 END) as edit_permissions,
    COUNT(CASE WHEN p.code LIKE '%:delete' THEN 1 END) as delete_permissions,
    COUNT(CASE WHEN p.code LIKE '%:approve' THEN 1 END) as approve_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE r.name IN ('Administrator', 'Manager', 'Supervisor', 'User', 'Viewer')
GROUP BY r.name
ORDER BY 
    CASE r.name
        WHEN 'Administrator' THEN 1
        WHEN 'Manager' THEN 2
        WHEN 'Supervisor' THEN 3
        WHEN 'User' THEN 4
        WHEN 'Viewer' THEN 5
    END;

\echo '';
\echo '========================================';
\echo 'DETAILED ROLE PERMISSIONS';
\echo '========================================';

-- Show sample permissions for each role
SELECT 
    r.name as role_name,
    string_agg(p.code, ', ' ORDER BY p.code) as sample_permissions
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name IN ('Administrator', 'Manager', 'Supervisor', 'User', 'Viewer')
GROUP BY r.name
ORDER BY 
    CASE r.name
        WHEN 'Administrator' THEN 1
        WHEN 'Manager' THEN 2
        WHEN 'Supervisor' THEN 3
        WHEN 'User' THEN 4
        WHEN 'Viewer' THEN 5
    END;

COMMIT;

\echo '';
\echo '========================================';
\echo '✓ PERMISSION ASSIGNMENT COMPLETE';
\echo '========================================';
\echo '';
\echo 'Next steps:';
\echo '1. Review the permission counts above';
\echo '2. Test login with users assigned to each role';
\echo '3. Verify endpoint access works as expected';
\echo '4. Adjust permissions as needed for your organization';
\echo '';
\echo 'To modify role permissions:';
\echo '- Edit this script and run again, OR';
\echo '- Use the admin UI role management screen';
\echo '========================================';
