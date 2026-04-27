using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPhase4ConfigEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "outlet_employees",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "grid_configurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    grid_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    configuration_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    column_settings = table.Column<string>(type: "jsonb", nullable: true),
                    sort_settings = table.Column<string>(type: "jsonb", nullable: true),
                    filter_settings = table.Column<string>(type: "jsonb", nullable: true),
                    page_size = table.Column<int>(type: "integer", nullable: true),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    is_shared = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_grid_configurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_grid_configurations_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_grid_configurations_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_grid_configurations_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "label_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    setting_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    setting_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    setting_value = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    value_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_system_setting = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_label_settings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_label_settings_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_label_settings_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "label_templates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    template_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    width_mm = table.Column<decimal>(type: "numeric", nullable: false),
                    height_mm = table.Column<decimal>(type: "numeric", nullable: false),
                    layout_design = table.Column<string>(type: "text", nullable: true),
                    fields = table.Column<string>(type: "jsonb", nullable: true),
                    font_settings = table.Column<string>(type: "jsonb", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_label_templates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_label_templates_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_label_templates_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "price_lists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    price_list_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    effective_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    effective_to = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_price_lists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_price_lists_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_price_lists_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "rounding_rules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    applies_to = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    rounding_method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    decimal_places = table.Column<int>(type: "integer", nullable: false),
                    rounding_increment = table.Column<decimal>(type: "numeric(10,4)", nullable: false),
                    min_value = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    max_value = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rounding_rules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_rounding_rules_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_rounding_rules_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "security_policies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    policy_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    policy_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    policy_value = table.Column<string>(type: "text", nullable: true),
                    value_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_enforced = table.Column<bool>(type: "boolean", nullable: false),
                    is_system_policy = table.Column<bool>(type: "boolean", nullable: false),
                    severity_level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    last_reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_security_policies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_security_policies_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_security_policies_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "workflow_configs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    workflow_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    requires_approval = table.Column<bool>(type: "boolean", nullable: false),
                    approval_levels = table.Column<int>(type: "integer", nullable: false),
                    auto_approve_threshold = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    approval_steps = table.Column<string>(type: "jsonb", nullable: true),
                    notification_settings = table.Column<string>(type: "jsonb", nullable: true),
                    timeout_hours = table.Column<int>(type: "integer", nullable: true),
                    escalation_config = table.Column<string>(type: "jsonb", nullable: true),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workflow_configs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_workflow_configs_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_workflow_configs_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "price_list_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    price_list_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_percentage = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    min_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    max_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_price_list_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_price_list_items_price_lists_price_list_id",
                        column: x => x.price_list_id,
                        principalTable: "price_lists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_price_list_items_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_price_list_items_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_price_list_items_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_outlet_employees_user_id",
                table: "outlet_employees",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_grid_configurations_CreatedById",
                table: "grid_configurations",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_grid_configurations_UpdatedById",
                table: "grid_configurations",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_grid_configurations_user_id",
                table: "grid_configurations",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_label_settings_CreatedById",
                table: "label_settings",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_label_settings_UpdatedById",
                table: "label_settings",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_label_templates_CreatedById",
                table: "label_templates",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_label_templates_UpdatedById",
                table: "label_templates",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_price_list_items_CreatedById",
                table: "price_list_items",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_price_list_items_price_list_id",
                table: "price_list_items",
                column: "price_list_id");

            migrationBuilder.CreateIndex(
                name: "IX_price_list_items_product_id",
                table: "price_list_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_price_list_items_UpdatedById",
                table: "price_list_items",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_price_lists_CreatedById",
                table: "price_lists",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_price_lists_UpdatedById",
                table: "price_lists",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_rounding_rules_CreatedById",
                table: "rounding_rules",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_rounding_rules_UpdatedById",
                table: "rounding_rules",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_security_policies_CreatedById",
                table: "security_policies",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_security_policies_UpdatedById",
                table: "security_policies",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_workflow_configs_CreatedById",
                table: "workflow_configs",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_workflow_configs_UpdatedById",
                table: "workflow_configs",
                column: "UpdatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_outlet_employees_users_user_id",
                table: "outlet_employees",
                column: "user_id",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_outlet_employees_users_user_id",
                table: "outlet_employees");

            migrationBuilder.DropTable(
                name: "grid_configurations");

            migrationBuilder.DropTable(
                name: "label_settings");

            migrationBuilder.DropTable(
                name: "label_templates");

            migrationBuilder.DropTable(
                name: "price_list_items");

            migrationBuilder.DropTable(
                name: "rounding_rules");

            migrationBuilder.DropTable(
                name: "security_policies");

            migrationBuilder.DropTable(
                name: "workflow_configs");

            migrationBuilder.DropTable(
                name: "price_lists");

            migrationBuilder.DropIndex(
                name: "IX_outlet_employees_user_id",
                table: "outlet_employees");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "outlet_employees");
        }
    }
}
