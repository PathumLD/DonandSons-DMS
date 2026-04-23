using System.Text.Json;
using DMS_Backend.Data;
using DMS_Backend.Models.Entities;
using DMS_Backend.Services.Interfaces;

namespace DMS_Backend.Services.Implementations;

public sealed class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuditLogService> _logger;

    public AuditLogService(ApplicationDbContext context, ILogger<AuditLogService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task LogChangeAsync(
        Guid? userId,
        string? email,
        string eventType,
        string? entityType,
        string? entityId,
        string? action,
        object? oldValues,
        object? newValues,
        string? ipAddress = null,
        string? userAgent = null,
        string? requestPath = null,
        string? requestMethod = null,
        int? statusCode = null,
        string? errorMessage = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Email = email,
                EventType = eventType,
                EntityType = entityType,
                EntityId = entityId,
                Action = action,
                OldValues = oldValues != null ? JsonDocument.Parse(JsonSerializer.Serialize(oldValues)) : null,
                NewValues = newValues != null ? JsonDocument.Parse(JsonSerializer.Serialize(newValues)) : null,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                RequestPath = requestPath,
                RequestMethod = requestMethod,
                StatusCode = statusCode,
                ErrorMessage = errorMessage,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create audit log");
        }
    }

    public Task LogEntityCreatedAsync(
        Guid? userId,
        string? email,
        string entityType,
        string entityId,
        object newValues,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        return LogChangeAsync(
            userId,
            email,
            "EntityCreated",
            entityType,
            entityId,
            "Create",
            null,
            newValues,
            ipAddress,
            cancellationToken: cancellationToken);
    }

    public Task LogEntityUpdatedAsync(
        Guid? userId,
        string? email,
        string entityType,
        string entityId,
        object oldValues,
        object newValues,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        return LogChangeAsync(
            userId,
            email,
            "EntityUpdated",
            entityType,
            entityId,
            "Update",
            oldValues,
            newValues,
            ipAddress,
            cancellationToken: cancellationToken);
    }

    public Task LogEntityDeletedAsync(
        Guid? userId,
        string? email,
        string entityType,
        string entityId,
        object oldValues,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        return LogChangeAsync(
            userId,
            email,
            "EntityDeleted",
            entityType,
            entityId,
            "Delete",
            oldValues,
            null,
            ipAddress,
            cancellationToken: cancellationToken);
    }
}
