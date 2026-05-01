-- ================================================
-- Verify Frontend Menu Permissions Match Database
-- ================================================
-- This script checks if all permission codes used in frontend menu-items.ts
-- actually exist in the database

-- List of permissions required by frontend menu items
-- (extracted from src/lib/navigation/menu-items.ts)

CREATE TEMP TABLE frontend_permissions (
    permission_code VARCHAR(100)
);

INSERT INTO frontend_permissions VALUES
-- Inventory module
('inventory.products.view'),
('inventory.category.view'),
('inventory.uom.view'),
('inventory.ingredient.view'),

-- Show Room
('showroom.view'),

-- Operation module
('operation.delivery.view'),
('operation.delivery.approve'),
('operation.disposal.view'),
('operation.transfer.view'),
('operation.stock-bf.view'),
('operation.cancellation.view'),
('operation.delivery-return.view'),
('operation.label-printing.view'),
('operation.showroom-open-stock.view'),
('operation.showroom-label-printing.view'),

-- Production module
('production.view'),
('production.daily.view'),
('production.cancel.view'),
('production.stock.view'),
('production.adjustment.view'),
('production.adjustment-approval.view'),
('production.plan.view'),

-- DMS module
('dms.view'),
('dms.order-entry.view'),
('dms.delivery-plan.view'),
('dms.delivery-summary.view'),
('dms.immediate-orders.view'),
('dms.default-quantities.view'),
('dms.production-planner.view'),
('dms.stores-issue-note.view'),
('dms.recipe-management.view'),
('dms.recipe-templates.view'),
('dms.freezer-stock.view'),
('dms.anytime-recipe.view'),
('dms.dough.view'),
('dms.dashboard-pivot.view'),
('dms.print.view'),
('dms.export.view'),
('dms.reconciliation.view'),
('dms.importer.view'),

-- Reports
('reports.view'),

-- Administrator module
('administrator.view'),
('administrator.day-end.view'),
('administrator.cashier-balance.view'),
('administrator.settings.view'),
('administrator.label-settings.view'),
('administrator.delivery-plan.view'),
('administrator.security.view'),
('administrator.users.view'),
('administrator.roles.view'),
('administrator.permissions.view'),
('administrator.day-lock.view'),
('administrator.approvals.view'),
('administrator.showroom-employee.view'),
('administrator.price-manager.view'),
('administrator.workflow-config.view'),
('administrator.grid-config.view'),
('administrator.day-types.view'),
('administrator.delivery-turns.view'),
('administrator.rounding.view'),
('administrator.consumables.view'),
('administrator.label-templates.view');

-- Check which frontend permissions exist in database
RAISE NOTICE '================================================';
RAISE NOTICE 'CHECKING FRONTEND PERMISSIONS IN DATABASE';
RAISE NOTICE '================================================';

SELECT 
    fp.permission_code as "Frontend Permission",
    CASE 
        WHEN p."Id" IS NOT NULL THEN '✓ EXISTS' 
        ELSE '✗ MISSING' 
    END as "Status",
    p."Name" as "Database Name",
    p."Module" as "Module"
FROM frontend_permissions fp
LEFT JOIN "Permissions" p ON p."Code" = fp.permission_code
ORDER BY 
    CASE WHEN p."Id" IS NULL THEN 0 ELSE 1 END,
    fp.permission_code;

-- Count summary
SELECT 
    COUNT(*) as "Total Frontend Permissions",
    COUNT(p."Id") as "Found in Database",
    COUNT(*) - COUNT(p."Id") as "Missing from Database"
FROM frontend_permissions fp
LEFT JOIN "Permissions" p ON p."Code" = fp.permission_code;

-- Show MISSING permissions
RAISE NOTICE '';
RAISE NOTICE '================================================';
RAISE NOTICE 'MISSING PERMISSIONS (NEED TO BE CREATED)';
RAISE NOTICE '================================================';

SELECT 
    fp.permission_code as "Missing Permission Code"
FROM frontend_permissions fp
LEFT JOIN "Permissions" p ON p."Code" = fp.permission_code
WHERE p."Id" IS NULL
ORDER BY fp.permission_code;

-- Show existing permissions that might be alternatives
RAISE NOTICE '';
RAISE NOTICE '================================================';
RAISE NOTICE 'ALTERNATIVE PERMISSIONS IN DATABASE';
RAISE NOTICE '================================================';
RAISE NOTICE 'These might be what frontend is looking for:';
RAISE NOTICE '';

SELECT DISTINCT
    "Module" as "Module",
    COUNT(*) as "Permission Count",
    string_agg("Code", ', ' ORDER BY "Code") as "Codes"
FROM "Permissions"
WHERE "Code" LIKE '%.view'
   OR "Code" LIKE '%:view'
GROUP BY "Module"
ORDER BY "Module";

-- Cleanup
DROP TABLE frontend_permissions;
