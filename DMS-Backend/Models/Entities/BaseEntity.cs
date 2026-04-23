namespace DMS_Backend.Models.Entities;

/// <summary>
/// Base entity with common audit fields and soft delete support
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedById { get; set; }
    public Guid? UpdatedById { get; set; }

    // Navigation properties (optional, will be configured in DbContext)
    public User? CreatedBy { get; set; }
    public User? UpdatedBy { get; set; }
}
