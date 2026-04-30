using System.Text;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;
using DMS_Backend.Authorization;
using DMS_Backend.Configuration;
using DMS_Backend.Data;
using DMS_Backend.Data.Seeders;
using DMS_Backend.Filters;
using DMS_Backend.Mapping;
using DMS_Backend.Middleware;
using DMS_Backend.Services.Implementations;
using DMS_Backend.Services.Interfaces;

// Configure Npgsql to use UTC timestamps
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", false);

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/dms-backend-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Starting DMS Backend API");

// Add configuration options
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<SuperAdminOptions>(builder.Configuration.GetSection(SuperAdminOptions.SectionName));
builder.Services.Configure<DevSeedOptions>(builder.Configuration.GetSection(DevSeedOptions.SectionName));

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.ConfigureWarnings(warnings => 
        warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// Add Memory Cache for application-wide caching
builder.Services.AddMemoryCache();

// Add JWT Authentication
var jwtConfig = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtConfig!.Issuer,
        ValidAudience = jwtConfig.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// Add Authorization with permission-based policies
builder.Services.AddAuthorization();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Register refresh token service (in-memory)
builder.Services.AddSingleton<IRefreshTokenService, InMemoryRefreshTokenService>();

// Register services
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISystemLogService, SystemLogService>();
builder.Services.AddScoped<IAuthenticationLogService, AuthenticationLogService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IDayLockService, DayLockService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Inventory services
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IUnitOfMeasureService, UnitOfMeasureService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IIngredientService, IngredientService>();

// Phase 4: Admin Master Data services
builder.Services.AddScoped<IOutletService, OutletService>();
builder.Services.AddScoped<IDeliveryTurnService, DeliveryTurnService>();
builder.Services.AddScoped<IDayTypeService, DayTypeService>();
builder.Services.AddScoped<IProductionSectionService, ProductionSectionService>();
builder.Services.AddScoped<ISectionConsumableService, SectionConsumableService>();
builder.Services.AddScoped<IOutletEmployeeService, OutletEmployeeService>();
builder.Services.AddScoped<ISystemSettingService, SystemSettingService>();
builder.Services.AddScoped<IApprovalQueueService, ApprovalQueueService>();

// Phase 4: Label, Pricing, Grid, Workflow, Security services
builder.Services.AddScoped<ILabelTemplateService, LabelTemplateService>();
builder.Services.AddScoped<ILabelSettingService, LabelSettingService>();
builder.Services.AddScoped<IRoundingRuleService, RoundingRuleService>();
builder.Services.AddScoped<IPriceListService, PriceListService>();
builder.Services.AddScoped<IGridConfigurationService, GridConfigurationService>();
builder.Services.AddScoped<IWorkflowConfigService, WorkflowConfigService>();
builder.Services.AddScoped<ISecurityPolicyService, SecurityPolicyService>();

// Phase 5a: Recipe services
builder.Services.AddScoped<IRecipeTemplateService, RecipeTemplateService>();
builder.Services.AddScoped<IRecipeService, RecipeService>();

// Phase 5b: DMS Planning services
builder.Services.AddScoped<IDefaultQuantityService, DefaultQuantityService>();
builder.Services.AddScoped<IDeliveryPlanService, DeliveryPlanService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IImmediateOrderService, ImmediateOrderService>();
builder.Services.AddScoped<IFreezerStockService, FreezerStockService>();

// Phase 5c: DMS Computed Views services
builder.Services.AddScoped<IDeliverySummaryService, DeliverySummaryService>();
builder.Services.AddScoped<IDashboardPivotService, DashboardPivotService>();
builder.Services.AddScoped<IProductionPlannerService, ProductionPlannerService>();
builder.Services.AddScoped<IStoresIssueNoteService, StoresIssueNoteService>();
builder.Services.AddScoped<IPrintService, PrintService>();
builder.Services.AddScoped<IReconciliationService, ReconciliationService>();

// Phase 6: Operations services
builder.Services.AddScoped<IDeliveryService, DeliveryService>();
builder.Services.AddScoped<IDisposalService, DisposalService>();
builder.Services.AddScoped<ITransferService, TransferService>();
builder.Services.AddScoped<ICancellationService, CancellationService>();
builder.Services.AddScoped<IDeliveryReturnService, DeliveryReturnService>();
builder.Services.AddScoped<IStockBFService, StockBFService>();
builder.Services.AddScoped<IShowroomOpenStockService, ShowroomOpenStockService>();
builder.Services.AddScoped<ILabelPrintRequestService, LabelPrintRequestService>();
builder.Services.AddScoped<IShowroomLabelRequestService, ShowroomLabelRequestService>();
builder.Services.AddScoped<IOperationApprovalService, OperationApprovalService>();

// Phase 7: Production & Stock services
builder.Services.AddScoped<IShiftService, ShiftService>();
builder.Services.AddScoped<IDailyProductionService, DailyProductionService>();
builder.Services.AddScoped<IProductionCancelService, ProductionCancelService>();
builder.Services.AddScoped<IStockAdjustmentService, StockAdjustmentService>();
builder.Services.AddScoped<IDailyProductionPlanService, DailyProductionPlanService>();
builder.Services.AddScoped<ICurrentStockService, CurrentStockService>();

// Register generic repository
builder.Services.AddScoped(typeof(DMS_Backend.Repositories.IRepository<>), typeof(DMS_Backend.Repositories.Repository<>));

// Register seeders
builder.Services.AddScoped<ComprehensivePermissionSeeder>();
builder.Services.AddScoped<SuperAdminSeeder>();
builder.Services.AddScoped<DevDataSeeder>();

// Register filters
builder.Services.AddScoped<AuditActionFilter>();
builder.Services.AddScoped<DayLockGuardFilter>();

builder.Services.AddControllers(options =>
{
    options.Filters.AddService<AuditActionFilter>();
    options.Filters.AddService<DayLockGuardFilter>();
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Add AutoMapper
// Note: Using AutoMapper 12.0.1 (last free version)
// Known vulnerability GHSA-rvv3-g6hj-g44x requires 25,000+ nested levels to exploit
// Our business domain (products, orders, inventory) doesn't have deep object graphs
// Suppressed in .csproj - consider migrating to Mapperly in future
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// Add OpenAPI/Swagger with Scalar UI
builder.Services.AddOpenApi();

var app = builder.Build();

// Run migrations and seeders
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var permissionSeeder = scope.ServiceProvider.GetRequiredService<ComprehensivePermissionSeeder>();
    var superAdminSeeder = scope.ServiceProvider.GetRequiredService<SuperAdminSeeder>();
    var devDataSeeder = scope.ServiceProvider.GetRequiredService<DevDataSeeder>();
    var devSeedOptions = builder.Configuration.GetSection(DevSeedOptions.SectionName).Get<DevSeedOptions>();

    try
    {
        // Apply migrations
        await context.Database.MigrateAsync();

        // Seed permissions first
        await permissionSeeder.SeedAsync();

        // Then seed super admin
        await superAdminSeeder.SeedAsync();

        // Seed dev data if enabled
        if (devSeedOptions?.Enabled == true)
        {
            Log.Information("Dev seed is enabled, seeding development data");
            await devDataSeeder.SeedAsync();
        }

        Log.Information("Database seeded successfully");
    }
    catch (Exception ex)
    {
        // Fail fast: a first-time run must apply migrations and seed permissions +
        // super admin. Starting the API with a half-initialised database hides
        // connection/config issues and breaks login / RBAC until someone notices.
        Log.Fatal(ex, "Database migration or seeding failed — fix PostgreSQL, connection string, and SuperAdmin config, then retry.");
        throw;
    }
}

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<ApiRequestLoggingMiddleware>();

// Map OpenAPI endpoint and enable Scalar UI
app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options
        .WithTitle("DMS Backend API")
        .WithTheme(Scalar.AspNetCore.ScalarTheme.Mars)
        .WithDefaultHttpClient(Scalar.AspNetCore.ScalarTarget.CSharp, Scalar.AspNetCore.ScalarClient.HttpClient);
});

// Disable HTTPS redirection in development to avoid CORS preflight issues
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Log.Information("DMS Backend API started successfully");
app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "DMS Backend API terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
