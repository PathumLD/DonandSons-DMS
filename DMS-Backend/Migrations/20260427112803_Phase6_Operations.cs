using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class Phase6_Operations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cancellations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    cancellation_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    cancellation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    delivery_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    delivered_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    approved_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cancellations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_cancellations_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_cancellations_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_cancellations_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_cancellations_users_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "deliveries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    delivery_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    delivery_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    total_items = table.Column<int>(type: "integer", nullable: false),
                    total_value = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    approved_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_deliveries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_deliveries_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_deliveries_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_deliveries_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_deliveries_users_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "delivery_returns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    return_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    return_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    delivery_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    delivered_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    total_items = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    approved_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_delivery_returns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_delivery_returns_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_delivery_returns_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_delivery_returns_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_delivery_returns_users_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "disposals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    disposal_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    disposal_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    delivered_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    total_items = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    approved_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_disposals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_disposals_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_disposals_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_disposals_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_disposals_users_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "label_print_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    display_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    label_count = table.Column<int>(type: "integer", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expiry_days = table.Column<int>(type: "integer", nullable: false),
                    price_override = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    approved_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_label_print_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_label_print_requests_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_label_print_requests_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_label_print_requests_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_label_print_requests_users_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "showroom_open_stock",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    stock_as_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_showroom_open_stock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_showroom_open_stock_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_showroom_open_stock_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_showroom_open_stock_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "stock_bf",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    bf_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    bf_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    approved_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_bf", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_bf_outlets_outlet_id",
                        column: x => x.outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_stock_bf_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_stock_bf_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_stock_bf_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_stock_bf_users_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "transfers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    transfer_no = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    transfer_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    from_outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    to_outlet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    total_items = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    approved_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_transfers_outlets_from_outlet_id",
                        column: x => x.from_outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_transfers_outlets_to_outlet_id",
                        column: x => x.to_outlet_id,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_transfers_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_transfers_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_transfers_users_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "delivery_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    delivery_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    total = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_delivery_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_delivery_items_deliveries_delivery_id",
                        column: x => x.delivery_id,
                        principalTable: "deliveries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_delivery_items_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_delivery_items_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_delivery_items_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "delivery_return_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    delivery_return_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_delivery_return_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_delivery_return_items_delivery_returns_delivery_return_id",
                        column: x => x.delivery_return_id,
                        principalTable: "delivery_returns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_delivery_return_items_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_delivery_return_items_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_delivery_return_items_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "disposal_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    disposal_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_disposal_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_disposal_items_disposals_disposal_id",
                        column: x => x.disposal_id,
                        principalTable: "disposals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_disposal_items_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_disposal_items_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_disposal_items_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "transfer_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    transfer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transfer_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_transfer_items_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_transfer_items_transfers_transfer_id",
                        column: x => x.transfer_id,
                        principalTable: "transfers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_transfer_items_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_transfer_items_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_cancellations_approved_by_id",
                table: "cancellations",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_cancellations_cancellation_date",
                table: "cancellations",
                column: "cancellation_date");

            migrationBuilder.CreateIndex(
                name: "IX_cancellations_cancellation_no",
                table: "cancellations",
                column: "cancellation_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_cancellations_CreatedById",
                table: "cancellations",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_cancellations_outlet_id",
                table: "cancellations",
                column: "outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_cancellations_status",
                table: "cancellations",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_cancellations_UpdatedById",
                table: "cancellations",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_deliveries_approved_by_id",
                table: "deliveries",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_deliveries_CreatedById",
                table: "deliveries",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_deliveries_delivery_date",
                table: "deliveries",
                column: "delivery_date");

            migrationBuilder.CreateIndex(
                name: "IX_deliveries_delivery_no",
                table: "deliveries",
                column: "delivery_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_deliveries_outlet_id",
                table: "deliveries",
                column: "outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_deliveries_status",
                table: "deliveries",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_deliveries_UpdatedById",
                table: "deliveries",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_items_CreatedById",
                table: "delivery_items",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_items_delivery_id",
                table: "delivery_items",
                column: "delivery_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_items_product_id",
                table: "delivery_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_items_UpdatedById",
                table: "delivery_items",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_return_items_CreatedById",
                table: "delivery_return_items",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_return_items_delivery_return_id",
                table: "delivery_return_items",
                column: "delivery_return_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_return_items_product_id",
                table: "delivery_return_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_return_items_UpdatedById",
                table: "delivery_return_items",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_returns_approved_by_id",
                table: "delivery_returns",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_returns_CreatedById",
                table: "delivery_returns",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_returns_outlet_id",
                table: "delivery_returns",
                column: "outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_returns_return_date",
                table: "delivery_returns",
                column: "return_date");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_returns_return_no",
                table: "delivery_returns",
                column: "return_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_delivery_returns_status",
                table: "delivery_returns",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_delivery_returns_UpdatedById",
                table: "delivery_returns",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_disposal_items_CreatedById",
                table: "disposal_items",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_disposal_items_disposal_id",
                table: "disposal_items",
                column: "disposal_id");

            migrationBuilder.CreateIndex(
                name: "IX_disposal_items_product_id",
                table: "disposal_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_disposal_items_UpdatedById",
                table: "disposal_items",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_disposals_approved_by_id",
                table: "disposals",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_disposals_CreatedById",
                table: "disposals",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_disposals_disposal_date",
                table: "disposals",
                column: "disposal_date");

            migrationBuilder.CreateIndex(
                name: "IX_disposals_disposal_no",
                table: "disposals",
                column: "disposal_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_disposals_outlet_id",
                table: "disposals",
                column: "outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_disposals_status",
                table: "disposals",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_disposals_UpdatedById",
                table: "disposals",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_label_print_requests_approved_by_id",
                table: "label_print_requests",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_label_print_requests_CreatedById",
                table: "label_print_requests",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_label_print_requests_date",
                table: "label_print_requests",
                column: "date");

            migrationBuilder.CreateIndex(
                name: "IX_label_print_requests_display_no",
                table: "label_print_requests",
                column: "display_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_label_print_requests_product_id",
                table: "label_print_requests",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_label_print_requests_status",
                table: "label_print_requests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_label_print_requests_UpdatedById",
                table: "label_print_requests",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_showroom_open_stock_CreatedById",
                table: "showroom_open_stock",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_showroom_open_stock_outlet_id",
                table: "showroom_open_stock",
                column: "outlet_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_showroom_open_stock_UpdatedById",
                table: "showroom_open_stock",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_stock_bf_approved_by_id",
                table: "stock_bf",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_bf_bf_no",
                table: "stock_bf",
                column: "bf_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_bf_CreatedById",
                table: "stock_bf",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_stock_bf_outlet_id_bf_date_product_id",
                table: "stock_bf",
                columns: new[] { "outlet_id", "bf_date", "product_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_bf_product_id",
                table: "stock_bf",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_bf_status",
                table: "stock_bf",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_stock_bf_UpdatedById",
                table: "stock_bf",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_items_CreatedById",
                table: "transfer_items",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_items_product_id",
                table: "transfer_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_items_transfer_id",
                table: "transfer_items",
                column: "transfer_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_items_UpdatedById",
                table: "transfer_items",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_approved_by_id",
                table: "transfers",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_CreatedById",
                table: "transfers",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_from_outlet_id",
                table: "transfers",
                column: "from_outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_status",
                table: "transfers",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_to_outlet_id",
                table: "transfers",
                column: "to_outlet_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_transfer_date",
                table: "transfers",
                column: "transfer_date");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_transfer_no",
                table: "transfers",
                column: "transfer_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_transfers_UpdatedById",
                table: "transfers",
                column: "UpdatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cancellations");

            migrationBuilder.DropTable(
                name: "delivery_items");

            migrationBuilder.DropTable(
                name: "delivery_return_items");

            migrationBuilder.DropTable(
                name: "disposal_items");

            migrationBuilder.DropTable(
                name: "label_print_requests");

            migrationBuilder.DropTable(
                name: "showroom_open_stock");

            migrationBuilder.DropTable(
                name: "stock_bf");

            migrationBuilder.DropTable(
                name: "transfer_items");

            migrationBuilder.DropTable(
                name: "deliveries");

            migrationBuilder.DropTable(
                name: "delivery_returns");

            migrationBuilder.DropTable(
                name: "disposals");

            migrationBuilder.DropTable(
                name: "transfers");
        }
    }
}
