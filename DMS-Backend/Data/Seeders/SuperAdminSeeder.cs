using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using DMS_Backend.Configuration;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Data.Seeders;

public sealed class SuperAdminSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly SuperAdminOptions _options;

    public SuperAdminSeeder(ApplicationDbContext context, IOptions<SuperAdminOptions> options)
    {
        _context = context;
        _options = options.Value;
    }

    public async Task SeedAsync()
    {
        // Check if super admin already exists
        var existingSuperAdmin = await _context.Users
            .FirstOrDefaultAsync(u => u.IsSuperAdmin);

        if (existingSuperAdmin != null)
            return;

        // Create super admin
        var superAdmin = new User
        {
            Id = Guid.NewGuid(),
            Email = _options.Email.Trim().ToLowerInvariant(),
            FirstName = _options.FirstName,
            LastName = _options.LastName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(_options.Password, 12),
            IsSuperAdmin = true,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _context.Users.AddAsync(superAdmin);
        await _context.SaveChangesAsync();
    }
}
