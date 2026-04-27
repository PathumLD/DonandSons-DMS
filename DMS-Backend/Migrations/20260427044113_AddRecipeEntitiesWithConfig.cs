using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipeEntitiesWithConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "recipe_templates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recipe_templates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recipe_templates_categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_recipe_templates_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_recipe_templates_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "recipes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: true),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApplyRoundOff = table.Column<bool>(type: "boolean", nullable: false),
                    RoundOffValue = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    RoundOffNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recipes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recipes_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_recipes_recipe_templates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "recipe_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_recipes_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_recipes_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "recipe_components",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductionSectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsPercentageBased = table.Column<bool>(type: "boolean", nullable: false),
                    BaseRecipeId = table.Column<Guid>(type: "uuid", nullable: true),
                    PercentageOfBase = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recipe_components", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recipe_components_production_sections_ProductionSectionId",
                        column: x => x.ProductionSectionId,
                        principalTable: "production_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_recipe_components_recipes_BaseRecipeId",
                        column: x => x.BaseRecipeId,
                        principalTable: "recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_recipe_components_recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_recipe_components_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_recipe_components_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "recipe_ingredients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipeComponentId = table.Column<Guid>(type: "uuid", nullable: false),
                    IngredientId = table.Column<Guid>(type: "uuid", nullable: false),
                    QtyPerUnit = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    ExtraQtyPerUnit = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    StoresOnly = table.Column<bool>(type: "boolean", nullable: false),
                    ShowExtraInStores = table.Column<bool>(type: "boolean", nullable: false),
                    IsPercentage = table.Column<bool>(type: "boolean", nullable: false),
                    PercentageSourceProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    PercentageValue = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recipe_ingredients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recipe_ingredients_ingredients_IngredientId",
                        column: x => x.IngredientId,
                        principalTable: "ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_recipe_ingredients_recipe_components_RecipeComponentId",
                        column: x => x.RecipeComponentId,
                        principalTable: "recipe_components",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_recipe_ingredients_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_recipe_ingredients_users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_recipe_components_BaseRecipeId",
                table: "recipe_components",
                column: "BaseRecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_components_CreatedById",
                table: "recipe_components",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_components_IsActive",
                table: "recipe_components",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_components_ProductionSectionId",
                table: "recipe_components",
                column: "ProductionSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_components_RecipeId",
                table: "recipe_components",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_components_UpdatedById",
                table: "recipe_components",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_ingredients_CreatedById",
                table: "recipe_ingredients",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_ingredients_IngredientId",
                table: "recipe_ingredients",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_ingredients_IsActive",
                table: "recipe_ingredients",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_ingredients_RecipeComponentId",
                table: "recipe_ingredients",
                column: "RecipeComponentId");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_ingredients_UpdatedById",
                table: "recipe_ingredients",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_templates_CategoryId",
                table: "recipe_templates",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_templates_Code",
                table: "recipe_templates",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_recipe_templates_CreatedById",
                table: "recipe_templates",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_templates_IsActive",
                table: "recipe_templates",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_recipe_templates_UpdatedById",
                table: "recipe_templates",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_recipes_CreatedById",
                table: "recipes",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_recipes_IsActive",
                table: "recipes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_recipes_ProductId",
                table: "recipes",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_recipes_TemplateId",
                table: "recipes",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_recipes_UpdatedById",
                table: "recipes",
                column: "UpdatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "recipe_ingredients");

            migrationBuilder.DropTable(
                name: "recipe_components");

            migrationBuilder.DropTable(
                name: "recipes");

            migrationBuilder.DropTable(
                name: "recipe_templates");
        }
    }
}
