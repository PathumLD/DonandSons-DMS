using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Data;

public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemLog> SystemLogs => Set<SystemLog>();
    public DbSet<AuthenticationLog> AuthenticationLogs => Set<AuthenticationLog>();
    public DbSet<ApiRequestLog> ApiRequestLogs => Set<ApiRequestLog>();
    public DbSet<DayLock> DayLocks => Set<DayLock>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    // Inventory entities
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<UnitOfMeasure> UnitOfMeasures => Set<UnitOfMeasure>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();

    // Phase 4: Admin Master Data entities
    public DbSet<Outlet> Outlets => Set<Outlet>();
    public DbSet<OutletEmployee> OutletEmployees => Set<OutletEmployee>();
    public DbSet<DeliveryTurn> DeliveryTurns => Set<DeliveryTurn>();
    public DbSet<DayType> DayTypes => Set<DayType>();
    public DbSet<ProductionSection> ProductionSections => Set<ProductionSection>();
    public DbSet<SectionConsumable> SectionConsumables => Set<SectionConsumable>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<ApprovalQueue> ApprovalQueues => Set<ApprovalQueue>();

    // Phase 4: Label, Pricing, Grid, Workflow, Security entities
    public DbSet<LabelTemplate> LabelTemplates => Set<LabelTemplate>();
    public DbSet<LabelSetting> LabelSettings => Set<LabelSetting>();
    public DbSet<RoundingRule> RoundingRules => Set<RoundingRule>();
    public DbSet<PriceList> PriceLists => Set<PriceList>();
    public DbSet<PriceListItem> PriceListItems => Set<PriceListItem>();
    public DbSet<GridConfiguration> GridConfigurations => Set<GridConfiguration>();
    public DbSet<WorkflowConfig> WorkflowConfigs => Set<WorkflowConfig>();
    public DbSet<SecurityPolicy> SecurityPolicies => Set<SecurityPolicy>();

    // Phase 5a: Recipe entities
    public DbSet<RecipeTemplate> RecipeTemplates => Set<RecipeTemplate>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<RecipeComponent> RecipeComponents => Set<RecipeComponent>();
    public DbSet<RecipeIngredient> RecipeIngredients => Set<RecipeIngredient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply global query filter for soft delete on all BaseEntity types
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(BaseEntity.IsActive));
                var filter = Expression.Lambda(
                    Expression.Equal(property, Expression.Constant(true)),
                    parameter);
                
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
            }
        }

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsSuperAdmin).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.IsSuperAdmin)
                .IsUnique()
                .HasFilter("\"IsSuperAdmin\" = true");
        });

        // Role entity configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.IsSystemRole).HasDefaultValue(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.IsActive);

            entity.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Permission entity configuration
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Code).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Module).HasMaxLength(50).IsRequired();
            entity.Property(e => e.IsSystemPermission).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.Module);
        });

        // UserRole entity configuration
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AssignedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AssignedBy)
                .WithMany()
                .HasForeignKey(e => e.AssignedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();
        });

        // RolePermission entity configuration
        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("role_permissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GrantedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(e => e.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.RoleId, e.PermissionId }).IsUnique();
        });

        // AuditLog entity configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.EventType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.EntityType).HasMaxLength(100);
            entity.Property(e => e.EntityId).HasMaxLength(255);
            entity.Property(e => e.Action).HasMaxLength(100);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.RequestPath).HasMaxLength(500);
            entity.Property(e => e.RequestMethod).HasMaxLength(10);
            entity.Property(e => e.Timestamp).HasDefaultValueSql("NOW()");
            entity.Property(e => e.OldValues).HasColumnType("jsonb");
            entity.Property(e => e.NewValues).HasColumnType("jsonb");

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.EventType);
            entity.HasIndex(e => e.EntityType);
            entity.HasIndex(e => e.EntityId);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.Action);
        });

        // SystemLog entity configuration
        modelBuilder.Entity<SystemLog>(entity =>
        {
            entity.ToTable("system_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LogLevel).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Message).IsRequired();
            entity.Property(e => e.Timestamp).HasDefaultValueSql("NOW()");
            entity.Property(e => e.AdditionalData).HasColumnType("jsonb");

            entity.HasIndex(e => e.LogLevel);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Timestamp);
        });

        // AuthenticationLog entity configuration
        modelBuilder.Entity<AuthenticationLog>(entity =>
        {
            entity.ToTable("authentication_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.EventType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.FailureReason).HasMaxLength(200);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.SessionId).HasMaxLength(100);
            entity.Property(e => e.Timestamp).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.EventType);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.IpAddress);
        });

        // ApiRequestLog entity configuration
        modelBuilder.Entity<ApiRequestLog>(entity =>
        {
            entity.ToTable("api_request_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.RequestId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Endpoint).HasMaxLength(500).IsRequired();
            entity.Property(e => e.HttpMethod).HasMaxLength(10).IsRequired();
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.IsSuccessful).HasDefaultValue(true);
            entity.Property(e => e.Timestamp).HasDefaultValueSql("NOW()");
            entity.Property(e => e.RequestBody).HasColumnType("jsonb");

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Endpoint);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.ResponseStatusCode);
            entity.HasIndex(e => e.RequestId).IsUnique();
        });

        // DayLock entity configuration
        modelBuilder.Entity<DayLock>(entity =>
        {
            entity.ToTable("day_locks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LockDate).IsRequired();
            entity.Property(e => e.IsLocked).HasDefaultValue(false);
            entity.Property(e => e.LockReason).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.LockedByUser)
                .WithMany()
                .HasForeignKey(e => e.LockedBy)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.LockDate).IsUnique();
            entity.HasIndex(e => e.IsLocked);
        });

        // PasswordResetToken entity configuration
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.ToTable("password_reset_tokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).HasMaxLength(500).IsRequired();
            entity.Property(e => e.IsUsed).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.ExpiresAt, e.IsUsed });
        });

        // Category entity configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        // UnitOfMeasure entity configuration
        modelBuilder.Entity<UnitOfMeasure>(entity =>
        {
            entity.ToTable("unit_of_measures");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).HasMaxLength(10).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(100).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        // Product entity configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.ProductType).HasMaxLength(50);
            entity.Property(e => e.ProductionSection).HasMaxLength(100);
            entity.Property(e => e.DefaultDeliveryTurns).HasColumnType("jsonb");
            entity.Property(e => e.AvailableInTurns).HasColumnType("jsonb");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.UnitOfMeasure)
                .WithMany(u => u.Products)
                .HasForeignKey(e => e.UnitOfMeasureId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.SortOrder);
        });

        // Ingredient entity configuration
        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.ToTable("ingredients");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IngredientType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.ExtraPercentage).HasColumnType("decimal(18,2)").HasDefaultValue(0);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.UnitOfMeasure)
                .WithMany(u => u.Ingredients)
                .HasForeignKey(e => e.UnitOfMeasureId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.IngredientType);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.SortOrder);
        });

        // RecipeTemplate entity configuration
        modelBuilder.Entity<RecipeTemplate>(entity =>
        {
            entity.ToTable("recipe_templates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        // Recipe entity configuration
        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.ToTable("recipes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Template)
                .WithMany()
                .HasForeignKey(e => e.TemplateId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.ProductId);
            entity.HasIndex(e => e.IsActive);
        });

        // RecipeComponent entity configuration
        modelBuilder.Entity<RecipeComponent>(entity =>
        {
            entity.ToTable("recipe_components");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ComponentName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Recipe)
                .WithMany(r => r.RecipeComponents)
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ProductionSection)
                .WithMany()
                .HasForeignKey(e => e.ProductionSectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.BaseRecipe)
                .WithMany()
                .HasForeignKey(e => e.BaseRecipeId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.RecipeId);
            entity.HasIndex(e => e.ProductionSectionId);
            entity.HasIndex(e => e.IsActive);
        });

        // RecipeIngredient entity configuration
        modelBuilder.Entity<RecipeIngredient>(entity =>
        {
            entity.ToTable("recipe_ingredients");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QtyPerUnit).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.ExtraQtyPerUnit).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.PercentageValue).HasColumnType("decimal(18,4)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.RecipeComponent)
                .WithMany(rc => rc.RecipeIngredients)
                .HasForeignKey(e => e.RecipeComponentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.RecipeComponentId);
            entity.HasIndex(e => e.IngredientId);
            entity.HasIndex(e => e.IsActive);
        });
    }
}
