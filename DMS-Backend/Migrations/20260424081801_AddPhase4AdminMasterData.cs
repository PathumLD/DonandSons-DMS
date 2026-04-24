using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPhase4AdminMasterData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "day_types",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    color_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    icon_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    apply_multiplier = table.Column<bool>(type: "boolean", nullable: false),
                    quantity_multiplier = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    is_system_type = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_day_types", x => x.Id);
                    table.ForeignKey(
                        name: "FK_day_types_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_day_types_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "delivery_turns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    turn_number = table.Column<int>(type: "integer", nullable: false),
                    delivery_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    order_cutoff_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    production_start_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    crosses_midnight = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    allow_immediate_orders = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_delivery_turns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_delivery_turns_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_delivery_turns_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            // Note: Ingredients table already exists from previous migration
            // Skipping creation to avoid conflict

            migrationBuilder.CreateTable(
                name: "production_sections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    color_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    icon_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    supervisor_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    requires_sin = table.Column<bool>(type: "boolean", nullable: false),
                    has_production_planner = table.Column<bool>(type: "boolean", nullable: false),
                    default_production_start_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_production_sections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_production_sections_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_production_sections_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "outlets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    contact_person = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    location_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    has_variants = table.Column<bool>(type: "boolean", nullable: false),
                    is_delivery_point = table.Column<bool>(type: "boolean", nullable: false),
                    default_delivery_turn_id = table.Column<Guid>(type: "uuid", nullable: true),
                    latitude = table.Column<decimal>(type: "numeric", nullable: true),
                    longitude = table.Column<decimal>(type: "numeric", nullable: true),
                    operating_hours = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_outlets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_outlets_delivery_turns_default_delivery_turn_id",
                        column: x => x.default_delivery_turn_id,
                        principalTable: "delivery_turns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_outlets_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_outlets_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "section_consumables",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    production_section_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    default_quantity = table.Column<decimal>(type: "numeric(18,3)", nullable: false),
                    is_calculated = table.Column<bool>(type: "boolean", nullable: false),
                    calculation_formula = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_section_consumables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_section_consumables_ingredients_ingredient_id",
                        column: x => x.ingredient_id,
                        principalTable: "ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_section_consumables_production_sections_production_section_~",
                        column: x => x.production_section_id,
                        principalTable: "production_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_section_consumables_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_section_consumables_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "outlet_employees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    position = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    hire_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    termination_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_manager = table.Column<bool>(type: "boolean", nullable: false),
                    can_receive_deliveries = table.Column<bool>(type: "boolean", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_outlet_employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_outlet_employees_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_outlet_employees_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_outlet_employees_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_day_types_CreatedById",
                table: "day_types",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_day_types_UpdatedById",
                table: "day_types",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_turns_CreatedById",
                table: "delivery_turns",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_turns_UpdatedById",
                table: "delivery_turns",
                column: "UpdatedById");

            // Note: Ingredients indexes already exist from previous migration
            // Skipping index creation to avoid conflicts

            migrationBuilder.CreateIndex(
                name: "IX_outlet_employees_CreatedById",
                table: "outlet_employees",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_outlet_employees_outlet_id",
                table: "outlet_employees",
                column: "outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_outlet_employees_UpdatedById",
                table: "outlet_employees",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_outlets_CreatedById",
                table: "outlets",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_outlets_default_delivery_turn_id",
                table: "outlets",
                column: "default_delivery_turn_id");

            migrationBuilder.CreateIndex(
                name: "IX_outlets_UpdatedById",
                table: "outlets",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_production_sections_CreatedById",
                table: "production_sections",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_production_sections_UpdatedById",
                table: "production_sections",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_section_consumables_CreatedById",
                table: "section_consumables",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_section_consumables_ingredient_id",
                table: "section_consumables",
                column: "ingredient_id");

            migrationBuilder.CreateIndex(
                name: "IX_section_consumables_production_section_id",
                table: "section_consumables",
                column: "production_section_id");

            migrationBuilder.CreateIndex(
                name: "IX_section_consumables_UpdatedById",
                table: "section_consumables",
                column: "UpdatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "day_types");

            migrationBuilder.DropTable(
                name: "outlet_employees");

            migrationBuilder.DropTable(
                name: "section_consumables");

            migrationBuilder.DropTable(
                name: "outlets");

            // Note: Ingredients table managed by separate migration
            // Skipping drop to preserve data

            migrationBuilder.DropTable(
                name: "production_sections");

            migrationBuilder.DropTable(
                name: "delivery_turns");
        }
    }
}
