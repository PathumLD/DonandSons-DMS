using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class Phase5b_DMS_Planning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "default_quantities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    day_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    mini_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_default_quantities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_default_quantities_day_types_day_type_id",
                        column: x => x.day_type_id,
                        principalTable: "day_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_default_quantities_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_default_quantities_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_default_quantities_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_default_quantities_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "delivery_plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    plan_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    delivery_turn_id = table.Column<Guid>(type: "uuid", nullable: false),
                    day_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    use_freezer_stock = table.Column<bool>(type: "boolean", nullable: false),
                    excluded_outlets = table.Column<string>(type: "jsonb", nullable: true),
                    excluded_products = table.Column<string>(type: "jsonb", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_delivery_plans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_delivery_plans_day_types_day_type_id",
                        column: x => x.day_type_id,
                        principalTable: "day_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_delivery_plans_delivery_turns_delivery_turn_id",
                        column: x => x.delivery_turn_id,
                        principalTable: "delivery_turns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_delivery_plans_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_delivery_plans_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "freezer_stocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    production_section_id = table.Column<Guid>(type: "uuid", nullable: false),
                    current_stock = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    last_updated_by = table.Column<Guid>(type: "uuid", nullable: false),
                    last_updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_freezer_stocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_freezer_stocks_production_sections_production_section_id",
                        column: x => x.production_section_id,
                        principalTable: "production_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_freezer_stocks_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_freezer_stocks_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_freezer_stocks_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_freezer_stocks_users_last_updated_by",
                        column: x => x.last_updated_by,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "immediate_orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    order_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    delivery_turn_id = table.Column<Guid>(type: "uuid", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    mini_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    requested_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    approved_by = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejection_reason = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_immediate_orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_immediate_orders_delivery_turns_delivery_turn_id",
                        column: x => x.delivery_turn_id,
                        principalTable: "delivery_turns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_immediate_orders_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_immediate_orders_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_immediate_orders_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_immediate_orders_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_immediate_orders_users_approved_by",
                        column: x => x.approved_by,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "delivery_plan_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    delivery_plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    mini_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_delivery_plan_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_delivery_plan_items_delivery_plans_delivery_plan_id",
                        column: x => x.delivery_plan_id,
                        principalTable: "delivery_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_delivery_plan_items_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_delivery_plan_items_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_delivery_plan_items_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_delivery_plan_items_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "order_headers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    order_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    delivery_plan_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    use_freezer_stock = table.Column<bool>(type: "boolean", nullable: false),
                    total_items = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_order_headers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_order_headers_delivery_plans_delivery_plan_id",
                        column: x => x.delivery_plan_id,
                        principalTable: "delivery_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_order_headers_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_order_headers_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "freezer_stock_history",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    freezer_stock_id = table.Column<Guid>(type: "uuid", nullable: false),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    transaction_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    previous_stock = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    new_stock = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    reference_no = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_freezer_stock_history", x => x.Id);
                    table.ForeignKey(
                        name: "FK_freezer_stock_history_freezer_stocks_freezer_stock_id",
                        column: x => x.freezer_stock_id,
                        principalTable: "freezer_stocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_freezer_stock_history_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_freezer_stock_history_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "order_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_header_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    delivery_turn_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    mini_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    is_extra = table.Column<bool>(type: "boolean", nullable: false),
                    is_customized = table.Column<bool>(type: "boolean", nullable: false),
                    customization_notes = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_order_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_order_items_delivery_turns_delivery_turn_id",
                        column: x => x.delivery_turn_id,
                        principalTable: "delivery_turns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_order_items_order_headers_order_header_id",
                        column: x => x.order_header_id,
                        principalTable: "order_headers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_order_items_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_order_items_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_order_items_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_order_items_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_default_quantities_CreatedById",
                table: "default_quantities",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_default_quantities_day_type_id",
                table: "default_quantities",
                column: "day_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_default_quantities_IsActive",
                table: "default_quantities",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_default_quantities_outlet_id_day_type_id_product_id",
                table: "default_quantities",
                columns: new[] { "outlet_id", "day_type_id", "product_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_default_quantities_product_id",
                table: "default_quantities",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_default_quantities_UpdatedById",
                table: "default_quantities",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plan_items_CreatedById",
                table: "delivery_plan_items",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plan_items_delivery_plan_id_product_id_outlet_id",
                table: "delivery_plan_items",
                columns: new[] { "delivery_plan_id", "product_id", "outlet_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plan_items_IsActive",
                table: "delivery_plan_items",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plan_items_outlet_id",
                table: "delivery_plan_items",
                column: "outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plan_items_product_id",
                table: "delivery_plan_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plan_items_UpdatedById",
                table: "delivery_plan_items",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plans_CreatedById",
                table: "delivery_plans",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plans_day_type_id",
                table: "delivery_plans",
                column: "day_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plans_delivery_turn_id",
                table: "delivery_plans",
                column: "delivery_turn_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plans_IsActive",
                table: "delivery_plans",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plans_plan_date",
                table: "delivery_plans",
                column: "plan_date");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plans_plan_no",
                table: "delivery_plans",
                column: "plan_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plans_status",
                table: "delivery_plans",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_plans_UpdatedById",
                table: "delivery_plans",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stock_history_CreatedById",
                table: "freezer_stock_history",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stock_history_freezer_stock_id",
                table: "freezer_stock_history",
                column: "freezer_stock_id");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stock_history_IsActive",
                table: "freezer_stock_history",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stock_history_transaction_date",
                table: "freezer_stock_history",
                column: "transaction_date");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stock_history_UpdatedById",
                table: "freezer_stock_history",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stocks_CreatedById",
                table: "freezer_stocks",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stocks_IsActive",
                table: "freezer_stocks",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stocks_last_updated_by",
                table: "freezer_stocks",
                column: "last_updated_by");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stocks_product_id_production_section_id",
                table: "freezer_stocks",
                columns: new[] { "product_id", "production_section_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stocks_production_section_id",
                table: "freezer_stocks",
                column: "production_section_id");

            migrationBuilder.CreateIndex(
                name: "IX_freezer_stocks_UpdatedById",
                table: "freezer_stocks",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_approved_by",
                table: "immediate_orders",
                column: "approved_by");

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_CreatedById",
                table: "immediate_orders",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_delivery_turn_id",
                table: "immediate_orders",
                column: "delivery_turn_id");

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_IsActive",
                table: "immediate_orders",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_order_date_delivery_turn_id_outlet_id",
                table: "immediate_orders",
                columns: new[] { "order_date", "delivery_turn_id", "outlet_id" });

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_order_no",
                table: "immediate_orders",
                column: "order_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_outlet_id",
                table: "immediate_orders",
                column: "outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_product_id",
                table: "immediate_orders",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_status",
                table: "immediate_orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_immediate_orders_UpdatedById",
                table: "immediate_orders",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_order_headers_CreatedById",
                table: "order_headers",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_order_headers_delivery_plan_id",
                table: "order_headers",
                column: "delivery_plan_id");

            migrationBuilder.CreateIndex(
                name: "IX_order_headers_IsActive",
                table: "order_headers",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_order_headers_order_date",
                table: "order_headers",
                column: "order_date");

            migrationBuilder.CreateIndex(
                name: "IX_order_headers_order_no",
                table: "order_headers",
                column: "order_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_order_headers_status",
                table: "order_headers",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_order_headers_UpdatedById",
                table: "order_headers",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_order_items_CreatedById",
                table: "order_items",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_order_items_delivery_turn_id",
                table: "order_items",
                column: "delivery_turn_id");

            migrationBuilder.CreateIndex(
                name: "IX_order_items_IsActive",
                table: "order_items",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_order_items_order_header_id_product_id_outlet_id_delivery_t~",
                table: "order_items",
                columns: new[] { "order_header_id", "product_id", "outlet_id", "delivery_turn_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_order_items_outlet_id",
                table: "order_items",
                column: "outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_order_items_product_id",
                table: "order_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_order_items_UpdatedById",
                table: "order_items",
                column: "UpdatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "default_quantities");

            migrationBuilder.DropTable(
                name: "delivery_plan_items");

            migrationBuilder.DropTable(
                name: "freezer_stock_history");

            migrationBuilder.DropTable(
                name: "immediate_orders");

            migrationBuilder.DropTable(
                name: "order_items");

            migrationBuilder.DropTable(
                name: "freezer_stocks");

            migrationBuilder.DropTable(
                name: "order_headers");

            migrationBuilder.DropTable(
                name: "delivery_plans");
        }
    }
}
