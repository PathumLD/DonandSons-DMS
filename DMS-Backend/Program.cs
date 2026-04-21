using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using DMS_Backend.Configuration;
using DMS_Backend.Data;
using DMS_Backend.Data.Seeders;
using DMS_Backend.Services.Implementations;
using DMS_Backend.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add configuration options
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<RedisOptions>(builder.Configuration.GetSection(RedisOptions.SectionName));
builder.Services.Configure<SuperAdminOptions>(builder.Configuration.GetSection(SuperAdminOptions.SectionName));

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Redis (with fallback for development)
var redisConfig = builder.Configuration.GetSection(RedisOptions.SectionName).Get<RedisOptions>();
IConnectionMultiplexer? redisConnection = null;
try
{
    var redisConfigOptions = ConfigurationOptions.Parse($"{redisConfig!.ConnectionString}");
    redisConfigOptions.AbortOnConnectFail = false;
    redisConfigOptions.ConnectTimeout = 5000;
    redisConfigOptions.SyncTimeout = 5000;
    redisConfigOptions.AsyncTimeout = 5000;
    
    redisConnection = ConnectionMultiplexer.Connect(redisConfigOptions);
    
    // Test the connection
    var db = redisConnection.GetDatabase();
    db.Ping();
    
    builder.Services.AddSingleton<IConnectionMultiplexer>(redisConnection);
    Console.WriteLine("✓ Connected to Redis successfully");
}
catch (Exception ex)
{
    redisConnection?.Dispose();
    Console.WriteLine($"⚠ Warning: Redis connection failed. Using in-memory fallback for refresh tokens.");
    Console.WriteLine($"   Redis error: {ex.Message}");
    Console.WriteLine($"   To enable Redis: Install Redis and start it on port 6379");
}

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

builder.Services.AddAuthorization();

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

// Register refresh token service (Redis or in-memory fallback)
if (redisConnection != null && redisConnection.IsConnected)
{
    builder.Services.AddSingleton<IRefreshTokenService, RedisRefreshTokenService>();
    Console.WriteLine("✓ Using Redis for refresh token storage");
}
else
{
    builder.Services.AddSingleton<IRefreshTokenService, InMemoryRefreshTokenService>();
    Console.WriteLine("⚠ Using in-memory refresh token storage (tokens lost on restart)");
}

// Register services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISystemLogService, SystemLogService>();
builder.Services.AddScoped<IAuthenticationLogService, AuthenticationLogService>();

// Register seeders
builder.Services.AddScoped<PermissionSeeder>();
builder.Services.AddScoped<SuperAdminSeeder>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Run migrations and seeders
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var permissionSeeder = scope.ServiceProvider.GetRequiredService<PermissionSeeder>();
    var superAdminSeeder = scope.ServiceProvider.GetRequiredService<SuperAdminSeeder>();

    try
    {
        // Apply migrations
        await context.Database.MigrateAsync();

        // Seed permissions first
        await permissionSeeder.SeedAsync();

        // Then seed super admin
        await superAdminSeeder.SeedAsync();

        Console.WriteLine("Database seeded successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred while seeding the database: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
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

app.Run();
