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

    // Phase 5b: DMS Planning entities
    public DbSet<DefaultQuantity> DefaultQuantities => Set<DefaultQuantity>();
    public DbSet<DeliveryPlan> DeliveryPlans => Set<DeliveryPlan>();
    public DbSet<DeliveryPlanItem> DeliveryPlanItems => Set<DeliveryPlanItem>();
    public DbSet<OrderHeader> OrderHeaders => Set<OrderHeader>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<ImmediateOrder> ImmediateOrders => Set<ImmediateOrder>();
    public DbSet<FreezerStock> FreezerStocks => Set<FreezerStock>();
    public DbSet<FreezerStockHistory> FreezerStockHistory => Set<FreezerStockHistory>();

    // Phase 5c: DMS Computed Views entities
    public DbSet<ProductionPlan> ProductionPlans => Set<ProductionPlan>();
    public DbSet<ProductionPlanItem> ProductionPlanItems => Set<ProductionPlanItem>();
    public DbSet<ProductionAdjustment> ProductionAdjustments => Set<ProductionAdjustment>();
    public DbSet<StoresIssueNote> StoresIssueNotes => Set<StoresIssueNote>();
    public DbSet<StoresIssueNoteItem> StoresIssueNoteItems => Set<StoresIssueNoteItem>();
    public DbSet<Reconciliation> Reconciliations => Set<Reconciliation>();
    public DbSet<ReconciliationItem> ReconciliationItems => Set<ReconciliationItem>();

    // Phase 6: Operations entities
    public DbSet<Delivery> Deliveries => Set<Delivery>();
    public DbSet<DeliveryItem> DeliveryItems => Set<DeliveryItem>();
    public DbSet<Disposal> Disposals => Set<Disposal>();
    public DbSet<DisposalItem> DisposalItems => Set<DisposalItem>();
    public DbSet<Transfer> Transfers => Set<Transfer>();
    public DbSet<TransferItem> TransferItems => Set<TransferItem>();
    public DbSet<Cancellation> Cancellations => Set<Cancellation>();
    public DbSet<DeliveryReturn> DeliveryReturns => Set<DeliveryReturn>();
    public DbSet<DeliveryReturnItem> DeliveryReturnItems => Set<DeliveryReturnItem>();
    public DbSet<StockBF> StockBFs => Set<StockBF>();
    public DbSet<ShowroomOpenStock> ShowroomOpenStocks => Set<ShowroomOpenStock>();
    public DbSet<LabelPrintRequest> LabelPrintRequests => Set<LabelPrintRequest>();
    public DbSet<ShowroomLabelRequest> ShowroomLabelRequests => Set<ShowroomLabelRequest>();

    // Phase 7: Production & Stock entities
    public DbSet<Shift> Shifts => Set<Shift>();
    public DbSet<DailyProduction> DailyProductions => Set<DailyProduction>();
    public DbSet<ProductionCancel> ProductionCancels => Set<ProductionCancel>();
    public DbSet<StockAdjustment> StockAdjustments => Set<StockAdjustment>();
    public DbSet<DailyProductionPlan> DailyProductionPlans => Set<DailyProductionPlan>();

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Auto-generate document numbers for Phase 6 entities
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added)
            .ToList();

        foreach (var entry in entries)
        {
            switch (entry.Entity)
            {
                case Delivery delivery when string.IsNullOrEmpty(delivery.DeliveryNo):
                    delivery.DeliveryNo = await GenerateDeliveryNoAsync(cancellationToken);
                    break;

                case Disposal disposal when string.IsNullOrEmpty(disposal.DisposalNo):
                    disposal.DisposalNo = await GenerateDisposalNoAsync(cancellationToken);
                    break;

                case Transfer transfer when string.IsNullOrEmpty(transfer.TransferNo):
                    transfer.TransferNo = await GenerateTransferNoAsync(cancellationToken);
                    break;

                case Cancellation cancellation when string.IsNullOrEmpty(cancellation.CancellationNo):
                    cancellation.CancellationNo = await GenerateCancellationNoAsync(cancellationToken);
                    break;

                case DeliveryReturn deliveryReturn when string.IsNullOrEmpty(deliveryReturn.ReturnNo):
                    deliveryReturn.ReturnNo = await GenerateDeliveryReturnNoAsync(cancellationToken);
                    break;

                case StockBF stockBF when string.IsNullOrEmpty(stockBF.BFNo):
                    stockBF.BFNo = await GenerateStockBFNoAsync(cancellationToken);
                    break;

                case LabelPrintRequest labelPrintRequest when string.IsNullOrEmpty(labelPrintRequest.DisplayNo):
                    labelPrintRequest.DisplayNo = await GenerateLabelPrintRequestNoAsync(cancellationToken);
                    break;

                case DailyProduction dailyProduction when string.IsNullOrEmpty(dailyProduction.ProductionNo):
                    dailyProduction.ProductionNo = await GenerateDailyProductionNoAsync(cancellationToken);
                    break;

                case ProductionCancel productionCancel when string.IsNullOrEmpty(productionCancel.CancelNo):
                    productionCancel.CancelNo = await GenerateProductionCancelNoAsync(cancellationToken);
                    break;

                case StockAdjustment stockAdjustment when string.IsNullOrEmpty(stockAdjustment.AdjustmentNo):
                    stockAdjustment.AdjustmentNo = await GenerateStockAdjustmentNoAsync(cancellationToken);
                    break;

                case DailyProductionPlan dailyProductionPlan when string.IsNullOrEmpty(dailyProductionPlan.PlanNo):
                    dailyProductionPlan.PlanNo = await GenerateDailyProductionPlanNoAsync(cancellationToken);
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }

    private async Task<string> GenerateDeliveryNoAsync(CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"DN-{year}-";
        
        var lastDelivery = await Deliveries
            .Where(d => d.DeliveryNo.StartsWith(prefix))
            .OrderByDescending(d => d.DeliveryNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastDelivery != null && int.TryParse(lastDelivery.DeliveryNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D6}";
        }

        return $"{prefix}000001";
    }

    private async Task<string> GenerateDisposalNoAsync(CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"DS-{year}-";
        
        var lastDisposal = await Disposals
            .Where(d => d.DisposalNo.StartsWith(prefix))
            .OrderByDescending(d => d.DisposalNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastDisposal != null && int.TryParse(lastDisposal.DisposalNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D6}";
        }

        return $"{prefix}000001";
    }

    private async Task<string> GenerateTransferNoAsync(CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"TR-{year}-";
        
        var lastTransfer = await Transfers
            .Where(t => t.TransferNo.StartsWith(prefix))
            .OrderByDescending(t => t.TransferNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastTransfer != null && int.TryParse(lastTransfer.TransferNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D6}";
        }

        return $"{prefix}000001";
    }

    private async Task<string> GenerateCancellationNoAsync(CancellationToken cancellationToken)
    {
        var prefix = "DCN";
        
        var lastCancellation = await Cancellations
            .Where(c => c.CancellationNo.StartsWith(prefix))
            .OrderByDescending(c => c.CancellationNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastCancellation != null && int.TryParse(lastCancellation.CancellationNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D8}";
        }

        return $"{prefix}00000001";
    }

    private async Task<string> GenerateDeliveryReturnNoAsync(CancellationToken cancellationToken)
    {
        var prefix = "RET";
        
        var lastReturn = await DeliveryReturns
            .Where(r => r.ReturnNo.StartsWith(prefix))
            .OrderByDescending(r => r.ReturnNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastReturn != null && int.TryParse(lastReturn.ReturnNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D8}";
        }

        return $"{prefix}00000001";
    }

    private async Task<string> GenerateStockBFNoAsync(CancellationToken cancellationToken)
    {
        var prefix = "SBF";
        
        var lastBF = await StockBFs
            .Where(s => s.BFNo.StartsWith(prefix))
            .OrderByDescending(s => s.BFNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastBF != null && int.TryParse(lastBF.BFNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D8}";
        }

        return $"{prefix}00000001";
    }

    private async Task<string> GenerateLabelPrintRequestNoAsync(CancellationToken cancellationToken)
    {
        var prefix = "LBL";
        
        var lastLabel = await LabelPrintRequests
            .Where(l => l.DisplayNo.StartsWith(prefix))
            .OrderByDescending(l => l.DisplayNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastLabel != null && int.TryParse(lastLabel.DisplayNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D8}";
        }

        return $"{prefix}00000001";
    }

    private async Task<string> GenerateDailyProductionNoAsync(CancellationToken cancellationToken)
    {
        var prefix = "PRO";
        
        var lastProduction = await DailyProductions
            .Where(p => p.ProductionNo.StartsWith(prefix))
            .OrderByDescending(p => p.ProductionNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastProduction != null && int.TryParse(lastProduction.ProductionNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D7}";
        }

        return $"{prefix}0000001";
    }

    private async Task<string> GenerateProductionCancelNoAsync(CancellationToken cancellationToken)
    {
        var prefix = "PCC";
        
        var lastCancel = await ProductionCancels
            .Where(p => p.CancelNo.StartsWith(prefix))
            .OrderByDescending(p => p.CancelNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastCancel != null && int.TryParse(lastCancel.CancelNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D7}";
        }

        return $"{prefix}0000001";
    }

    private async Task<string> GenerateStockAdjustmentNoAsync(CancellationToken cancellationToken)
    {
        var prefix = "PSA";
        
        var lastAdjustment = await StockAdjustments
            .Where(s => s.AdjustmentNo.StartsWith(prefix))
            .OrderByDescending(s => s.AdjustmentNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastAdjustment != null && int.TryParse(lastAdjustment.AdjustmentNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D7}";
        }

        return $"{prefix}0000001";
    }

    private async Task<string> GenerateDailyProductionPlanNoAsync(CancellationToken cancellationToken)
    {
        var prefix = "PRJ";
        
        var lastPlan = await DailyProductionPlans
            .Where(p => p.PlanNo.StartsWith(prefix))
            .OrderByDescending(p => p.PlanNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastPlan != null && int.TryParse(lastPlan.PlanNo.Substring(prefix.Length), out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D7}";
        }

        return $"{prefix}0000001";
    }

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
            entity.Property(e => e.DisplayOrder).HasColumnName("DisplayOrder").IsRequired(false).HasDefaultValue(0);
            entity.Property(e => e.IsSystemPermission).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.DisplayOrder);
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

        // DefaultQuantity entity configuration
        modelBuilder.Entity<DefaultQuantity>(entity =>
        {
            entity.ToTable("default_quantities");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullQuantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.MiniQuantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DayType)
                .WithMany()
                .HasForeignKey(e => e.DayTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.OutletId, e.DayTypeId, e.ProductId }).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        // DeliveryPlan entity configuration
        modelBuilder.Entity<DeliveryPlan>(entity =>
        {
            entity.ToTable("delivery_plans");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlanNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
            entity.Property(e => e.ExcludedOutlets).HasColumnType("jsonb");
            entity.Property(e => e.ExcludedProducts).HasColumnType("jsonb");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.DeliveryTurn)
                .WithMany()
                .HasForeignKey(e => e.DeliveryTurnId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DayType)
                .WithMany()
                .HasForeignKey(e => e.DayTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.PlanNo).IsUnique();
            entity.HasIndex(e => e.PlanDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IsActive);
        });

        // DeliveryPlanItem entity configuration
        modelBuilder.Entity<DeliveryPlanItem>(entity =>
        {
            entity.ToTable("delivery_plan_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullQuantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.MiniQuantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.DeliveryPlan)
                .WithMany(dp => dp.DeliveryPlanItems)
                .HasForeignKey(e => e.DeliveryPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.DeliveryPlanId, e.ProductId, e.OutletId }).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        // OrderHeader entity configuration
        modelBuilder.Entity<OrderHeader>(entity =>
        {
            entity.ToTable("order_headers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.DeliveryPlan)
                .WithMany()
                .HasForeignKey(e => e.DeliveryPlanId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.OrderNo).IsUnique();
            entity.HasIndex(e => e.OrderDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IsActive);
        });

        // OrderItem entity configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("order_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullQuantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.MiniQuantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.OrderHeader)
                .WithMany(oh => oh.OrderItems)
                .HasForeignKey(e => e.OrderHeaderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DeliveryTurn)
                .WithMany()
                .HasForeignKey(e => e.DeliveryTurnId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.OrderHeaderId, e.ProductId, e.OutletId, e.DeliveryTurnId }).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        // ImmediateOrder entity configuration
        modelBuilder.Entity<ImmediateOrder>(entity =>
        {
            entity.ToTable("immediate_orders");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.RequestedBy).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
            entity.Property(e => e.FullQuantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.MiniQuantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.DeliveryTurn)
                .WithMany()
                .HasForeignKey(e => e.DeliveryTurnId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedByUser)
                .WithMany()
                .HasForeignKey(e => e.ApprovedBy)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.OrderNo).IsUnique();
            entity.HasIndex(e => new { e.OrderDate, e.DeliveryTurnId, e.OutletId });
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IsActive);
        });

        // FreezerStock entity configuration
        modelBuilder.Entity<FreezerStock>(entity =>
        {
            entity.ToTable("freezer_stocks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CurrentStock).HasColumnType("decimal(18,4)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProductionSection)
                .WithMany()
                .HasForeignKey(e => e.ProductionSectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.LastUpdatedByUser)
                .WithMany()
                .HasForeignKey(e => e.LastUpdatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.ProductId, e.ProductionSectionId }).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        // FreezerStockHistory entity configuration
        modelBuilder.Entity<FreezerStockHistory>(entity =>
        {
            entity.ToTable("freezer_stock_history");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TransactionType).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.PreviousStock).HasColumnType("decimal(18,4)");
            entity.Property(e => e.NewStock).HasColumnType("decimal(18,4)");
            entity.Property(e => e.ReferenceNo).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.FreezerStock)
                .WithMany(fs => fs.StockHistory)
                .HasForeignKey(e => e.FreezerStockId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.FreezerStockId);
            entity.HasIndex(e => e.TransactionDate);
            entity.HasIndex(e => e.IsActive);
        });

        // ProductionPlan entity configuration
        modelBuilder.Entity<ProductionPlan>(entity =>
        {
            entity.ToTable("production_plans");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ComputedDate).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.TotalQuantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.DeliveryPlan)
                .WithMany()
                .HasForeignKey(e => e.DeliveryPlanId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.DeliveryPlanId).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ComputedDate);
        });

        // ProductionPlanItem entity configuration
        modelBuilder.Entity<ProductionPlanItem>(entity =>
        {
            entity.ToTable("production_plan_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RegularFullQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.RegularMiniQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.CustomizedFullQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.CustomizedMiniQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.FreezerStock).HasColumnType("decimal(18,4)");
            entity.Property(e => e.ProduceQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.ProductionPlan)
                .WithMany(pp => pp.ProductionPlanItems)
                .HasForeignKey(e => e.ProductionPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ProductionSection)
                .WithMany()
                .HasForeignKey(e => e.ProductionSectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.ProductionPlanId, e.ProductionSectionId, e.ProductId }).IsUnique();
        });

        // ProductionAdjustment entity configuration
        modelBuilder.Entity<ProductionAdjustment>(entity =>
        {
            entity.ToTable("production_adjustments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AdjustmentQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.AdjustedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.ProductionPlanItem)
                .WithMany(ppi => ppi.ProductionAdjustments)
                .HasForeignKey(e => e.ProductionPlanItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ProductionPlanItemId);
            entity.HasIndex(e => e.AdjustedAt);
        });

        // StoresIssueNote entity configuration
        modelBuilder.Entity<StoresIssueNote>(entity =>
        {
            entity.ToTable("stores_issue_notes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.IssueNoteNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.IssueDate).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.ProductionPlan)
                .WithMany()
                .HasForeignKey(e => e.ProductionPlanId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProductionSection)
                .WithMany()
                .HasForeignKey(e => e.ProductionSectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.IssueNoteNo).IsUnique();
            entity.HasIndex(e => new { e.ProductionPlanId, e.ProductionSectionId }).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IssueDate);
        });

        // StoresIssueNoteItem entity configuration
        modelBuilder.Entity<StoresIssueNoteItem>(entity =>
        {
            entity.ToTable("stores_issue_note_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProductionQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.ExtraQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.TotalQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.StoresIssueNote)
                .WithMany(sin => sin.StoresIssueNoteItems)
                .HasForeignKey(e => e.StoresIssueNoteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.StoresIssueNoteId, e.IngredientId }).IsUnique();
        });

        // Reconciliation entity configuration
        modelBuilder.Entity<Reconciliation>(entity =>
        {
            entity.ToTable("reconciliations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReconciliationNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ReconciliationDate).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.DeliveryPlan)
                .WithMany()
                .HasForeignKey(e => e.DeliveryPlanId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.ReconciliationNo).IsUnique();
            entity.HasIndex(e => new { e.DeliveryPlanId, e.OutletId }).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ReconciliationDate);
        });

        // ReconciliationItem entity configuration
        modelBuilder.Entity<ReconciliationItem>(entity =>
        {
            entity.ToTable("reconciliation_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExpectedQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.ActualQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.VarianceQty).HasColumnType("decimal(18,4)");
            entity.Property(e => e.VarianceType).HasConversion<string>().IsRequired();
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Reconciliation)
                .WithMany(r => r.ReconciliationItems)
                .HasForeignKey(e => e.ReconciliationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.ReconciliationId, e.ProductId }).IsUnique();
            entity.HasIndex(e => e.VarianceType);
        });

        // Phase 6: Operations entities configuration

        // Delivery entity configuration
        modelBuilder.Entity<Delivery>(entity =>
        {
            entity.ToTable("deliveries");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DeliveryNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.DeliveryDate).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.TotalValue).HasColumnType("decimal(18,4)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.UpdatedBy)
                .WithMany()
                .HasForeignKey(e => e.UpdatedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.DeliveryNo).IsUnique();
            entity.HasIndex(e => e.DeliveryDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.OutletId);
        });

        // DeliveryItem entity configuration
        modelBuilder.Entity<DeliveryItem>(entity =>
        {
            entity.ToTable("delivery_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.Total).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Delivery)
                .WithMany(d => d.Items)
                .HasForeignKey(e => e.DeliveryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.DeliveryId);
            entity.HasIndex(e => e.ProductId);
        });

        // Disposal entity configuration
        modelBuilder.Entity<Disposal>(entity =>
        {
            entity.ToTable("disposals");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DisposalNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.DisposalDate).IsRequired();
            entity.Property(e => e.DeliveredDate).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.DisposalNo).IsUnique();
            entity.HasIndex(e => e.DisposalDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.OutletId);
        });

        // DisposalItem entity configuration
        modelBuilder.Entity<DisposalItem>(entity =>
        {
            entity.ToTable("disposal_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Disposal)
                .WithMany(d => d.Items)
                .HasForeignKey(e => e.DisposalId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.DisposalId);
            entity.HasIndex(e => e.ProductId);
        });

        // Transfer entity configuration
        modelBuilder.Entity<Transfer>(entity =>
        {
            entity.ToTable("transfers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TransferNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.TransferDate).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.FromOutlet)
                .WithMany()
                .HasForeignKey(e => e.FromOutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ToOutlet)
                .WithMany()
                .HasForeignKey(e => e.ToOutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.TransferNo).IsUnique();
            entity.HasIndex(e => e.TransferDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.FromOutletId);
            entity.HasIndex(e => e.ToOutletId);
        });

        // TransferItem entity configuration
        modelBuilder.Entity<TransferItem>(entity =>
        {
            entity.ToTable("transfer_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Transfer)
                .WithMany(t => t.Items)
                .HasForeignKey(e => e.TransferId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.TransferId);
            entity.HasIndex(e => e.ProductId);
        });

        // Cancellation entity configuration
        modelBuilder.Entity<Cancellation>(entity =>
        {
            entity.ToTable("cancellations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CancellationNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CancellationDate).IsRequired();
            entity.Property(e => e.DeliveryNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.DeliveredDate).IsRequired();
            entity.Property(e => e.Reason).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.CancellationNo).IsUnique();
            entity.HasIndex(e => e.CancellationDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.OutletId);
        });

        // DeliveryReturn entity configuration
        modelBuilder.Entity<DeliveryReturn>(entity =>
        {
            entity.ToTable("delivery_returns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReturnNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ReturnDate).IsRequired();
            entity.Property(e => e.DeliveryNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.DeliveredDate).IsRequired();
            entity.Property(e => e.Reason).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.ReturnNo).IsUnique();
            entity.HasIndex(e => e.ReturnDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.OutletId);
        });

        // DeliveryReturnItem entity configuration
        modelBuilder.Entity<DeliveryReturnItem>(entity =>
        {
            entity.ToTable("delivery_return_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.DeliveryReturn)
                .WithMany(dr => dr.Items)
                .HasForeignKey(e => e.DeliveryReturnId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.DeliveryReturnId);
            entity.HasIndex(e => e.ProductId);
        });

        // StockBF entity configuration
        modelBuilder.Entity<StockBF>(entity =>
        {
            entity.ToTable("stock_bf");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BFNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.BFDate).IsRequired();
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.RejectedBy)
                .WithMany()
                .HasForeignKey(e => e.RejectedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.BFNo).IsUnique();
            entity.HasIndex(e => new { e.OutletId, e.BFDate, e.ProductId }).IsUnique();
            entity.HasIndex(e => e.Status);
        });

        // ShowroomOpenStock entity configuration
        modelBuilder.Entity<ShowroomOpenStock>(entity =>
        {
            entity.ToTable("showroom_open_stock");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StockAsAt).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Outlet)
                .WithMany()
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.OutletId).IsUnique();
        });

        // LabelPrintRequest entity configuration
        modelBuilder.Entity<LabelPrintRequest>(entity =>
        {
            entity.ToTable("label_print_requests");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DisplayNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.PriceOverride).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.DisplayNo).IsUnique();
            entity.HasIndex(e => e.Date);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ProductId);
        });

        // Phase 7: Production & Stock entity configurations
        // Shift entity configuration
        modelBuilder.Entity<Shift>(entity =>
        {
            entity.ToTable("shifts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Code).HasMaxLength(10).IsRequired();
            entity.Property(e => e.StartTime).IsRequired();
            entity.Property(e => e.EndTime).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.DisplayOrder).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.DisplayOrder);
            entity.HasIndex(e => e.IsActive);
        });

        // DailyProduction entity configuration
        modelBuilder.Entity<DailyProduction>(entity =>
        {
            entity.ToTable("daily_productions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProductionNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ProductionDate).IsRequired();
            entity.Property(e => e.PlannedQty).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.ProducedQty).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.ShiftId).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Shift)
                .WithMany(s => s.DailyProductions)
                .HasForeignKey(e => e.ShiftId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.ProductionNo).IsUnique();
            entity.HasIndex(e => e.ProductionDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ProductId);
            entity.HasIndex(e => e.ShiftId);
        });

        // ProductionCancel entity configuration
        modelBuilder.Entity<ProductionCancel>(entity =>
        {
            entity.ToTable("production_cancels");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CancelNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CancelDate).IsRequired();
            entity.Property(e => e.ProductionNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CancelledQty).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.Reason).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.CancelNo).IsUnique();
            entity.HasIndex(e => e.CancelDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ProductId);
        });

        // StockAdjustment entity configuration
        modelBuilder.Entity<StockAdjustment>(entity =>
        {
            entity.ToTable("stock_adjustments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AdjustmentNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.AdjustmentDate).IsRequired();
            entity.Property(e => e.AdjustmentType).HasConversion<string>().IsRequired();
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.Reason).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.AdjustmentNo).IsUnique();
            entity.HasIndex(e => e.AdjustmentDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ProductId);
        });

        // DailyProductionPlan entity configuration
        modelBuilder.Entity<DailyProductionPlan>(entity =>
        {
            entity.ToTable("daily_production_plans");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlanNo).HasMaxLength(50).IsRequired();
            entity.Property(e => e.PlanDate).IsRequired();
            entity.Property(e => e.PlannedQty).HasColumnType("decimal(18,4)").IsRequired();
            entity.Property(e => e.Priority).HasConversion<string>().IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().IsRequired();
            entity.Property(e => e.Reference).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.PlanNo).IsUnique();
            entity.HasIndex(e => e.PlanDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ProductId);
        });
    }
}
