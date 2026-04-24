using Microsoft.EntityFrameworkCore;
using DMS_Backend.Data;
using DMS_Backend.Models.DTOs.Permissions;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public sealed class PermissionService : IPermissionService
{
    private readonly ApplicationDbContext _context;

    public PermissionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PermissionDto>> GetAllAsync(
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Permissions.AsQueryable();

        // Note: Permissions don't have IsActive field, they're always available
        // The isActive parameter is kept for API compatibility

        return await query
            .OrderBy(p => p.Module)
            .ThenBy(p => p.Code)
            .Select(p => new PermissionDto
            {
                Id = p.Id,
                Code = p.Code,
                Module = p.Module,
                Description = p.Description ?? string.Empty,
                IsActive = true  // Permissions are always active
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<PermissionsByModuleDto>> GetGroupedByModuleAsync(
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var permissions = await GetAllAsync(isActive, cancellationToken);

        return permissions
            .GroupBy(p => p.Module)
            .Select(g => new PermissionsByModuleDto
            {
                Module = g.Key,
                Permissions = g.ToList()
            })
            .OrderBy(m => m.Module)
            .ToList();
    }
}
