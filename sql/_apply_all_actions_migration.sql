-- ===========================================================================
-- Apply 20260430140000_AddAllActionsToAllPermissions
-- ---------------------------------------------------------------------------
-- Mirrors the EF migration .cs file. Idempotent: safe to run multiple times.
-- ===========================================================================

BEGIN;

DO $$
DECLARE
    items JSONB := '[
        {"prefix": "dashboard",                          "sub": "Main",                     "parent": "Dashboard"},

        {"prefix": "products",                           "sub": "Products",                 "parent": "Inventory"},
        {"prefix": "categories",                         "sub": "Categories",               "parent": "Inventory"},
        {"prefix": "unit-of-measure",                    "sub": "UnitOfMeasure",            "parent": "Inventory"},
        {"prefix": "ingredients",                        "sub": "Ingredients",              "parent": "Inventory"},

        {"prefix": "showroom",                           "sub": "Outlets",                  "parent": "Showroom"},

        {"prefix": "operation:delivery",                 "sub": "Delivery",                 "parent": "Operation"},
        {"prefix": "operation:delivery-return",          "sub": "DeliveryReturn",           "parent": "Operation"},
        {"prefix": "operation:disposal",                 "sub": "Disposal",                 "parent": "Operation"},
        {"prefix": "operation:transfer",                 "sub": "Transfer",                 "parent": "Operation"},
        {"prefix": "operation:stock-bf",                 "sub": "StockBF",                  "parent": "Operation"},
        {"prefix": "operation:cancellation",             "sub": "Cancellation",             "parent": "Operation"},
        {"prefix": "operation:label-printing",           "sub": "LabelPrinting",            "parent": "Operation"},
        {"prefix": "operation:showroom-label-printing",  "sub": "ShowroomLabelPrinting",    "parent": "Operation"},
        {"prefix": "operation:showroom-open-stock",      "sub": "ShowroomOpenStock",        "parent": "Operation"},
        {"prefix": "operation:approvals",                "sub": "Approvals",                "parent": "Operation"},

        {"prefix": "production:daily",                   "sub": "DailyProduction",          "parent": "Production"},
        {"prefix": "production:cancel",                  "sub": "ProductionCancel",         "parent": "Production"},
        {"prefix": "production:plan",                    "sub": "ProductionPlan",           "parent": "Production"},
        {"prefix": "production:current-stock",           "sub": "CurrentStock",             "parent": "Production"},
        {"prefix": "production:stock-adjustment",        "sub": "StockAdjustment",          "parent": "Production"},
        {"prefix": "production:shift",                   "sub": "Shifts",                   "parent": "Production"},

        {"prefix": "order",                              "sub": "OrderEntry",               "parent": "DMS"},
        {"prefix": "delivery_plan",                      "sub": "DeliveryPlan",             "parent": "DMS"},
        {"prefix": "delivery-summary",                   "sub": "DeliverySummary",          "parent": "DMS"},
        {"prefix": "immediate_order",                    "sub": "ImmediateOrders",          "parent": "DMS"},
        {"prefix": "default_quantity",                   "sub": "DefaultQuantities",        "parent": "DMS"},
        {"prefix": "production-planner",                 "sub": "ProductionPlanner",        "parent": "DMS"},
        {"prefix": "stores-issue-note",                  "sub": "StoresIssueNote",          "parent": "DMS"},
        {"prefix": "recipes",                            "sub": "RecipeManagement",         "parent": "DMS"},
        {"prefix": "recipe-templates",                   "sub": "RecipeTemplates",          "parent": "DMS"},
        {"prefix": "freezer_stock",                      "sub": "FreezerStock",             "parent": "DMS"},
        {"prefix": "anytime-recipe",                     "sub": "AnytimeRecipe",            "parent": "DMS"},
        {"prefix": "dough-generator",                    "sub": "DoughGenerator",           "parent": "DMS"},
        {"prefix": "dms-recipe",                         "sub": "RecipeExport",             "parent": "DMS"},
        {"prefix": "dashboard-pivot",                    "sub": "DashboardPivot",           "parent": "DMS"},
        {"prefix": "print:receipt-cards",                "sub": "PrintReceiptCards",        "parent": "DMS"},
        {"prefix": "print:section-bundle",               "sub": "SectionPrintBundle",       "parent": "DMS"},
        {"prefix": "xlsm-importer",                      "sub": "XlsmImporter",             "parent": "DMS"},
        {"prefix": "reconciliation",                     "sub": "Reconciliation",           "parent": "DMS"},

        {"prefix": "reports",                            "sub": "General",                  "parent": "Reports"},
        {"prefix": "reports:sales",                      "sub": "Sales",                    "parent": "Reports"},
        {"prefix": "reports:delivery",                   "sub": "Delivery",                 "parent": "Reports"},
        {"prefix": "reports:disposal",                   "sub": "Disposal",                 "parent": "Reports"},
        {"prefix": "reports:inventory",                  "sub": "Inventory",                "parent": "Reports"},
        {"prefix": "reports:product",                    "sub": "Product",                  "parent": "Reports"},
        {"prefix": "reports:showroom",                   "sub": "Showroom",                 "parent": "Reports"},
        {"prefix": "reports:category",                   "sub": "Category",                 "parent": "Reports"},
        {"prefix": "reports:daily",                      "sub": "Daily",                    "parent": "Reports"},
        {"prefix": "reports:monthly",                    "sub": "Monthly",                  "parent": "Reports"},
        {"prefix": "reports:profit",                     "sub": "Profit",                   "parent": "Reports"},
        {"prefix": "reports:financial",                  "sub": "Financial",                "parent": "Reports"},
        {"prefix": "reports:production",                 "sub": "Production",               "parent": "Reports"},

        {"prefix": "day-end",                            "sub": "DayEndProcess",            "parent": "Administrator"},
        {"prefix": "cashier-balance",                    "sub": "CashierBalance",           "parent": "Administrator"},
        {"prefix": "setting",                            "sub": "SystemSettings",           "parent": "Administrator"},
        {"prefix": "label-settings",                     "sub": "LabelSettings",            "parent": "Administrator"},
        {"prefix": "admin-delivery-plan",                "sub": "AdminDeliveryPlan",        "parent": "Administrator"},
        {"prefix": "security-policies",                  "sub": "Security",                 "parent": "Administrator"},
        {"prefix": "users",                              "sub": "Users",                    "parent": "Administrator"},
        {"prefix": "roles",                              "sub": "Roles",                    "parent": "Administrator"},
        {"prefix": "permissions",                        "sub": "Permissions",              "parent": "Administrator"},
        {"prefix": "admin",                              "sub": "DayLock",                  "parent": "Administrator"},
        {"prefix": "approval",                           "sub": "Approvals",                "parent": "Administrator"},
        {"prefix": "employee",                           "sub": "ShowroomEmployee",         "parent": "Administrator"},
        {"prefix": "pricing",                            "sub": "PriceManager",             "parent": "Administrator"},
        {"prefix": "workflow-config",                    "sub": "WorkflowConfig",           "parent": "Administrator"},
        {"prefix": "grid-config",                        "sub": "GridConfiguration",        "parent": "Administrator"},
        {"prefix": "day_type",                           "sub": "DayTypes",                 "parent": "Administrator"},
        {"prefix": "delivery_turn",                      "sub": "DeliveryTurns",            "parent": "Administrator"},
        {"prefix": "rounding-rules",                     "sub": "RoundingRules",            "parent": "Administrator"},
        {"prefix": "section-consumables",                "sub": "SectionConsumables",       "parent": "Administrator"},
        {"prefix": "label-templates",                    "sub": "LabelTemplates",           "parent": "Administrator"}
    ]'::jsonb;

    actions JSONB := '[
        {"suffix": "view",              "label": "View"},
        {"suffix": "create",            "label": "Create"},
        {"suffix": "edit",              "label": "Update"},
        {"suffix": "delete",            "label": "Delete"},
        {"suffix": "approve",           "label": "Approve"},
        {"suffix": "reject",            "label": "Reject"},
        {"suffix": "print",             "label": "Print"},
        {"suffix": "import",            "label": "Import"},
        {"suffix": "export",            "label": "Export"},
        {"suffix": "execute",           "label": "Execute"},
        {"suffix": "generate",          "label": "Generate"},
        {"suffix": "lock",              "label": "Lock"},
        {"suffix": "allow-back-future", "label": "AllowBackFuture"}
    ]'::jsonb;

    item            JSONB;
    act             JSONB;
    p_code          TEXT;
    p_name          TEXT;
    p_module        TEXT;
    p_desc          TEXT;
    next_order      INT;
    inserted_count  INT := 0;
    granted_count   INT := 0;
BEGIN
    SELECT COALESCE(MAX("DisplayOrder"), 0) + 1
      INTO next_order
      FROM permissions;

    FOR item IN SELECT * FROM jsonb_array_elements(items) LOOP
        FOR act IN SELECT * FROM jsonb_array_elements(actions) LOOP
            p_code   := (item->>'prefix') || ':' || (act->>'suffix');
            p_name   := (act->>'label')   || ' '  || (item->>'sub');
            p_module := (item->>'parent') || ' - ' || (item->>'sub');
            p_desc   := p_name;

            IF NOT EXISTS (SELECT 1 FROM permissions WHERE "Code" = p_code) THEN
                INSERT INTO permissions
                    ("Id", "Code", "Name", "Module", "Description",
                     "IsSystemPermission", "DisplayOrder", "CreatedAt")
                VALUES
                    (gen_random_uuid(), p_code, p_name, p_module, p_desc,
                     true, next_order, NOW());

                next_order     := next_order + 1;
                inserted_count := inserted_count + 1;
            END IF;
        END LOOP;
    END LOOP;

    INSERT INTO role_permissions ("Id", "RoleId", "PermissionId", "GrantedAt")
    SELECT gen_random_uuid(), r."Id", p."Id", NOW()
      FROM roles r
      CROSS JOIN permissions p
     WHERE (
            r."Name" ILIKE 'administrator'
         OR r."Name" ILIKE 'system administrator'
         OR r."Name" ILIKE 'super admin'
         OR r."Name" ILIKE 'super administrator'
       )
       AND NOT EXISTS (
           SELECT 1
             FROM role_permissions rp
            WHERE rp."RoleId" = r."Id"
              AND rp."PermissionId" = p."Id"
       );

    GET DIAGNOSTICS granted_count = ROW_COUNT;

    RAISE NOTICE 'AddAllActionsToAllPermissions: inserted % permission(s), granted % role-permission row(s) to admin role(s).',
        inserted_count, granted_count;
END $$;

-- Mark the EF migration as applied so a later `dotnet ef database update`
-- doesn't try to re-run the same SQL.
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260430140000_AddAllActionsToAllPermissions', '10.0.6')
ON CONFLICT ("MigrationId") DO NOTHING;

COMMIT;

-- Summary
SELECT COUNT(*) AS total_permissions FROM permissions;
SELECT COUNT(*) AS total_role_permissions FROM role_permissions;
SELECT "MigrationId" FROM "__EFMigrationsHistory" ORDER BY "MigrationId";
