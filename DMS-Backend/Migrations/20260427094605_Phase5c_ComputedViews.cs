using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class Phase5c_ComputedViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "production_plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    ComputedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    UseFreezerStock = table.Column<bool>(type: "boolean", nullable: false),
                    TotalProducts = table.Column<int>(type: "integer", nullable: false),
                    TotalQuantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_production_plans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_production_plans_delivery_plans_DeliveryPlanId",
                        column: x => x.DeliveryPlanId,
                        principalTable: "delivery_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reconciliations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReconciliationNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReconciliationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeliveryPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    OutletId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SubmittedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reconciliations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reconciliations_delivery_plans_DeliveryPlanId",
                        column: x => x.DeliveryPlanId,
                        principalTable: "delivery_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reconciliations_outlets_OutletId",
                        column: x => x.OutletId,
                        principalTable: "outlets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "production_plan_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductionPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductionSectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    RegularFullQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    RegularMiniQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    CustomizedFullQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    CustomizedMiniQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    FreezerStock = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    ProduceQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    IsExcluded = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_production_plan_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_production_plan_items_production_plans_ProductionPlanId",
                        column: x => x.ProductionPlanId,
                        principalTable: "production_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_production_plan_items_production_sections_ProductionSection~",
                        column: x => x.ProductionSectionId,
                        principalTable: "production_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_production_plan_items_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "stores_issue_notes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IssueNoteNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProductionPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductionSectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IssuedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ReceivedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stores_issue_notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stores_issue_notes_production_plans_ProductionPlanId",
                        column: x => x.ProductionPlanId,
                        principalTable: "production_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_stores_issue_notes_production_sections_ProductionSectionId",
                        column: x => x.ProductionSectionId,
                        principalTable: "production_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reconciliation_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReconciliationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpectedQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    ActualQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    VarianceQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    VarianceType = table.Column<string>(type: "text", nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reconciliation_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reconciliation_items_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reconciliation_items_reconciliations_ReconciliationId",
                        column: x => x.ReconciliationId,
                        principalTable: "reconciliations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "production_adjustments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductionPlanItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    AdjustmentQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AdjustedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    AdjustedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_production_adjustments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_production_adjustments_production_plan_items_ProductionPlan~",
                        column: x => x.ProductionPlanItemId,
                        principalTable: "production_plan_items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stores_issue_note_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StoresIssueNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    IngredientId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductionQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    ExtraQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    TotalQty = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stores_issue_note_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stores_issue_note_items_ingredients_IngredientId",
                        column: x => x.IngredientId,
                        principalTable: "ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_stores_issue_note_items_stores_issue_notes_StoresIssueNoteId",
                        column: x => x.StoresIssueNoteId,
                        principalTable: "stores_issue_notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_production_adjustments_AdjustedAt",
                table: "production_adjustments",
                column: "AdjustedAt");

            migrationBuilder.CreateIndex(
                name: "IX_production_adjustments_ProductionPlanItemId",
                table: "production_adjustments",
                column: "ProductionPlanItemId");

            migrationBuilder.CreateIndex(
                name: "IX_production_plan_items_ProductId",
                table: "production_plan_items",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_production_plan_items_ProductionPlanId_ProductionSectionId_~",
                table: "production_plan_items",
                columns: new[] { "ProductionPlanId", "ProductionSectionId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_production_plan_items_ProductionSectionId",
                table: "production_plan_items",
                column: "ProductionSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_production_plans_ComputedDate",
                table: "production_plans",
                column: "ComputedDate");

            migrationBuilder.CreateIndex(
                name: "IX_production_plans_DeliveryPlanId",
                table: "production_plans",
                column: "DeliveryPlanId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_production_plans_Status",
                table: "production_plans",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_reconciliation_items_ProductId",
                table: "reconciliation_items",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_reconciliation_items_ReconciliationId_ProductId",
                table: "reconciliation_items",
                columns: new[] { "ReconciliationId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reconciliation_items_VarianceType",
                table: "reconciliation_items",
                column: "VarianceType");

            migrationBuilder.CreateIndex(
                name: "IX_reconciliations_DeliveryPlanId_OutletId",
                table: "reconciliations",
                columns: new[] { "DeliveryPlanId", "OutletId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reconciliations_OutletId",
                table: "reconciliations",
                column: "OutletId");

            migrationBuilder.CreateIndex(
                name: "IX_reconciliations_ReconciliationDate",
                table: "reconciliations",
                column: "ReconciliationDate");

            migrationBuilder.CreateIndex(
                name: "IX_reconciliations_ReconciliationNo",
                table: "reconciliations",
                column: "ReconciliationNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reconciliations_Status",
                table: "reconciliations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_stores_issue_note_items_IngredientId",
                table: "stores_issue_note_items",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_stores_issue_note_items_StoresIssueNoteId_IngredientId",
                table: "stores_issue_note_items",
                columns: new[] { "StoresIssueNoteId", "IngredientId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stores_issue_notes_IssueDate",
                table: "stores_issue_notes",
                column: "IssueDate");

            migrationBuilder.CreateIndex(
                name: "IX_stores_issue_notes_IssueNoteNo",
                table: "stores_issue_notes",
                column: "IssueNoteNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stores_issue_notes_ProductionPlanId_ProductionSectionId",
                table: "stores_issue_notes",
                columns: new[] { "ProductionPlanId", "ProductionSectionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stores_issue_notes_ProductionSectionId",
                table: "stores_issue_notes",
                column: "ProductionSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_stores_issue_notes_Status",
                table: "stores_issue_notes",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "production_adjustments");

            migrationBuilder.DropTable(
                name: "reconciliation_items");

            migrationBuilder.DropTable(
                name: "stores_issue_note_items");

            migrationBuilder.DropTable(
                name: "production_plan_items");

            migrationBuilder.DropTable(
                name: "reconciliations");

            migrationBuilder.DropTable(
                name: "stores_issue_notes");

            migrationBuilder.DropTable(
                name: "production_plans");
        }
    }
}
