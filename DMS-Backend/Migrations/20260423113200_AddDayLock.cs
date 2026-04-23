using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDayLock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "day_locks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LockDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LockedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LockedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LockReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_day_locks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_day_locks_users_LockedBy",
                        column: x => x.LockedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_day_locks_IsLocked",
                table: "day_locks",
                column: "IsLocked");

            migrationBuilder.CreateIndex(
                name: "IX_day_locks_LockDate",
                table: "day_locks",
                column: "LockDate",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_day_locks_LockedBy",
                table: "day_locks",
                column: "LockedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "day_locks");
        }
    }
}
