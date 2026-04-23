using Microsoft.AspNetCore.Authorization;

namespace DMS_Backend.Authorization;

/// <summary>
/// Authorization requirement for permission-based authorization
/// </summary>
public sealed class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}
