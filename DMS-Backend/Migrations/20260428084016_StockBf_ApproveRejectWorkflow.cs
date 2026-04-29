using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class StockBf_ApproveRejectWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_deliveries_users_CreatedById",
                table: "deliveries");

            migrationBuilder.DropForeignKey(
                name: "FK_deliveries_users_UpdatedById",
                table: "deliveries");

            migrationBuilder.AddColumn<Guid>(
                name: "rejected_by_id",
                table: "stock_bf",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "rejected_date",
                table: "stock_bf",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_bf_rejected_by_id",
                table: "stock_bf",
                column: "rejected_by_id");

            migrationBuilder.Sql("UPDATE stock_bf SET status = 'Approved' WHERE status = 'Active';");

            migrationBuilder.AddForeignKey(
                name: "FK_deliveries_users_CreatedById",
                table: "deliveries",
                column: "CreatedById",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_deliveries_users_UpdatedById",
                table: "deliveries",
                column: "UpdatedById",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_stock_bf_users_rejected_by_id",
                table: "stock_bf",
                column: "rejected_by_id",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_deliveries_users_CreatedById",
                table: "deliveries");

            migrationBuilder.DropForeignKey(
                name: "FK_deliveries_users_UpdatedById",
                table: "deliveries");

            migrationBuilder.DropForeignKey(
                name: "FK_stock_bf_users_rejected_by_id",
                table: "stock_bf");

            migrationBuilder.DropIndex(
                name: "IX_stock_bf_rejected_by_id",
                table: "stock_bf");

            migrationBuilder.DropColumn(
                name: "rejected_by_id",
                table: "stock_bf");

            migrationBuilder.DropColumn(
                name: "rejected_date",
                table: "stock_bf");

            migrationBuilder.AddForeignKey(
                name: "FK_deliveries_users_CreatedById",
                table: "deliveries",
                column: "CreatedById",
                principalTable: "users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_deliveries_users_UpdatedById",
                table: "deliveries",
                column: "UpdatedById",
                principalTable: "users",
                principalColumn: "Id");
        }
    }
}
