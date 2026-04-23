using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISystemLogService, SystemLogService>();
builder.Services.AddScoped<IAuthenticationLogService, AuthenticationLogService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IDayLockService, DayLockService>();

// Register generic repository
builder.Services.AddScoped(typeof(DMS_Backend.Repositories.IRepository<>), typeof(DMS_Backend.Repositories.Repository<>));

// Register seeders
builder.Services.AddScoped<PermissionSeeder>();
builder.Services.AddScoped<SuperAdminSeeder>();
builder.Services.AddScoped<DevDataSeeder>();

// Register filters
builder.Services.AddScoped<AuditActionFilter>();
builder.Services.AddScoped<DayLockGuardFilter>();

builder.Services.AddControllers(options =>
{
    options.Filters.AddService<AuditActionFilter>();
    options.Filters.AddService<DayLockGuardFilter>();
});

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

builder.Services.AddOpenApi();

var app = builder.Build();

// Run migrations and seeders
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var permissionSeeder = scope.ServiceProvider.GetRequiredService<PermissionSeeder>();
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
        Log.Error(ex, "An error occurred while seeding the database");
    }
}

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<ApiRequestLoggingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

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
