using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class FixSuperAdminIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_IsSuperAdmin",
                table: "users");

            migrationBuilder.CreateIndex(
                name: "IX_users_IsSuperAdmin",
                table: "users",
                column: "IsSuperAdmin",
                unique: true,
                filter: "\"IsSuperAdmin\" = true");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_IsSuperAdmin",
                table: "users");

            migrationBuilder.CreateIndex(
                name: "IX_users_IsSuperAdmin",
                table: "users",
                column: "IsSuperAdmin",
                unique: true,
                filter: "is_super_admin = true");
        }
    }
}
