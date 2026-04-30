-- ============================================================
-- ADD MISSING PERMISSIONS - Migration Script
-- ============================================================
-- Purpose: Add newly defined permissions to existing database
-- Date: April 30, 2026
-- Impact: Adds 15 new permissions without affecting existing data
-- ============================================================

-- Start transaction
BEGIN;

-- Get the maximum DisplayOrder to continue from
DO $$
DECLARE
    max_display_order INT;
    current_display_order INT;
BEGIN
    -- Get current max display order
    SELECT COALESCE(MAX("DisplayOrder"), 0) INTO max_display_order
    FROM "Permissions";
    
    current_display_order := max_display_order + 1;

    -- ============================================================
    -- ADMINISTRATOR MODULE - Parent Module Access
    -- ============================================================
    
    -- Check if administrator:view exists
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'administrator:view') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'administrator:view',
            'View Module',
            'Administrator - Module',
            'Access administrator module',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: administrator:view';
    ELSE
        RAISE NOTICE 'Permission already exists: administrator:view';
    END IF;

    -- ============================================================
    -- ADMINISTRATOR MODULE - Day-End Process
    -- ============================================================
    
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'day-end:view') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'day-end:view',
            'View DayEndProcess',
            'Administrator - DayEndProcess',
            'View day-end process',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: day-end:view';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'day-end:execute') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'day-end:execute',
            'Execute DayEndProcess',
            'Administrator - DayEndProcess',
            'Execute day-end process',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: day-end:execute';
    END IF;

    -- ============================================================
    -- ADMINISTRATOR MODULE - Cashier Balance
    -- ============================================================
    
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'cashier-balance:view') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'cashier-balance:view',
            'View CashierBalance',
            'Administrator - CashierBalance',
            'View cashier balance',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: cashier-balance:view';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'cashier-balance:create') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'cashier-balance:create',
            'Create CashierBalance',
            'Administrator - CashierBalance',
            'Create cashier balance entries',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: cashier-balance:create';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'cashier-balance:edit') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'cashier-balance:edit',
            'Update CashierBalance',
            'Administrator - CashierBalance',
            'Update cashier balance',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: cashier-balance:edit';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'cashier-balance:delete') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'cashier-balance:delete',
            'Delete CashierBalance',
            'Administrator - CashierBalance',
            'Delete cashier balance entries',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: cashier-balance:delete';
    END IF;

    -- ============================================================
    -- ADMINISTRATOR MODULE - Admin Delivery Plan
    -- ============================================================
    
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'admin-delivery-plan:view') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'admin-delivery-plan:view',
            'View AdminDeliveryPlan',
            'Administrator - AdminDeliveryPlan',
            'View admin delivery plan',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: admin-delivery-plan:view';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'admin-delivery-plan:create') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'admin-delivery-plan:create',
            'Create AdminDeliveryPlan',
            'Administrator - AdminDeliveryPlan',
            'Create admin delivery plan',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: admin-delivery-plan:create';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'admin-delivery-plan:edit') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'admin-delivery-plan:edit',
            'Update AdminDeliveryPlan',
            'Administrator - AdminDeliveryPlan',
            'Update admin delivery plan',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: admin-delivery-plan:edit';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'admin-delivery-plan:delete') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'admin-delivery-plan:delete',
            'Delete AdminDeliveryPlan',
            'Administrator - AdminDeliveryPlan',
            'Delete admin delivery plan',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: admin-delivery-plan:delete';
    END IF;

    -- ============================================================
    -- DMS MODULE - Parent Module Access
    -- ============================================================
    
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'dms:view') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'dms:view',
            'View Module',
            'DMS - Module',
            'Access DMS module',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: dms:view';
    END IF;

    -- ============================================================
    -- DMS MODULE - Anytime Recipe Generator
    -- ============================================================
    
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'anytime-recipe:view') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'anytime-recipe:view',
            'View AnytimeRecipe',
            'DMS - AnytimeRecipe',
            'View anytime recipe generator',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: anytime-recipe:view';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'anytime-recipe:generate') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'anytime-recipe:generate',
            'Generate AnytimeRecipe',
            'DMS - AnytimeRecipe',
            'Generate anytime recipes',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: anytime-recipe:generate';
    END IF;

    -- ============================================================
    -- DMS MODULE - Dough Generator
    -- ============================================================
    
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'dough-generator:view') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'dough-generator:view',
            'View DoughGenerator',
            'DMS - DoughGenerator',
            'View dough generator',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: dough-generator:view';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'dough-generator:generate') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'dough-generator:generate',
            'Generate DoughGenerator',
            'DMS - DoughGenerator',
            'Generate dough recipes',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: dough-generator:generate';
    END IF;

    -- ============================================================
    -- DMS MODULE - Recipe Export
    -- ============================================================
    
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'dms-recipe:export') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'dms-recipe:export',
            'Export RecipeExport',
            'DMS - RecipeExport',
            'Export/upload DMS recipes',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: dms-recipe:export';
    END IF;

    -- ============================================================
    -- DMS MODULE - XLSM Importer
    -- ============================================================
    
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'xlsm-importer:view') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'xlsm-importer:view',
            'View XlsmImporter',
            'DMS - XlsmImporter',
            'View XLSM importer',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: xlsm-importer:view';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'xlsm-importer:import') THEN
        INSERT INTO "Permissions" ("Id", "Code", "Name", "Module", "Description", "IsSystemPermission", "DisplayOrder", "CreatedAt")
        VALUES (
            gen_random_uuid(),
            'xlsm-importer:import',
            'Import XlsmImporter',
            'DMS - XlsmImporter',
            'Import XLSM files',
            true,
            current_display_order,
            NOW()
        );
        current_display_order := current_display_order + 1;
        RAISE NOTICE 'Added permission: xlsm-importer:import';
    END IF;

    -- Display summary
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Total permissions checked: 18';
    RAISE NOTICE 'New DisplayOrder range: % - %', max_display_order + 1, current_display_order - 1;
    RAISE NOTICE '============================================================';

END $$;

-- Commit transaction
COMMIT;

-- Verify the results
SELECT 
    "Code",
    "Name",
    "Module",
    "Description",
    "DisplayOrder"
FROM "Permissions"
WHERE "Code" IN (
    'administrator:view',
    'day-end:view',
    'day-end:execute',
    'cashier-balance:view',
    'cashier-balance:create',
    'cashier-balance:edit',
    'cashier-balance:delete',
    'admin-delivery-plan:view',
    'admin-delivery-plan:create',
    'admin-delivery-plan:edit',
    'admin-delivery-plan:delete',
    'dms:view',
    'anytime-recipe:view',
    'anytime-recipe:generate',
    'dough-generator:view',
    'dough-generator:generate',
    'dms-recipe:export',
    'xlsm-importer:view',
    'xlsm-importer:import'
)
ORDER BY "DisplayOrder";

-- Show permission count by module
SELECT 
    "Module",
    COUNT(*) as "PermissionCount"
FROM "Permissions"
GROUP BY "Module"
ORDER BY "Module";

-- ============================================================
-- NOTES:
-- ============================================================
-- 1. This script is idempotent - safe to run multiple times
-- 2. Existing permissions are NOT modified
-- 3. Role-permission relationships are NOT affected
-- 4. Users need to logout/login to get updated permissions in JWT
-- 5. DisplayOrder is automatically incremented from max value
-- 6. All new permissions are marked as IsSystemPermission = true
-- ============================================================
